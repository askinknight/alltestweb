#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <microhttpd.h>
#include <mysql/mysql.h>
#include <time.h>

#define PORT 7071

typedef struct
{
    char username[100];
    time_t expiry;
} Session;

Session current_session = {"", 0};

// ตรวจสอบว่า session ยังคง valid อยู่หรือไม่
int is_session_valid()
{
    return (strlen(current_session.username) > 0 && time(NULL) < current_session.expiry);
}

// ฟังก์ชันสร้าง session ใหม่
void create_session(const char *username)
{
    strncpy(current_session.username, username, sizeof(current_session.username) - 1);
    current_session.username[sizeof(current_session.username) - 1] = '\0'; // เพิ่ม \0 ที่ท้าย string
    current_session.expiry = time(NULL) + 600;                             // หมดอายุใน 10 นาที
}

// ฟังก์ชันลบ session
void destroy_session()
{
    memset(&current_session, 0, sizeof(current_session));
}

// ฟังก์ชันเชื่อมต่อฐานข้อมูล
MYSQL *connect_db()
{
    MYSQL *conn = mysql_init(NULL);
    if (!mysql_real_connect(conn, "db", "root", "rootpassword", "mydatabase", 0, NULL, 0))
    {
        fprintf(stderr, "Database connection failed: %s\n", mysql_error(conn));
        return NULL;
    }
    return conn;
}

// ฟังก์ชันตรวจสอบข้อมูลล็อกอิน
int check_login(const char *username, const char *password)
{
    MYSQL *conn = connect_db();
    if (!conn)
        return 0;

    MYSQL_RES *res;
    MYSQL_ROW row;
    int success = 0;

    // สร้างคำสั่ง SQL โดยไม่ใช้ bind
    char query[512];
    snprintf(query, sizeof(query), "SELECT * FROM users WHERE username='%s' AND password='%s'", username, password);

    // ดำเนินการ query
    if (mysql_query(conn, query))
    {
        mysql_close(conn);
        return 0;
    }

    // เก็บผลลัพธ์จาก query
    res = mysql_store_result(conn);
    if (res)
    {
        if (mysql_num_rows(res) > 0)
        {
            success = 1; // พบข้อมูลผู้ใช้
        }
        mysql_free_result(res);
    }

    mysql_close(conn);

    return success;
}

// สมัครสมาชิก
int register_user(const char *username, const char *password)
{
    MYSQL *conn = connect_db();
    if (!conn)
        return 0;

    char query[512];
    snprintf(query, sizeof(query), "INSERT INTO users (username, password) VALUES ('%s', '%s')", username, password);

    int success = (mysql_query(conn, query) == 0);
    mysql_close(conn);
    return success;
}

// Handle Requests
enum MHD_Result respond(void *cls, struct MHD_Connection *connection,
                        const char *url, const char *method,
                        const char *version, const char *upload_data,
                        size_t *upload_data_size, void **con_cls)
{
    struct MHD_Response *response;
    int status_code = MHD_HTTP_OK;
    static char username[100];

    if (strcmp(method, "POST") == 0)
    {
        if (*con_cls == NULL)
        {
            *con_cls = malloc(512);
            return MHD_YES;
        }

        char *post_data = (char *)*con_cls;
        if (*upload_data_size > 0)
        {
            strncpy(post_data, upload_data, *upload_data_size);
            post_data[*upload_data_size] = '\0';
            *upload_data_size = 0;
            return MHD_YES;
        }

        char *username_ptr = strstr(post_data, "username=");
        char *password_ptr = strstr(post_data, "password=");

        if (username_ptr && password_ptr)
        {
            sscanf(username_ptr, "username=%99[^&]", username);
            char password[100];
            sscanf(password_ptr, "password=%99s", password);

            if (strcmp(url, "/login") == 0)
            {
                // ตรวจสอบการล็อกอิน
                if (check_login(username, password)) // เช็คว่า username และ password ถูกต้อง
                {
                    // สร้าง session ใหม่
                    create_session(username);
                    // ส่งผลลัพธ์หลังจากล็อกอินสำเร็จ
                    char *html = "<script>alert('✅ Login successful!'); window.location.href='/home';</script>";
                    response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
                    status_code = MHD_HTTP_OK; // ส่ง status 200 OK
                }
                else
                {
                    // กรณีที่ username หรือ password ผิดพลาด
                    char *html = "<script>alert('❌ Invalid username or password!'); window.location.href='/';</script>";
                    response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
                    status_code = MHD_HTTP_FORBIDDEN; // ส่ง status 403 Forbidden
                }
            }
            else if (strcmp(url, "/register") == 0)
            {
                if (register_user(username, password))
                {
                    char *html = "<script>alert('✅ Register successful!'); window.location.href='/';</script>";
                    response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
                }
                else
                {
                    char *html = "<script>alert('⚠️ Username already exists!'); window.location.href='/register';</script>";
                    response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
                }
            }
        }

        free(*con_cls);
        *con_cls = NULL;
        int ret = MHD_queue_response(connection, status_code, response);
        MHD_destroy_response(response);
        return ret;
    }

    if (strcmp(url, "/") == 0)
    {
        char *html = "<!DOCTYPE html>"
                     "<html lang='en'>"
                     "<head><meta charset='UTF-8'><title>Login</title>"
                     "<link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css' rel='stylesheet'>"
                     "</head>"
                     "<body class='d-flex justify-content-center align-items-center' style='height: 100vh;'>"
                     "<div class='card p-3' style='width: 20rem;'>"
                     "<h3 class='text-center'>Login</h3>"
                     "<form method='POST' action='/login'>"
                     "<input class='form-control my-2' type='text' name='username' placeholder='Username' required>"
                     "<input class='form-control my-2' type='password' name='password' placeholder='Password' required>"
                     "<button class='btn btn-primary w-100' type='submit'>Login</button>"
                     "</form><a href='/register' class='btn btn-link mt-2'>Register</a>"
                     "</div></body></html>";

        response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
    }
    else if (strcmp(url, "/register") == 0)
    {
        char *html = "<!DOCTYPE html>"
                     "<html lang='en'>"
                     "<head><meta charset='UTF-8'><title>Register</title>"
                     "<link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css' rel='stylesheet'>"
                     "</head>"
                     "<body class='d-flex justify-content-center align-items-center' style='height: 100vh;'>"
                     "<div class='card p-3' style='width: 20rem;'>"
                     "<h3 class='text-center'>Register</h3>"
                     "<form method='POST' action='/register'>"
                     "<input class='form-control my-2' type='text' name='username' placeholder='Username' required>"
                     "<input class='form-control my-2' type='password' name='password' placeholder='Password' required>"
                     "<button class='btn btn-success w-100' type='submit'>Register</button>"
                     "</form><a href='/' class='btn btn-link mt-2'>Back to Login</a>"
                     "</div></body></html>";

        response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
    }
    else if (strcmp(url, "/home") == 0)
    {
        if (strlen(current_session.username) == 0 || !is_session_valid())
        {
            char *html = "<script>alert('⚠️ Session expired! Please login again.'); window.location.href='/';</script>";
            response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
            status_code = MHD_HTTP_UNAUTHORIZED;
        }
        else
        {
            MYSQL *conn = connect_db();
            if (!conn)
            {
                response = MHD_create_response_from_buffer(0, "", MHD_RESPMEM_PERSISTENT);
                status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
            }
            else
            {
                if (mysql_query(conn, "SELECT username FROM users") != 0)
                {
                    response = MHD_create_response_from_buffer(0, "", MHD_RESPMEM_PERSISTENT);
                    status_code = MHD_HTTP_INTERNAL_SERVER_ERROR;
                }
                else
                {
                    MYSQL_RES *res = mysql_store_result(conn);
                    MYSQL_ROW row;

                    char html[4096] = "<!DOCTYPE html>"
                                      "<html lang='en'>"
                                      "<head><meta charset='UTF-8'><title>Home</title>"
                                      "<link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css' rel='stylesheet'>"
                                      "</head>"
                                      "<body class='d-flex justify-content-center align-items-center' style='height: 100vh;'>"
                                      "<div class='card p-3' style='width: 25rem;'>"
                                      "<h3 class='text-center'>Welcome to Home</h3>"
                                      "<ul class='list-group'>";

                    while ((row = mysql_fetch_row(res)))
                    {
                        strcat(html, "<li class='list-group-item'>");
                        strcat(html, row[0]);
                        strcat(html, "</li>");
                    }

                    strcat(html, "</ul><a href='/logout' class='btn btn-danger mt-3'>Logout</a></div></body></html>");

                    mysql_free_result(res);
                    mysql_close(conn);

                    response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
                }
            }
        }
    }
    else if (strcmp(url, "/logout") == 0)
    {
        destroy_session(); // ล้าง session
        char *html = "<script>alert('✅ Logged out successfully!'); window.location.href='/';</script>";
        response = MHD_create_response_from_buffer(strlen(html), html, MHD_RESPMEM_MUST_COPY);
    }

    else
    {
        response = MHD_create_response_from_buffer(0, "", MHD_RESPMEM_PERSISTENT);
        status_code = MHD_HTTP_NOT_FOUND;
    }

    int ret = MHD_queue_response(connection, status_code, response);
    MHD_destroy_response(response);
    return ret;
}

// Main
int main()
{
    struct MHD_Daemon *server = MHD_start_daemon(MHD_USE_INTERNAL_POLLING_THREAD, PORT, NULL, NULL, &respond, NULL, MHD_OPTION_END);

    if (!server)
    {
        fprintf(stderr, "Failed to start server\n");
        return 1;
    }

    printf("✅ Server running on http://localhost:%d\n", PORT);

    while (1)
    {
        sleep(1);
    }

    MHD_stop_daemon(server);
    return 0;
}

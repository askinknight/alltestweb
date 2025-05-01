-- สร้างตารางสำหรับผู้ใช้
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'guest') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้างผู้ใช้ตัวอย่าง
INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'admin');
INSERT INTO users (username, password, role) VALUES ('user1', 'user1', 'user');
INSERT INTO users (username, password, role) VALUES ('guest1', 'guest1', 'guest');

CREATE TABLE IF NOT EXISTS role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'user', 'guest') NOT NULL,
    path VARCHAR(255) NOT NULL
);

-- เพิ่มข้อมูลสิทธิ์ของแต่ละ role
INSERT INTO role_permissions (role, path) VALUES 
('admin', '/'), ('admin', '/dashboard'), ('admin', '/settings'), 
('admin', '/reports'), ('admin', '/admin'), ('admin', '/logs'),

('user', '/'), ('user', '/dashboard'), ('user', '/settings'), 
('user', '/reports'), ('user', '/logs'),

('guest', '/'), ('guest', '/dashboard'), ('guest', '/reports');

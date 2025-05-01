const express = require("express");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2/promise");
const app = express();
const PORT = 80;

// ตั้งค่า Session
app.use(session({
    name: "cookie",
    secret: "secretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false,
        maxAge: 60 * 1000 
    }
}));


// ใช้ EJS & Static Files
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
const getRoleMap = require("./roleMap");

// เชื่อมต่อฐานข้อมูล
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
app.set("db", pool);

app.use(async (req, res, next) => {
    if (!req.app.locals.roleMap || Object.keys(req.app.locals.roleMap).length === 0) {
        console.log("🔄 Reloading role map...");
        req.app.locals.roleMap = await getRoleMap(req.app);
    }
    next();
});


// Router
app.use("/", require("./routes/index"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/settings", require("./routes/settings"));
app.use("/reports", require("./routes/reports"));
app.use("/admin", require("./routes/admin"));
app.use("/logs", require("./routes/logs"));
app.use("/auth", require("./routes/auth"));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

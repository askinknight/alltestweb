const express = require("express");
const router = express.Router();
const getRoleMap = require("../roleMap"); // ดึงฟังก์ชันโหลด roleMap

// หน้า Login
router.get("/login", (req, res) => {
    res.render("login"); // ควรตรงกับไฟล์ login.ejs ที่อยู่ใน views
});

// หน้า Logout
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/");
        }
        res.clearCookie("cookie");
        res.redirect("/auth/login");
    });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const pool = req.app.get("db"); // ใช้ pool จาก app.js

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM users WHERE username = ? AND password = ?",
            [username, password]
        );

        if (rows.length > 0) {
            req.session.user = rows[0]; // ตั้ง session ให้ผู้ใช้
            
            // โหลด roleMap ใหม่
            req.app.locals.roleMap = await getRoleMap(req.app);
            console.log("🔄 Role Map Reloaded:", req.app.locals.roleMap);

            res.redirect("/"); // ไปหน้าแรกหลังจากล็อกอินสำเร็จ
        } else {
            res.render("login", { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("เกิดข้อผิดพลาดในระบบ");
    }
});

module.exports = router;

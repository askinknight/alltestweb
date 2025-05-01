const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/auth/login"); // ถ้าไม่ได้ล็อกอินให้ไปที่หน้า Login
    }

    const userRole = req.session.user.role;
    const roleMap = req.app.locals.roleMap || {}; // ถ้า roleMap ยังไม่มี ให้ใช้ object ว่างแทน
    
    if (roleMap[userRole] && Array.isArray(roleMap[userRole]) && roleMap[userRole].includes("/reports")) {
        return res.render("reports", {
            session: req.session,
            roleMap: roleMap
        });
    }

    res.redirect("/auth/login"); // ถ้าไม่มีสิทธิ์ให้กลับไปหน้า Login
});

module.exports = router;

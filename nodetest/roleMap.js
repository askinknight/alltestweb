async function getRoleMap(app) {
    const pool = app.get("db"); // ดึง pool จาก app.js
    const query = "SELECT role, path FROM role_permissions";

    try {
        const [rows] = await pool.query(query);

        const roleMap = rows.reduce((acc, row) => {
            if (!acc[row.role]) {
                acc[row.role] = [];
            }
            acc[row.role].push(row.path);
            return acc;
        }, {});

        return roleMap;
    } catch (error) {
        console.error("Error fetching role map:", error);
        return {};
    }
}

module.exports = getRoleMap;

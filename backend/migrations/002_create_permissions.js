const pool = require("../src/config/database");

async function createPermissionsTable() {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description VARCHAR(255) NOT NULL,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);

    } catch (error) {
        console.error("failed to create permissions table")
        console.error(error.message)
    }
}

module.exports = createPermissionsTable;
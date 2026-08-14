const pool = require("../src/config/database");

async function createAdminUserTable() {
  try {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM(
              'main_admin',
              'sub_admin'
            ) NOT NULL DEFAULT 'sub_admin',
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP
      )
            `);

    console.log("created Admin users table ...!");
  } catch (error) {
    console.error("failed to create admin users table");
    console.error(error.message);
  }
}

createAdminUserTable();

const pool = require("../src/config/database");

async function createAdminUserPermissionsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admin_user_permissions (
        admin_user_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (admin_user_id, permission_id),

        CONSTRAINT fk_admin_user_permissions_admin
          FOREIGN KEY (admin_user_id)
          REFERENCES admin_users(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,

        CONSTRAINT fk_admin_user_permissions_permission
          FOREIGN KEY (permission_id)
          REFERENCES permissions(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE
      )
            `);

    console.log("created Admin user permissions table ...!");
  } catch (error) {
    console.error("failed create admin user permissions table");
    console.error(error.message);
  }
}

createAdminUserPermissionsTable();

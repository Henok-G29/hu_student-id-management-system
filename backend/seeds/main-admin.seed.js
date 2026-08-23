const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

// SEED MAIN ADMIN
async function seedMainAdmin() {
  const fullName = process.env.MAIN_ADMIN_NAME;
  const email = process.env.MAIN_ADMIN_EMAIL;
  const password = process.env.MAIN_ADMIN_PASSWORD;

  // VALIDATE ENVIRONMENT VARIABLES
  if (!fullName || !email || !password) {
    throw new Error(
      "MAIN_ADMIN_NAME, MAIN_ADMIN_EMAIL and " +
        "MAIN_ADMIN_PASSWORD are required.",
    );
  }

  // VALIDATE PASSWORD
  if (password.length < 8) {
    throw new Error("Main admin password must contain at least 8 characters.");
  }

  // CLEAN VALUES
  const cleanFullName = fullName.trim();
  const cleanEmail = email.trim().toLowerCase();

  // HASH PASSWORD
  const passwordHash = await bcrypt.hash(password, 12);

  // CREATE / UPDATE MAIN ADMIN
  await pool.execute(
    `
            INSERT INTO admin_users (
                full_name,
                email,
                password_hash,
                role,
                is_active
            )

            VALUES (
                ?,
                ?,
                ?,
                'main_admin',
                TRUE
            )

            ON DUPLICATE KEY UPDATE
                full_name = VALUES(full_name),
                password_hash = VALUES(password_hash),
                role = 'main_admin',
                is_active = TRUE
        `,
    [cleanFullName, cleanEmail, passwordHash],
  );

}

module.exports = seedMainAdmin;

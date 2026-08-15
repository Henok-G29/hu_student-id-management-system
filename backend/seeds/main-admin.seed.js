const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

async function seedMainAdmin() {
  try {

    const fullName = process.env.MAIN_ADMIN_NAME;
    const email = process.env.MAIN_ADMIN_EMAIL;
    const password = process.env.MAIN_ADMIN_PASSWORD;

    if (!fullName || !email || !password) {
      throw new Error(
        "MAIN_ADMIN_NAME, MAIN_ADMIN_EMAIL and MAIN_ADMIN_PASSWORD are required.",
      );
    }

    if (password.length < 8) {
      throw new Error(
        "Main admin password must contain at least 8 characters.",
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `
        INSERT INTO admin_users (
          full_name,
          email,
          password_hash,
          role,
          is_active
        )
        VALUES (?, ?, ?, 'main_admin', TRUE)
        ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          password_hash = VALUES(password_hash),
          role = 'main_admin',
          is_active = TRUE
      `,
      [fullName, email, passwordHash],
    );

  } catch (error) {
    console.error("Main admin seed failed:");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

seedMainAdmin();

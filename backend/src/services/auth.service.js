const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function loginAdmin(email, password) {
  const [rows] = await pool.execute(
    `
        SELECT id, full_name, email, password_hash, role, is_active
        FROM admin_users
        WHERE email = ?
        LIMIT 1
        `,
        [email],
  );

  if (rows.length === 0) {
    return {
        success: false,
        reason: "INVALID_CREDENTIALS",
    };
  }

  const admin = rows[0];

  if (!admin.is_active) {
    return {
        success: false,
        reason: "ACCOUNT_INACTIVE",
    };
  }

  const passwordMatches = await bcrypt.compare(
    password, admin.password_hash,
  );

  if (!passwordMatches) {
    return {
        success: false,
        reason: "INVALID_CREDENTIALS",
    };
  }

  const token = jwt.sign(
    {
      sub: admin.id,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );

  return {
    success: true,
    token,
    admin: {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
    },
  };
}

module.exports = {
    loginAdmin,
}

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// REGISTER SUB-ADMIN
async function registerSubAdmin({ full_name, email, password }) {

  // Check whether email already exists
  const [existingRows] = await pool.execute(
    `
      SELECT id
      FROM admin_users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  if (existingRows.length > 0) {
    return {
      success: false,
      reason: "EMAIL_EXISTS",
    };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create sub-admin
  //
  // IMPORTANT:
  // role is ALWAYS sub_admin.
  // New sub-admin receives NO permissions.
  const [result] = await pool.execute(
    `
      INSERT INTO admin_users (
        full_name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES (?, ?, ?, 'sub_admin', 1)
    `,
    [full_name, email, passwordHash],
  );

  return {
    success: true,
    admin: {
      id: result.insertId,
      full_name,
      email,
      role: "sub_admin",
      is_active: 1,
    },
  };
}

// LOGIN ADMIN
async function loginAdmin(email, password) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        is_active
      FROM admin_users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  // Admin not found
  if (rows.length === 0) {
    return {
      success: false,
      reason: "INVALID_CREDENTIALS",
    };
  }

  const admin = rows[0];

  // Check account status
  if (!admin.is_active) {
    return {
      success: false,
      reason: "ACCOUNT_INACTIVE",
    };
  }

  // Compare password
  const passwordMatches = await bcrypt.compare(password, admin.password_hash);

  if (!passwordMatches) {
    return {
      success: false,
      reason: "INVALID_CREDENTIALS",
    };
  }

  // Create JWT
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

  // Success
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
  registerSubAdmin,
  loginAdmin,
};

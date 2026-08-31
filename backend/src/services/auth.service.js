const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

// GET ADMIN PERMISSIONS

async function getAdminPermissions(adminId) {
  const [rows] = await pool.execute(
    `
      SELECT
        p.name
      FROM permissions p
      INNER JOIN admin_user_permissions aup
        ON aup.permission_id = p.id
      WHERE aup.admin_user_id = ?
      ORDER BY p.id ASC
    `,
    [adminId],
  );

  return rows.map((row) => row.name);
}

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
      permissions: [],
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

  // GET PERMISSIONS

  let permissions = [];

  if (admin.role === "sub_admin") {
    permissions = await getAdminPermissions(admin.id);
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

  // Return authenticated admin

  return {
    success: true,
    token,

    admin: {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      permissions,
    },
  };
}

// GET CURRENT ADMIN

async function getCurrentAdmin(adminId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        full_name,
        email,
        role,
        is_active
      FROM admin_users
      WHERE id = ?
      LIMIT 1
    `,
    [adminId],
  );

  // Admin not found

  if (rows.length === 0) {
    return null;
  }

  const admin = rows[0];

  // GET CURRENT PERMISSIONS
  let permissions = [];

  if (admin.role === "sub_admin") {
    permissions = await getAdminPermissions(admin.id);
  }

  return {
    id: admin.id,
    full_name: admin.full_name,
    email: admin.email,
    role: admin.role,
    is_active: admin.is_active,
    permissions,
  };
}


module.exports = {
  registerSubAdmin,
  loginAdmin,
  getCurrentAdmin,
  getAdminPermissions,
};

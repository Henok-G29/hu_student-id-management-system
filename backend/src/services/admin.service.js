const pool = require("../config/database");

// GET ALL ADMINS
async function getAllAdmins() {
  const [rows] = await pool.execute(`
    SELECT
      id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    FROM admin_users
    ORDER BY created_at DESC
  `);

  return rows;
}

// GET ADMIN BY ID

async function getAdminById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        full_name,
        email,
        role,
        is_active,
        created_at,
        updated_at
      FROM admin_users
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

// GET ADMIN BY EMAIL

async function getAdminByEmail(email) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        full_name,
        email,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
      FROM admin_users
      WHERE email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] || null;
}

// CREATE SUB-ADMIN

// The controller is responsible for hashing the password.

async function createSubAdmin(adminData) {
  const { full_name, email, password_hash } = adminData;

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
    [full_name, email, password_hash],
  );

  return {
    id: result.insertId,
    full_name,
    email,
    role: "sub_admin",
    is_active: 1,
  };
}

// UPDATE ADMIN

async function updateAdmin(id, adminData) {
  const { full_name, email } = adminData;

  const [result] = await pool.execute(
    `
      UPDATE admin_users
      SET
        full_name = ?,
        email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [full_name, email, id],
  );

  return result;
}

// UPDATE ADMIN PASSWORD
//
// Receives a HASHED password.
async function updateAdminPassword(id, passwordHash) {
  const [result] = await pool.execute(
    `
      UPDATE admin_users
      SET
        password_hash = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [passwordHash, id],
  );

  return result;
}

// UPDATE ADMIN STATUS

async function updateAdminStatus(id, isActive) {
  const [result] = await pool.execute(
    `
      UPDATE admin_users
      SET
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [isActive, id],
  );

  return result;
}

// DELETE ADMIN
//
// Deletes permissions first, then the admin account.
async function deleteAdmin(id) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Remove assigned permissions

    await connection.execute(
      `
        DELETE FROM admin_user_permissions
        WHERE admin_user_id = ?
      `,
      [id],
    );

    // Delete admin account

    const [result] = await connection.execute(
      `
          DELETE FROM admin_users
          WHERE id = ?
        `,
      [id],
    );

    await connection.commit();

    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// GET ALL PERMISSIONS

async function getAllPermissions() {
  const [rows] = await pool.execute(`
    SELECT
      id,
      name
    FROM permissions
    ORDER BY id ASC
  `);

  return rows;
}

// GET ADMIN PERMISSIONS
async function getAdminPermissions(adminId) {
  const [rows] = await pool.execute(
    `
      SELECT
        p.id,
        p.name
      FROM permissions p
      INNER JOIN admin_user_permissions aup
        ON aup.permission_id = p.id
      WHERE aup.admin_user_id = ?
      ORDER BY p.id ASC
    `,
    [adminId],
  );

  return rows;
}

// GET ADMIN PERMISSION IDS

async function getAdminPermissionIds(adminId) {
  const [rows] = await pool.execute(
    `
      SELECT
        permission_id
      FROM admin_user_permissions
      WHERE admin_user_id = ?
      ORDER BY permission_id ASC
    `,
    [adminId],
  );

  return rows.map((row) => Number(row.permission_id));
}

// UPDATE ADMIN PERMISSIONS
//
// Replaces all existing permissions.

async function updateAdminPermissions(adminId, permissionIds) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Remove current permissions

    await connection.execute(
      `
        DELETE FROM admin_user_permissions
        WHERE admin_user_id = ?
      `,
      [adminId],
    );

    // Add new permissions

    if (permissionIds.length > 0) {
      const values = permissionIds.map((permissionId) => [
        adminId,
        permissionId,
      ]);

      await connection.query(
        `
          INSERT INTO admin_user_permissions (
            admin_user_id,
            permission_id
          )
          VALUES ?
        `,
        [values],
      );
    }

    await connection.commit();

    // Return final permission IDs
    return await getAdminPermissionIds(adminId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


module.exports = {
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  createSubAdmin,
  updateAdmin,
  updateAdminPassword,
  updateAdminStatus,
  deleteAdmin,
  getAllPermissions,
  getAdminPermissions,
  getAdminPermissionIds,
  updateAdminPermissions,
};

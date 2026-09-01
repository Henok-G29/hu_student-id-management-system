const pool = require("./src/config/database");

// MIGRATIONS
const createAdminUserTable = require("./migrations/001_create_admin_users");

const createPermissionsTable = require("./migrations/002_create_permissions");

const createAdminUserPermissionsTable = require("./migrations/003_create_admin_user_permissions");

const createStudentsTable = require("./migrations/004_create_students");

const createIdCardReceiptsTable = require("./migrations/005_create_id_card_receipts");

// SEEDS
const seedPermissions = require("./seeds/permissions.seed");

const seedMainAdmin = require("./seeds/main-admin.seed");

// DATABASE SETUP
async function setupDatabase() {
  try {
    // 1. ADMIN USERS
    await createAdminUserTable();

    // 2. PERMISSIONS
    await createPermissionsTable();

    // 3. ADMIN USER PERMISSIONS
    await createAdminUserPermissionsTable();

    // 4. STUDENTS
    await createStudentsTable();

    // 5. ID CARD RECEIPTS
    await createIdCardReceiptsTable();

    // 6. SEED PERMISSIONS
    await seedPermissions();

    // 7. SEED MAIN ADMIN
    await seedMainAdmin();

  } catch (error) {
    console.error(error);
  } finally {

    // CLOSE DATABASE CONNECTION
    await pool.end();
  }
}

// RUN SETUP
setupDatabase();

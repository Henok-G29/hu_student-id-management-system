const pool = require("../config/database");

// REQUIRE PERMISSION

// Usage:
//
// router.get(
//   "/students",
//   authenticate,
//   requirePermission("students.view"),
//   controller
// );
//
// Rules:
//
// 1. User must be authenticated.
// 2. Main admin automatically has access.
// 3. Sub-admin must have the requested permission.
// 4. Missing permission → 403.

function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {

      // 1. AUTHENTICATION CHECK
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // 2. VALIDATE PERMISSION NAME
      if (
        !permissionName ||
        typeof permissionName !== "string"
      ) {
        return res.status(500).json({
          success: false,
          message: "Invalid permission configuration.",
        });
      }

      // 3. MAIN ADMIN BYPASS

      // Main admin does not need permission
      // records in admin_user_permissions.
      //
      // This means the main admin always has
      // full access to protected features.

      if (req.user.role === "main_admin") {
        return next();
      }

      // 4. ONLY SUB-ADMINS CONTINUE
      if (req.user.role !== "sub_admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied.",
        });
      }

      // 5. CHECK SUB-ADMIN PERMISSION
      const [rows] = await pool.execute(
        `
          SELECT p.id
          FROM permissions p

          INNER JOIN admin_user_permissions aup
            ON aup.permission_id = p.id

          WHERE aup.admin_user_id = ?
            AND p.name = ?

          LIMIT 1
        `,
        [
          req.user.id,
          permissionName,
        ],
      );

      // 6. PERMISSION DENIED
      if (rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to perform this action.",
        });
      }

      // 7. PERMISSION GRANTED
      return next();

    } catch (error) {
      console.error(
        "Permission middleware error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  };
}

module.exports = {
  requirePermission,
};

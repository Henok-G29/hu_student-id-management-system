const pool = require("../config/database");

function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
        
      // 1. Make sure user is authenticated

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      // 2. Check user's permission

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
        [req.user.id, permissionName],
      );

      // 3. Permission denied

      if (rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action.",
        });
      }

      // 4. Permission granted

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);

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

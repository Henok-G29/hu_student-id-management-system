const pool = require("../config/database");

async function requireStudentStatusPermission(req, res, next) {
  try {
    // ==========================================
    // MAKE SURE USER IS AUTHENTICATED
    // ==========================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ==========================================
    // MAIN ADMIN BYPASS
    // ==========================================
    // Main admin automatically has permission
    // to change student status.
    //
    // No record is required in
    // admin_user_permissions.
    // ==========================================

    if (req.user.role === "main_admin") {
      return next();
    }

    // ==========================================
    // ONLY SUB-ADMINS CONTINUE
    // ==========================================

    if (req.user.role !== "sub_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    // ==========================================
    // GET REQUESTED STATUS
    // ==========================================

    const { status } = req.body;

    // ==========================================
    // DETERMINE REQUIRED PERMISSION
    // ==========================================

    let requiredPermission;

    switch (status) {
      case "approved":
        requiredPermission = "students.approve";
        break;

      case "rejected":
        requiredPermission = "students.reject";
        break;

      case "pending":
        requiredPermission = "students.update";
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Status must be pending, approved, or rejected.",
        });
    }

    // ==========================================
    // CHECK SUB-ADMIN PERMISSION
    // ==========================================

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
      [req.user.id, requiredPermission],
    );

    // ==========================================
    // PERMISSION DENIED
    // ==========================================

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to change the student status to " +
          status +
          ".",
        required_permission: requiredPermission,
      });
    }

    // ==========================================
    // PERMISSION GRANTED
    // ==========================================

    return next();
  } catch (error) {
    console.error("Student status permission middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

module.exports = {
  requireStudentStatusPermission,
};

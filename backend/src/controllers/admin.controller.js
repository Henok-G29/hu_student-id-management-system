const adminService = require("../services/admin.service");

// HELPER: CHECK MAIN ADMIN
function requireMainAdmin(req, res) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return false;
  }

  if (req.user.role !== "main_admin") {
    res.status(403).json({
      success: false,
      message: "Only the main admin can perform this action.",
    });

    return false;
  }

  return true;
}


// HELPER: VALIDATE DATABASE ID
function isValidId(id) {
  return /^\d+$/.test(String(id));
}

// GET ALL ADMINS
async function getAllAdmins(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const admins = await adminService.getAllAdmins();


    return res.status(200).json({
      success: true,
      count: admins.length,
      admins,
    });

  } catch (error) {

    console.error("Get all admins error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load administrators.",
    });
  }
}

// GET ADMIN BY ID
async function getAdminById(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const { id } = req.params;


    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }


    const admin = await adminService.getAdminById(id);


    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }


    return res.status(200).json({
      success: true,
      admin,
    });

  } catch (error) {

    console.error("Get admin by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load administrator.",
    });
  }
}

// CREATE SUB ADMIN
async function createSubAdmin(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const {
      full_name,
      email,
      password_hash,
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !password_hash) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, email and password hash are required.",
      });
    }


    const cleanFullName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Validate name
    if (cleanFullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain at least 2 characters.",
      });
    }

    // Validate email
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Check duplicate email
    const existingAdmin =
      await adminService.getAdminByEmail(cleanEmail);


    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }


    // Create sub-admin
    const admin =
      await adminService.createSubAdmin({
        full_name: cleanFullName,
        email: cleanEmail,
        password_hash,
      });


    return res.status(201).json({
      success: true,
      message: "Sub-admin created successfully.",
      admin,
    });

  } catch (error) {

    console.error("Create sub-admin error:", error);


    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Unable to create sub-admin.",
    });
  }
}

// UPDATE ADMIN
// Password has its own endpoint.
async function updateAdmin(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const { id } = req.params;


    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }


    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message:
          "Use the account settings feature to update your own account.",
      });
    }


    const {
      full_name,
      email,
    } = req.body;


    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required.",
      });
    }


    const cleanFullName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();


    if (cleanFullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain at least 2 characters.",
      });
    }


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Check target admin exists
    const existingAdmin =
      await adminService.getAdminById(id);


    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }


    // Only sub-admin accounts should be managed here
    if (existingAdmin.role !== "sub_admin") {
      return res.status(403).json({
        success: false,
        message:
          "The main admin account cannot be managed here.",
      });
    }


    // Check duplicate email
    const emailOwner =
      await adminService.getAdminByEmail(cleanEmail);


    if (
      emailOwner &&
      Number(emailOwner.id) !== Number(id)
    ) {
      return res.status(409).json({
        success: false,
        message:
          "An administrator with this email already exists.",
      });
    }


    await adminService.updateAdmin(id, {
      full_name: cleanFullName,
      email: cleanEmail,
    });


    const updatedAdmin =
      await adminService.getAdminById(id);


    return res.status(200).json({
      success: true,
      message: "Administrator updated successfully.",
      admin: updatedAdmin,
    });

  } catch (error) {

    console.error("Update admin error:", error);


    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "An administrator with this email already exists.",
      });
    }


    return res.status(500).json({
      success: false,
      message: "Unable to update administrator.",
    });
  }
}

// UPDATE ADMIN STATUS
// Main admin only.
async function updateAdminStatus(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const { id } = req.params;
    const { is_active } = req.body;


    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }


    // Validate boolean / 0 / 1
    if (
      !(
        is_active === true ||
        is_active === false ||
        is_active === 1 ||
        is_active === 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "is_active must be true, false, 1, or 0.",
      });
    }

    // Prevent self-deactivation
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message:
          "The main admin cannot deactivate their own account.",
      });
    }


    const admin =
      await adminService.getAdminById(id);


    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }


    if (admin.role !== "sub_admin") {
      return res.status(403).json({
        success: false,
        message:
          "The main admin account cannot be managed here.",
      });
    }


    const activeValue =
      is_active === true || is_active === 1
        ? 1
        : 0;


    await adminService.updateAdminStatus(
      id,
      activeValue,
    );


    const updatedAdmin =
      await adminService.getAdminById(id);


    return res.status(200).json({
      success: true,
      message:
        activeValue === 1
          ? "Sub-admin activated successfully."
          : "Sub-admin deactivated successfully.",
      admin: updatedAdmin,
    });

  } catch (error) {

    console.error(
      "Update admin status error:",
      error,
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update administrator status.",
    });
  }
}

// DELETE ADMIN
// Only sub-admin accounts can be deleted.
async function deleteAdmin(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const { id } = req.params;


    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }


    // Prevent deleting own account
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message:
          "The main admin cannot delete their own account.",
      });
    }


    const admin =
      await adminService.getAdminById(id);


    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }


    // Main admin cannot be deleted
    if (admin.role !== "sub_admin") {
      return res.status(403).json({
        success: false,
        message:
          "The main admin account cannot be deleted.",
      });
    }


    await adminService.deleteAdmin(id);


    return res.status(200).json({
      success: true,
      message: "Sub-admin deleted successfully.",
    });

  } catch (error) {

    console.error("Delete admin error:", error);


    return res.status(500).json({
      success: false,
      message: "Unable to delete administrator.",
    });
  }
}

// GET ALL PERMISSIONS
// Returns the complete permission list for the checkbox UI.
async function getAllPermissions(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const permissions =
      await adminService.getAllPermissions();


    return res.status(200).json({
      success: true,
      count: permissions.length,
      permissions,
    });

  } catch (error) {

    console.error(
      "Get all permissions error:",
      error,
    );


    return res.status(500).json({
      success: false,
      message: "Unable to load permissions.",
    });
  }
}


// GET ADMIN PERMISSIONS
// Returns the permissions currently assigned to a sub-admin.
async function getAdminPermissions(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const { id } = req.params;


    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }


    const admin =
      await adminService.getAdminById(id);


    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }


    const permissions =
      await adminService.getAdminPermissions(id);


    return res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
        is_active: admin.is_active,
      },
      count: permissions.length,
      permissions,
    });

  } catch (error) {

    console.error(
      "Get admin permissions error:",
      error,
    );


    return res.status(500).json({
      success: false,
      message: "Unable to load administrator permissions.",
    });
  }
}


// UPDATE ADMIN PERMISSIONS
// This replaces all existing permissions.
async function updateAdminPermissions(req, res) {
  try {

    if (!requireMainAdmin(req, res)) {
      return;
    }


    const { id } = req.params;
    const { permission_ids } = req.body;


    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID.",
      });
    }


    // Validate permission_ids
    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({
        success: false,
        message:
          "permission_ids must be an array.",
      });
    }

    // Prevent duplicate permission IDs
    const uniquePermissionIds =
      [...new Set(permission_ids)];


    // Validate every permission ID
    const validPermissionIds =
      uniquePermissionIds.every(
        (permissionId) =>
          Number.isInteger(permissionId) &&
          permissionId > 0,
      );


    if (!validPermissionIds) {
      return res.status(400).json({
        success: false,
        message:
          "All permission IDs must be positive integers.",
      });
    }


    // Check admin exists
    const admin =
      await adminService.getAdminById(id);


    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    // Only sub-admin permissions are managed here.
    if (admin.role !== "sub_admin") {
      return res.status(403).json({
        success: false,
        message:
          "Permissions cannot be manually assigned to the main admin.",
      });
    }


    // Get all available permissions
    const allPermissions =
      await adminService.getAllPermissions();


    const availablePermissionIds =
      new Set(
        allPermissions.map(
          (permission) => Number(permission.id),
        ),
      );


    // Make sure requested permissions exist
    const invalidPermissionIds =
      uniquePermissionIds.filter(
        (permissionId) =>
          !availablePermissionIds.has(
            Number(permissionId),
          ),
      );


    if (invalidPermissionIds.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "One or more permission IDs do not exist.",
        invalid_permission_ids:
          invalidPermissionIds,
      });
    }

    // Replace permissions
    const updatedPermissionIds =
      await adminService.updateAdminPermissions(
        id,
        uniquePermissionIds,
      );


    // Get permission details for response
    const updatedPermissions =
      await adminService.getAdminPermissions(id);


    return res.status(200).json({
      success: true,
      message:
        "Administrator permissions updated successfully.",
      admin_id: Number(id),
      permission_ids: updatedPermissionIds,
      permissions: updatedPermissions,
    });

  } catch (error) {

    console.error(
      "Update admin permissions error:",
      error,
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to update administrator permissions.",
    });
  }
}


module.exports = {
  getAllAdmins,
  getAdminById,
  createSubAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
  getAllPermissions,
  getAdminPermissions,
  updateAdminPermissions,

};

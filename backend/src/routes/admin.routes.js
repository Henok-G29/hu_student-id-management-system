const express = require("express");

const { authenticate } = require("../middleware/auth.middleware");

const {
  getAllAdmins,
  getAdminById,
  createSubAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
  getAllPermissions,
  getAdminPermissions,
  updateAdminPermissions,
} = require("../controllers/admin.controller");

const router = express.Router();

// ADMIN MANAGEMENT
router.get("/", authenticate, getAllAdmins);


// PERMISSIONS
router.get("/permissions", authenticate, getAllPermissions);

// GET ADMIN PERMISSIONS
router.get("/:id/permissions", authenticate, getAdminPermissions);

// UPDATE ADMIN PERMISSIONS
router.put("/:id/permissions", authenticate, updateAdminPermissions);

// ADMIN CREATION
// CREATE SUB-ADMIN
router.post("/", authenticate, createSubAdmin);

// ADMIN MANAGEMENT
router.get("/:id", authenticate, getAdminById);

// UPDATE ADMIN
router.put("/:id", authenticate, updateAdmin);

// UPDATE ADMIN STATUS
router.patch("/:id/status", authenticate, updateAdminStatus);

// DELETE ADMIN
router.delete("/:id", authenticate, deleteAdmin);


module.exports = router;

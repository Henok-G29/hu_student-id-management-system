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
// IMPORTANT:
// This MUST come before /:id
router.get("/permissions", authenticate, getAllPermissions);

// GET ADMIN PERMISSIONS
// GET /api/admins/:id/permissions
router.get("/:id/permissions", authenticate, getAdminPermissions);

// UPDATE ADMIN PERMISSIONS
// PUT /api/admins/:id/permissions
router.put("/:id/permissions", authenticate, updateAdminPermissions);

// ADMIN CREATION
// CREATE SUB-ADMIN
// POST /api/admins
router.post("/", authenticate, createSubAdmin);

// ADMIN MANAGEMENT
// GET ADMIN BY ID
// GET /api/admins/:id
router.get("/:id", authenticate, getAdminById);

// UPDATE ADMIN
// PUT /api/admins/:id
router.put("/:id", authenticate, updateAdmin);

// UPDATE ADMIN STATUS
// PATCH /api/admins/:id/status
router.patch("/:id/status", authenticate, updateAdminStatus);

// DELETE ADMIN
// DELETE /api/admins/:id
router.delete("/:id", authenticate, deleteAdmin);


module.exports = router;

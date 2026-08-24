const express = require("express");

const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/permission.middleware");
const {
  requireStudentStatusPermission,
} = require("../middleware/student-status-permission.middleware");

const {
  getAllStudents,
  searchStudent,
  getStudentById,
  updateStudent,
  getStudentPhoto,
  updateStudentStatus,
  deleteStudent,
} = require("../controllers/student.controller");

const router = express.Router();

// GET ALL STUDENTS
router.get(
  "/",
  authenticate,
  requirePermission("students.view"),
  getAllStudents,
);

// SEARCH STUDENT
router.get(
  "/search",
  authenticate,
  requirePermission("students.search"),
  searchStudent,
);

// GET STUDENT DETAILS
router.get(
  "/:id",
  authenticate,
  requirePermission("students.view"),
  getStudentById,
);

// UPDATE STUDENT
router.put(
  "/:id",
  authenticate,
  requirePermission("students.update"),
  updateStudent,
);

// GET STUDENT PHOTO
router.get(
  "/:id/photo",
  authenticate,
  requirePermission("students.view"),
  getStudentPhoto,
);

// UPDATE STUDENT STATUS
router.patch(
  "/:id/status",
  authenticate,
  requireStudentStatusPermission,
  updateStudentStatus,
);

// DELETE STUDENT
router.delete(
  "/:id",
  authenticate,
  requirePermission("students.delete"),
  deleteStudent,
);

module.exports = router;

const express = require("express");

const { authenticate } = require("../middleware/auth.middleware");

const {
  requirePermission,
} = require("../middleware/permission.middleware");

const {
  getAllIdCardReceipts,
  getIdCardReceiptById,
  getIdCardReceiptByStudentId,
  searchIdCardReceipts,
  createIdCardReceipt,
  deleteIdCardReceipt,
  exportReceiptsToExcel,
  verifyStudentForReceipt,
  receiveIdCardFromWeb,
} = require("../controllers/idCardReceipt.controller");

const router = express.Router();



// PUBLIC STUDENT RECEIPT

router.get(
  "/public/student/:student_id",
  verifyStudentForReceipt,
);

router.post(
  "/public/receive",
  receiveIdCardFromWeb,
);



// GET ALL RECEIPTS
router.get(
  "/",
  authenticate,
  requirePermission("receipts.view"),
  getAllIdCardReceipts,
);

// SEARCH RECEIPTS

router.get(
  "/search",
  authenticate,
  requirePermission("receipts.view"),
  searchIdCardReceipts,
);

// EXPORT RECEIPTS TO EXCEL

router.get(
  "/export",
  authenticate,
  requirePermission("receipts.export"),
  exportReceiptsToExcel,
);

// GET RECEIPT BY STUDENT ID

router.get(
  "/student/:student_id",
  authenticate,
  requirePermission("receipts.view"),
  getIdCardReceiptByStudentId,
);

// GET RECEIPT BY DATABASE ID

router.get(
  "/:id",
  authenticate,
  requirePermission("receipts.view"),
  getIdCardReceiptById,
);

// CREATE RECEIPT
router.post(
  "/",
  authenticate,
  requirePermission("receipts.create"),
  createIdCardReceipt,
);

// DELETE RECEIPT

router.delete(
  "/:id",
  authenticate,
  requirePermission("receipts.delete"),
  deleteIdCardReceipt,
);

module.exports = router;
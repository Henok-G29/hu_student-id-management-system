const ExcelJS = require("exceljs");

const idCardReceiptService = require("../services/idCardReceipt.service");

// VALIDATE DATABASE ID
function isValidId(id) {
  return /^\d+$/.test(String(id));
}

// VALIDATE STUDENT ID
function isValidStudentId(studentId) {
  return /^\d{6}$/.test(String(studentId));
}

// GET ALL RECEIPTS

async function getAllIdCardReceipts(req, res) {
  try {
    const receipts =
      await idCardReceiptService.getAllIdCardReceipts();

    return res.status(200).json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    console.error("Get all ID card receipts error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load ID card receipts.",
    });
  }
}


// PUBLIC: VERIFY STUDENT FOR ID CARD RECEIPT

async function verifyStudentForReceipt(req, res) {
  try {
    const { student_id } = req.params;

    // Validate Student ID
    if (!isValidStudentId(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    // Find student
    const student =
      await idCardReceiptService.getStudentForReceipt(
        student_id,
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Check whether the student already received the card
    const existingReceipt =
      await idCardReceiptService.checkStudentReceiptStatus(
        student_id,
      );

    if (existingReceipt) {
      return res.status(409).json({
        success: false,
        already_received: true,
        message:
          "This student has already received their ID card.",
        received_at: existingReceipt.received_at,
        received_via: existingReceipt.received_via,
      });
    }

    // Return student information WITHOUT PHOTO
    return res.status(200).json({
      success: true,
      already_received: false,
      student: {
        student_id: student.student_id,
        full_name: student.full_name,
        program: student.program,
        educational_level: student.educational_level,
        department: student.department,
      },
    });
  } catch (error) {
    console.error(
      "Public student receipt verification error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify student information.",
    });
  }
}

// PUBLIC: STUDENT RECEIVES ID CARD

async function receiveIdCardFromWeb(req, res) {
  try {
    const {
      student_id,
    } = req.body;

    // Validate Student ID
    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    if (!isValidStudentId(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    // Find student from students table
    const student =
      await idCardReceiptService.getStudentForReceipt(
        student_id,
      );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Check duplicate receipt
    const existingReceipt =
      await idCardReceiptService.checkStudentReceiptStatus(
        student_id,
      );

    if (existingReceipt) {
      return res.status(409).json({
        success: false,
        already_received: true,
        message:
          "This student has already received their ID card.",
        received_at: existingReceipt.received_at,
        received_via: existingReceipt.received_via,
      });
    }

    // Create receipt
    const receipt =
      await idCardReceiptService.createIdCardReceipt({
        student_id: student.student_id,
        full_name: student.full_name,
        program: student.program,
        educational_level: student.educational_level,
        department: student.department,
        received_via: "web",
      });

    return res.status(201).json({
      success: true,
      message:
        "Your ID card receipt has been recorded successfully.",
      receipt,
    });
  } catch (error) {
    console.error(
      "Public web ID card receipt error:",
      error,
    );

    // Database UNIQUE constraint protection
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        already_received: true,
        message:
          "This student has already received their ID card.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to record ID card receipt.",
    });
  }
}

// GET RECEIPT BY ID

async function getIdCardReceiptById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receipt ID.",
      });
    }

    const receipt =
      await idCardReceiptService.getIdCardReceiptById(id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "ID card receipt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error("Get ID card receipt error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load ID card receipt.",
    });
  }
}

// GET RECEIPT BY STUDENT ID

async function getIdCardReceiptByStudentId(req, res) {
  try {
    const { student_id } = req.params;

    if (!isValidStudentId(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    const receipt =
      await idCardReceiptService.getIdCardReceiptByStudentId(
        student_id,
      );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "ID card receipt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      receipt,
    });
  } catch (error) {
    console.error(
      "Get ID card receipt by student ID error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load ID card receipt.",
    });
  }
}

// SEARCH RECEIPTS
async function searchIdCardReceipts(req, res) {
  try {
    const { student_id } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    if (!isValidStudentId(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    const receipts =
      await idCardReceiptService.searchIdCardReceipts(
        student_id,
      );

    return res.status(200).json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    console.error(
      "Search ID card receipts error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Unable to search ID card receipts.",
    });
  }
}

// CREATE RECEIPT

async function createIdCardReceipt(req, res) {
  try {
    const {
      student_id,
      full_name,
      program,
      educational_level,
      department,
      received_via,
    } = req.body;

    // ======================================
    // REQUIRED FIELDS
    // ======================================

    if (
      !student_id ||
      !full_name ||
      !program ||
      !educational_level ||
      !department ||
      !received_via
    ) {
      return res.status(400).json({
        success: false,
        message: "All receipt information fields are required.",
      });
    }

    // ======================================
    // VALIDATE STUDENT ID
    // ======================================

    if (!isValidStudentId(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    // ======================================
    // VALIDATE RECEIVED VIA
    // ======================================

    const allowedReceivedVia = [
      "telegram",
      "web",
    ];

    if (!allowedReceivedVia.includes(received_via)) {
      return res.status(400).json({
        success: false,
        message: "Invalid received_via value.",
      });
    }

    // ======================================
    // CHECK DUPLICATE RECEIPT
    // ======================================

    const existingReceipt =
      await idCardReceiptService.hasIdCardReceipt(
        student_id,
      );

    if (existingReceipt) {
      return res.status(409).json({
        success: false,
        message:
          "An ID card receipt already exists for this student.",
      });
    }

    // ======================================
    // CREATE RECEIPT
    // ======================================

    const receipt =
      await idCardReceiptService.createIdCardReceipt({
        student_id: student_id.trim(),
        full_name: full_name.trim(),
        program: program.trim(),
        educational_level:
          educational_level.trim(),
        department: department.trim(),
        received_via,
      });

    return res.status(201).json({
      success: true,
      message:
        "ID card receipt created successfully.",
      receipt,
    });
  } catch (error) {
    console.error(
      "Create ID card receipt error:",
      error,
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "An ID card receipt already exists for this student.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create ID card receipt.",
    });
  }
}

// DELETE RECEIPT

async function deleteIdCardReceipt(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receipt ID.",
      });
    }

    // Check receipt exists
    const receipt =
      await idCardReceiptService.getIdCardReceiptById(
        id,
      );

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "ID card receipt not found.",
      });
    }

    await idCardReceiptService.deleteIdCardReceipt(id);

    return res.status(200).json({
      success: true,
      message:
        "ID card receipt deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete ID card receipt error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete ID card receipt.",
    });
  }
}

// EXPORT RECEIPTS TO EXCEL

async function exportReceiptsToExcel(req, res) {
  try {
    // ======================================
    // GET RECEIPT DATA
    // ======================================

    const receipts =
      await idCardReceiptService.getReceiptsForExport();

    // ======================================
    // CREATE WORKBOOK
    // ======================================

    const workbook = new ExcelJS.Workbook();

    workbook.creator =
      "HU Student ID Management System";

    workbook.created = new Date();

    // ======================================
    // CREATE WORKSHEET
    // ======================================

    const worksheet =
      workbook.addWorksheet(
        "ID Card Receipts",
      );

    // ======================================
    // COLUMNS
    // ======================================

    worksheet.columns = [
      {
        header: "Student ID",
        key: "student_id",
        width: 15,
      },
      {
        header: "Full Name",
        key: "full_name",
        width: 30,
      },
      {
        header: "Program",
        key: "program",
        width: 20,
      },
      {
        header: "Educational Level",
        key: "educational_level",
        width: 25,
      },
      {
        header: "Department",
        key: "department",
        width: 35,
      },
      {
        header: "Received At",
        key: "received_at",
        width: 25,
      },
      {
        header: "Received Via",
        key: "received_via",
        width: 18,
      },
    ];

    // ======================================
    // ADD DATA
    // ======================================

    receipts.forEach((receipt) => {
      worksheet.addRow({
        student_id: receipt.student_id,
        full_name: receipt.full_name,
        program: receipt.program,
        educational_level:
          receipt.educational_level,
        department: receipt.department,
        received_at:
          receipt.received_at,
        received_via:
          receipt.received_via,
      });
    });

    // ======================================
    // STYLE HEADER
    // ======================================

    const headerRow =
      worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      size: 12,
    };

    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // ======================================
    // STYLE DATA ROWS
    // ======================================

    worksheet.eachRow(
      (row, rowNumber) => {
        row.alignment = {
          vertical: "middle",
        };

        if (rowNumber > 1) {
          row.height = 22;
        }
      },
    );

    // ======================================
    // FORMAT DATE COLUMN
    // ======================================

    worksheet
      .getColumn("received_at")
      .numFmt =
      "yyyy-mm-dd hh:mm:ss";

    // ======================================
    // FREEZE HEADER
    // ======================================

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // ======================================
    // AUTO FILTER
    // ======================================

    worksheet.autoFilter = {
      from: "A1",
      to: "H1",
    };

    // ======================================
    // RESPONSE HEADERS
    // ======================================

    const fileName =
      `id-card-receipts-${Date.now()}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );

    // ======================================
    // SEND EXCEL FILE
    // ======================================

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(
      "Export receipts to Excel error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to export ID card receipt records.",
    });
  }
}


module.exports = {
  getAllIdCardReceipts,
  getIdCardReceiptById,
  getIdCardReceiptByStudentId,
  searchIdCardReceipts,
  createIdCardReceipt,
  deleteIdCardReceipt,
  exportReceiptsToExcel,

  // Public student receipt
  verifyStudentForReceipt,
  receiveIdCardFromWeb,
};
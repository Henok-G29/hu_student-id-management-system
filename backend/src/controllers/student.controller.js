const { message } = require("telegraf/filters");
const studentService = require("../services/student.service");
const idCardReceiptService = require("../services/idCardReceipt.service")
const bot = require("../bot");

// GET ALL STUDENTS
async function getAllStudents(req, res) {
  try {
    const students = await studentService.getAllStudents();

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Get all students error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load students.",
    });
  }
}

// SEARCH STUDENT
async function searchStudent(req, res) {
  try {
    const { student_id } = req.query;

    // Validate Student ID exists
    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    // Validate Student ID format
    if (!/^\d{6}$/.test(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    // Search database
    const student = await studentService.searchStudentByStudentId(student_id);

    // Student not found
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Student found
    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Search student error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search student.",
    });
  }
}

// GET STUDENT BY DATABASE ID
async function getStudentById(req, res) {
  try {
    const { id } = req.params;

    // Validate database ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    // Find student

    const student = await studentService.getStudentById(id);

    // Student not found

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Student found
    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Get student by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load student.",
    });
  }
}

// UPDATE STUDENT

async function updateStudent(req, res) {
  try {
    const { id } = req.params;

    const { full_name, student_id, program, educational_level, department } =
      req.body;

    // Validate database ID

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    // Validate required fields
    if (
      !full_name ||
      !student_id ||
      !program ||
      !educational_level ||
      !department
    ) {
      return res.status(400).json({
        success: false,
        message: "All student information fields are required.",
      });
    }

    // Validate Student ID
    if (!/^\d{6}$/.test(student_id)) {
      return res.status(400).json({
        success: false,
        message: "Student ID must contain exactly 6 digits.",
      });
    }

    // Check student exists
    const existingStudent = await studentService.getStudentById(id);

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // Update student
    await studentService.updateStudent(id, {
      full_name: full_name.trim(),
      student_id: student_id.trim(),
      program: program.trim(),
      educational_level: educational_level.trim(),
      department: department.trim(),
    });

    // Get updated student
    const updatedStudent = await studentService.getStudentById(id);

    // Success

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("Update student error:", error);

    // Duplicate Student ID
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Student ID already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update student.",
    });
  }
}

// GET STUDENT PHOTO
async function getStudentPhoto(req, res) {
  try {
    const { id } = req.params;

    // ======================================
    // VALIDATE DATABASE ID
    // ======================================

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    // FIND STUDENT
    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // CHECK PHOTO
    if (!student.photo_file_id) {
      return res.status(404).json({
        success: false,
        message: "Student photo not found.",
      });
    }

    // GET TELEGRAM FILE INFORMATION
    const file = await bot.telegram.getFile(student.photo_file_id);

    if (!file || !file.file_path) {
      return res.status(404).json({
        success: false,
        message: "Unable to retrieve student photo.",
      });
    }

    // TELEGRAM FILE URL
    const botToken = process.env.BOT_TOKEN;

    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;

    // DOWNLOAD PHOTO FROM TELEGRAM
    const response = await fetch(photoUrl);

    if (!response.ok) {
      throw new Error(`Telegram photo request failed: ${response.status}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // SEND IMAGE TO BROWSER
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "image/jpeg",
    );

    res.setHeader("Content-Length", imageBuffer.length);

    res.setHeader("Cache-Control", "private, max-age=300");

    return res.send(imageBuffer);
  } catch (error) {
    console.error("Get student photo error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load student photo.",
    });
  }
}

// UPDATE STUDENT STATUS
async function updateStudentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // VALIDATE DATABASE ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    // VALIDATE STATUS
    const allowedStatuses = [
      "pending",
      "approved",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be pending, approved, or rejected.",
      });
    }

    // CHECK STUDENT EXISTS
    const existingStudent =
      await studentService.getStudentById(id);

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // UPDATE STATUS
    await studentService.updateStudentStatus(
      id,
      status,
    );

    // GET UPDATED STUDENT
    const updatedStudent =
      await studentService.getStudentById(id);

    // SUCCESS
    return res.status(200).json({
      success: true,
      message: "Student status updated successfully.",
      student: updatedStudent,
    });

  } catch (error) {

    console.error(
      "Update student status error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update student status.",
    });
  }
}

// DELETE STUDENT
async function deleteStudent(req, res) {
  try {
    const { id } = req.params;

    // VALIDATE DATABASE ID
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    // FIND STUDENT
    const student = await studentService.getStudentById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    // CHECK ID CARD RECEIPT
    const hasReceipt =
      await idCardReceiptService.hasIdCardReceipt(
        student.student_id,
      );

    // PROTECT HISTORICAL RECORD
    if (hasReceipt) {
      return res.status(409).json({
        success: false,
        message:
          "This student cannot be deleted because an ID card receipt already exists.",
      });
    }

    // DELETE STUDENT
    await studentService.deleteStudent(id);

    // SUCCESS
    return res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
    });

  } catch (error) {
    console.error("Delete student error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete student.",
    });
  }
}


module.exports = {
  getAllStudents,
  searchStudent,
  getStudentById,
  updateStudent,
  getStudentPhoto,
  updateStudentStatus,
  deleteStudent,
};

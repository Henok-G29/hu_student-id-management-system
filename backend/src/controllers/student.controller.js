const studentService = require("../services/student.service");

// GET ALL STUDENTS
async function getAllStudents(req, res) {

  try {

    const students =
      await studentService.getAllStudents();


    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {

    console.error(
      "Get all students error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Unable to load students."
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
        message: "Student ID is required."
      });
    }


    // Validate Student ID format
    if (!/^\d{6}$/.test(student_id)) {

      return res.status(400).json({
        success: false,
        message:
          "Student ID must contain exactly 6 digits."
      });
    }


    // Search database
    const student =
      await studentService
        .searchStudentByStudentId(student_id);


    // Student not found
    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }


    // Student found
    return res.status(200).json({
      success: true,
      student
    });

  } catch (error) {

    console.error(
      "Search student error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Unable to search student."
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
        message: "Invalid student ID."
      });
    }


    // Find student

    const student =
      await studentService.getStudentById(id);


    // Student not found

    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }


    // Student found
    return res.status(200).json({
      success: true,
      student
    });

  } catch (error) {

    console.error(
      "Get student by ID error:",
      error
    );


    return res.status(500).json({
      success: false,
      message: "Unable to load student."
    });
  }
}


// UPDATE STUDENT

async function updateStudent(req, res) {

  try {

    const { id } = req.params;


    const {
      full_name,
      student_id,
      program,
      educational_level,
      department
    } = req.body;


    // Validate database ID

    if (!/^\d+$/.test(id)) {

      return res.status(400).json({
        success: false,
        message: "Invalid student ID."
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
        message:
          "All student information fields are required."
      });
    }


    // Validate Student ID
    if (!/^\d{6}$/.test(student_id)) {

      return res.status(400).json({
        success: false,
        message:
          "Student ID must contain exactly 6 digits."
      });
    }


    // Check student exists
    const existingStudent =
      await studentService.getStudentById(id);


    if (!existingStudent) {

      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    // Update student
    await studentService.updateStudent(
      id,
      {
        full_name: full_name.trim(),
        student_id: student_id.trim(),
        program: program.trim(),
        educational_level:
          educational_level.trim(),
        department:
          department.trim()
      }
    );


    // Get updated student
    const updatedStudent =
      await studentService.getStudentById(id);


    // Success

    return res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      student: updatedStudent
    });

  } catch (error) {

    console.error(
      "Update student error:",
      error
    );


    // Duplicate Student ID
    if (error.code === "ER_DUP_ENTRY") {

      return res.status(409).json({
        success: false,
        message:
          "Student ID already exists."
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to update student."
    });
  }
}


// GET STUDENT PHOTO

async function getStudentPhoto(req, res) {

  try {

    const { id } = req.params;


    const student =
      await studentService.getStudentById(id);


    if (!student) {

      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }


    return res.status(501).json({
      success: false,
      message:
        "Student photo API will be implemented after Telegram bot integration."
    });

  } catch (error) {

    console.error(
      "Get student photo error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to load student photo."
    });
  }
}


module.exports = {
  getAllStudents,
  searchStudent,
  getStudentById,
  updateStudent,
  getStudentPhoto
};

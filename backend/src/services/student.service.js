const pool = require("../config/database");

// CREATE STUDENT
async function createStudent(studentData) {
  const {
    telegram_user_id,
    full_name,
    student_id,
    photo_file_id,
    program,
    educational_level,
    department,
  } = studentData;

  const [result] = await pool.execute(
    `
      INSERT INTO students (
        telegram_user_id,
        full_name,
        student_id,
        photo_file_id,
        program,
        educational_level,
        department,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `,
    [
      telegram_user_id,
      full_name,
      student_id,
      photo_file_id,
      program,
      educational_level,
      department,
    ],
  );

  return {
    id: result.insertId,
    telegram_user_id,
    full_name,
    student_id,
    photo_file_id,
    program,
    educational_level,
    department,
    status: "pending",
  };
}

// GET ALL STUDENTS
async function getAllStudents() {
  const [rows] = await pool.execute(`
    SELECT
      id,
      telegram_user_id,
      full_name,
      student_id,
      photo_file_id,
      program,
      educational_level,
      department,
      status,
      created_at,
      updated_at
    FROM students
    ORDER BY created_at DESC
  `);

  return rows;
}

// SEARCH STUDENT BY STUDENT ID
async function searchStudentByStudentId(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        telegram_user_id,
        full_name,
        student_id,
        photo_file_id,
        program,
        educational_level,
        department,
        status,
        created_at,
        updated_at
      FROM students
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId],
  );

  return rows[0] || null;
}

// GET STUDENT BY DATABASE ID
async function getStudentById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        telegram_user_id,
        full_name,
        student_id,
        photo_file_id,
        program,
        educational_level,
        department,
        status,
        created_at,
        updated_at
      FROM students
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

// UPDATE STUDENT
async function updateStudent(id, studentData) {
  const {
    full_name,
    student_id,
    program,
    educational_level,
    department,
  } = studentData;

  const [result] = await pool.execute(
    `
      UPDATE students
      SET
        full_name = ?,
        student_id = ?,
        program = ?,
        educational_level = ?,
        department = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [
      full_name,
      student_id,
      program,
      educational_level,
      department,
      id,
    ],
  );

  return result;
}

// UPDATE STUDENT STATUS
async function updateStudentStatus(id, status) {
  const allowedStatuses = [
    "pending",
    "approved",
    "rejected",
  ];

  // Validate status at service level too
  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid student status.");
  }

  const [result] = await pool.execute(
    `
      UPDATE students
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [status, id],
  );

  return result;
}

// CHECK ID CARD RECEIPT
async function hasIdCardReceipt(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT id
      FROM id_card_receipts
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  return rows.length > 0;
}

// DELETE STUDENT
async function deleteStudent(id) {
  const [result] = await pool.execute(
    `
      DELETE FROM students
      WHERE id = ?
    `,
    [id],
  );

  return result;
}


module.exports = {
  createStudent,
  getAllStudents,
  searchStudentByStudentId,
  getStudentById,
  updateStudent,
  updateStudentStatus,
  hasIdCardReceipt,
  deleteStudent,
};
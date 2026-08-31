const pool = require("../config/database");

// CREATE ID CARD RECEIPT
async function createIdCardReceipt(receiptData) {
  const {
    student_id,
    full_name,
    program,
    educational_level,
    department,
    received_via,
  } = receiptData;

  const [result] = await pool.execute(
    `
      INSERT INTO id_card_receipts (
        student_id,
        full_name,
        program,
        educational_level,
        department,
        received_via
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      student_id,
      full_name,
      program,
      educational_level,
      department,
      received_via,
    ],
  );

  return {
    id: result.insertId,
    student_id,
    full_name,
    program,
    educational_level,
    department,
    received_via,
  };
}

// GET ALL ID CARD RECEIPTS

async function getAllIdCardReceipts() {
  const [rows] = await pool.execute(`
    SELECT
      id,
      student_id,
      full_name,
      program,
      educational_level,
      department,
      received_at,
      received_via,
      created_at
    FROM id_card_receipts
    ORDER BY created_at DESC
  `);

  return rows;
}

// GET STUDENT FOR PUBLIC ID CARD RECEIPT

async function getStudentForReceipt(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        student_id,
        full_name,
        program,
        educational_level,
        department
      FROM students
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId],
  );

  return rows[0] || null;
}

// CHECK IF STUDENT ALREADY RECEIVED CARD

async function checkStudentReceiptStatus(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        student_id,
        received_at,
        received_via
      FROM id_card_receipts
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId],
  );

  return rows[0] || null;
}



// GET RECEIPT DATA FOR EXCEL EXPORT

async function getReceiptsForExport() {
  const [rows] = await pool.execute(`
    SELECT
      student_id,
      full_name,
      program,
      educational_level,
      department,
      received_at,
      received_via
    FROM id_card_receipts
    ORDER BY received_at DESC
  `);

  return rows;
}

// GET RECEIPT BY DATABASE ID
async function getIdCardReceiptById(id) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        student_id,
        full_name,
        program,
        educational_level,
        department,
        received_at,
        received_via,
        created_at
      FROM id_card_receipts
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

// GET RECEIPT BY STUDENT ID

async function getIdCardReceiptByStudentId(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        student_id,
        full_name,
        program,
        educational_level,
        department,
        received_at,
        received_via,
        created_at
      FROM id_card_receipts
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId],
  );

  return rows[0] || null;
}

// SEARCH RECEIPTS
async function searchIdCardReceipts(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        student_id,
        full_name,
        program,
        educational_level,
        department,
        received_at,
        received_via,
        created_at
      FROM id_card_receipts
      WHERE student_id = ?
      ORDER BY created_at DESC
    `,
    [studentId],
  );

  return rows;
}

// CHECK EXISTING RECEIPT

async function hasIdCardReceipt(studentId) {
  const [rows] = await pool.execute(
    `
      SELECT id
      FROM id_card_receipts
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId],
  );

  return rows.length > 0;
}

// DELETE RECEIPT

async function deleteIdCardReceipt(id) {
  const [result] = await pool.execute(
    `
      DELETE FROM id_card_receipts
      WHERE id = ?
    `,
    [id],
  );

  return result;
}

module.exports = {
  createIdCardReceipt,
  getAllIdCardReceipts,
  getStudentForReceipt,
  checkStudentReceiptStatus,
  getReceiptsForExport,
  getIdCardReceiptById,
  getIdCardReceiptByStudentId,
  searchIdCardReceipts,
  hasIdCardReceipt,
  deleteIdCardReceipt,

  verifyStudentForReceipt: getStudentForReceipt, // Alias for clarity
  receiveIdCardFromWeb: createIdCardReceipt, // Alias for clarity
};
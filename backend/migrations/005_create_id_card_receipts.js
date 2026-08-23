const pool = require("../src/config/database");

async function createIdCardReceiptsTable() {
  try {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS id_card_receipts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(6) NOT NULL UNIQUE,
            full_name VARCHAR(255) NOT NULL,

            program VARCHAR(50) NOT NULL,
            educational_level VARCHAR(50) NOT NULL,
            department VARCHAR(150) NOT NULL,

            received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            received_via ENUM(
              'telegram',
              'web'
            ) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_id_card_receipts_student
              FOREIGN KEY (student_id)
              REFERENCES students(student_id)
              ON UPDATE CASCADE
              ON DELETE RESTRICT
      )
    `);
    
  } catch (error) {
    console.error("failed to create id_card_receipts table")
    console.error(error.message)
  } 
}

module.exports = createIdCardReceiptsTable;
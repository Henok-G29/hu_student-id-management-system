const pool = require("../src/config/database");

async function createStudentsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,

        telegram_user_id BIGINT NOT NULL,

        full_name VARCHAR(255) NOT NULL,

        student_id VARCHAR(6) NOT NULL UNIQUE,

        photo_file_id TEXT NOT NULL,

        program VARCHAR(50) NOT NULL,

        educational_level VARCHAR(50) NOT NULL,

        department VARCHAR(150) NOT NULL,

        status ENUM(
          'pending',
          'approved',
          'rejected'
        ) NOT NULL DEFAULT 'pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Students table created ..!");
  } catch (error) {
    console.error("Failed to create students table:");
    console.error(error.message);
  }
  
}

createStudentsTable();

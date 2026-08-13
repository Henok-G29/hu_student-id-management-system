const pool = require("./src/config/database");

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL database connected  ...!");

    connection.release();
  } catch (error) {
    console.error("MySQL database connection failed ...!");
    console.error(error.message);
  }
}

testDatabaseConnection();

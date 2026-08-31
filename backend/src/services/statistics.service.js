const pool = require("../config/database");

// GET PUBLIC REGISTRATION STATISTICS
async function getRegistrationStatistics() {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
    FROM students
  `);

  const statistics = rows[0];

  return {
    total: Number(statistics.total || 0),
    pending: Number(statistics.pending || 0),
    approved: Number(statistics.approved || 0),
    rejected: Number(statistics.rejected || 0),
  };
}

module.exports = {
  getRegistrationStatistics,
};

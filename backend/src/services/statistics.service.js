const pool = require("../config/database");

// GET PUBLIC REGISTRATION + ID CARD STATISTICS
async function getRegistrationStatistics() {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS total,

      SUM(
        CASE
          WHEN status = 'pending' THEN 1
          ELSE 0
        END
      ) AS pending,

      SUM(
        CASE
          WHEN status = 'approved' THEN 1
          ELSE 0
        END
      ) AS approved,

      SUM(
        CASE
          WHEN status = 'rejected' THEN 1
          ELSE 0
        END
      ) AS rejected,

      (
        SELECT COUNT(*)
        FROM id_card_receipts
      ) AS id_card_received

    FROM students
  `);

  const statistics = rows[0];

  const total = Number(statistics.total || 0);
  const pending = Number(statistics.pending || 0);
  const approved = Number(statistics.approved || 0);
  const rejected = Number(statistics.rejected || 0);
  const idCardReceived = Number(statistics.id_card_received || 0);

  // ID cards that are still pending among approved students
  const idCardPending = Math.max(approved - idCardReceived, 0);

  return {
    total,
    pending,
    approved,
    rejected,
    idCardReceived,
    idCardPending,
  };
}

module.exports = {
  getRegistrationStatistics,
};

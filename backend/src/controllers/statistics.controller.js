const statisticsService = require("../services/statistics.service");

// GET PUBLIC REGISTRATION STATISTICS
async function getRegistrationStatistics(req, res) {
  try {
    const statistics = await statisticsService.getRegistrationStatistics();

    return res.status(200).json({
      success: true,
      statistics,
    });
  } catch (error) {
    console.error("Get registration statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load registration statistics.",
    });
  }
}

module.exports = {
  getRegistrationStatistics,
};

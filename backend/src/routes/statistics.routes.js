const express = require("express");

const {
  getRegistrationStatistics,
} = require("../controllers/statistics.controller");

const router = express.Router();

// PUBLIC REGISTRATION STATISTICS
router.get("/", getRegistrationStatistics);

module.exports = router;

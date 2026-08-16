const express = require("express");

const { authenticate } = require("../middleware/auth.middleware");
const { requirePermission } = require("../middleware/permission.middleware");

const router = express.Router();

// Protected API test

router.get("/protected", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "You are accessed a protected endpoint ...!",
    user: req.user,
  });
});


// Permission API test

router.get(
  "/permission-test",
  authenticate,
  requirePermission("students.view"),
  (req, res) => {
    res.json({
      success: true,
      message: "You have the students.view permission ...!",
      user: req.user,
    });
  },
);

module.exports = router;

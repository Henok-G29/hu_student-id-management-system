const express = require("express");
const {authenticate} = require("../middleware/auth.middleware");
const { userInfo } = require("node:os");

const router = express.Router();

router.get("/protected", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "You are accessed a protected endpoint ...!",
        user: req.user,
    })
})

module.exports = router;
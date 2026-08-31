const { registerSubAdmin, loginAdmin, getCurrentAdmin } = require("../services/auth.service");

// REGISTER SUB-ADMIN
async function register(req, res) {
  try {
    const { full_name, email, password } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    // Clean input
    const cleanFullName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Validate full name
    if (cleanFullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must contain at least 2 characters.",
      });
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    // Register sub-admin
    const result = await registerSubAdmin({
      full_name: cleanFullName,
      email: cleanEmail,
      password,
    });

    // Duplicate email
    if (!result.success && result.reason === "EMAIL_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    // Success
    return res.status(201).json({
      success: true,

      message: "Sub-admin account created successfully.",

      admin: result.admin,
    });
  } catch (error) {
    console.error("Register sub-admin error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create sub-admin account.",
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Login
    const result = await loginAdmin(cleanEmail, password);

    // Account inactive
    if (!result.success && result.reason === "ACCOUNT_INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // Invalid credentials
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Success
    return res.status(200).json({
      success: true,

      message: "Login successful.",

      data: {
        token: result.token,

        admin: result.admin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// GET CURRENT AUTHENTICATED ADMIN
async function me(req, res) {
  try {
    const admin = await getCurrentAdmin(req.user.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Get current admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load administrator information.",
    });
  }
}

module.exports = {
  register,
  login,
  me,
};

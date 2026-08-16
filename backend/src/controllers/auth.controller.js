const { log } = require("node:console");
const { loginAdmin } = require("../services/auth.service");
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required ...!",
            })
        }

        const result = await loginAdmin(email, password);

        if (!result.success) {
            if (result.reason === "ACCOUNT_INACTIVE") {
                return res.status(403).json({
                    success: false,
                    message: "Your account is inactive.",
                });
            }

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login successful ...!",
            data: {
                token: result.token,
                admin: result.admin
            },
        });
    } catch (error) {
        console.log("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}

module.exports = {
    login,
}

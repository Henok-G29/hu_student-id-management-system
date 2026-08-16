const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required ...!",
            });
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication format ...!",
            });
        }

        const token = parts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET,);

        req.user = {
            id: decoded.sub,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                succes: false,
                message: "Authentication token has expired ...!",
            });
        }

        console.error("Authentication middleware error:", error)

        return res.status(500).json({
            succes: false,
            message: "Internal server error ...!"
        });
    }
}

module.exports = {
    authenticate,
}

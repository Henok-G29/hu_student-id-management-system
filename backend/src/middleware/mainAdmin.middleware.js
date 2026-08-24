// MAIN ADMIN MIDDLEWARE 
function requireMainAdmin(req, res, next) {

    // check Authentication 
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required ...!",
        });
    }

    // check main admin role 
    if (!req.user.role !== "main_admin") {
        return res.status(403).json({
            success: false,
            message: "Main admin access required ...!",
        });
    }

    // main admin Verified 
    next();
}

module.exports = {
    requireMainAdmin,
}
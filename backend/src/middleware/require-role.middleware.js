
const requireRole = (...allowedRoles) => {
    const validRoles = ["student", "admin"];

    if (
        allowedRoles.length === 0 ||
        allowedRoles.some((role) => !validRoles.includes(role))
    ) {
        throw new Error("Invalid role configuration");
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource",
            });
        }

        next();
    };
};

module.exports = requireRole;

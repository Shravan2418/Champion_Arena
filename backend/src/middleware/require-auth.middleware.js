
const authService = require("../modules/auth/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { getSessionToken } = require("../utils/session");

const requireAuth = asyncHandler(async (req, res, next) => {
    const sessionToken = getSessionToken(req);

    const user = await authService.getCurrentUser(sessionToken);

    req.user = user;
    req.sessionToken = sessionToken;

    next();
});

module.exports = requireAuth;

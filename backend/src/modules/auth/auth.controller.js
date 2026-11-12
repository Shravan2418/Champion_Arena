
const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

const {
    getSessionCookieName,
    getSessionToken,
    getSessionCookieOptions,
    getClearCookieOptions,
} = require("../../utils/session");

const getRequestMetadata = (req) => ({
    userAgent: req.get("user-agent") || null,
    ipAddress: req.ip || null,
});

const attachSessionCookie = (res, session) => {
    res.cookie(
        getSessionCookieName(),
        session.sessionToken,
        getSessionCookieOptions(session.expiresAt)
    );
};

// Student registration
const registerStudent = asyncHandler(async (req, res) => {
    const registration = await authService.registerStudent(
        req.body,
        getRequestMetadata(req)
    );

    attachSessionCookie(res, registration);

    res.status(201).json({
        success: true,
        message: "Student account created successfully",
        data: {
            user: registration.user,
            institution: registration.institution,
            expiresAt: registration.expiresAt,
        },
    });
});

// Student login
const studentLogin = asyncHandler(async (req, res) => {
    const session = await authService.login(
        req.body,
        "student",
        getRequestMetadata(req)
    );

    attachSessionCookie(res, session);

    res.status(200).json({
        success: true,
        message: "Student login successful",
        data: {
            user: session.user,
            expiresAt: session.expiresAt,
        },
    });
});

// Admin login
const adminLogin = asyncHandler(async (req, res) => {
    const session = await authService.login(
        req.body,
        "admin",
        getRequestMetadata(req)
    );

    attachSessionCookie(res, session);

    res.status(200).json({
        success: true,
        message: "Admin login successful",
        data: {
            user: session.user,
            expiresAt: session.expiresAt,
        },
    });
});

// Current authenticated user
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
    });
});

// Logout: clear the cookie even if the session has expired.
const logout = asyncHandler(async (req, res) => {
    const token = getSessionToken(req);

    await authService.logout(token);

    res.clearCookie(
        getSessionCookieName(),
        getClearCookieOptions()
    );

    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});

module.exports = {
    registerStudent,
    studentLogin,
    adminLogin,
    getMe,
    logout,
};

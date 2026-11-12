
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const controller = require("./auth.controller");
const validateBody = require("../../middleware/validate.middleware");
const requireAuth = require("../../middleware/require-auth.middleware");

const {
    registerSchema,
    loginSchema,
} = require("./auth.validator");

const router = express.Router();

// Limit repeated authentication attempts.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later.",
    },
});

// Student registration
router.post(
    "/register",
    authLimiter,
    validateBody(registerSchema),
    controller.registerStudent
);

// Student login
router.post(
    "/student/login",
    authLimiter,
    validateBody(loginSchema),
    controller.studentLogin
);

// Admin login
router.post(
    "/admin/login",
    authLimiter,
    validateBody(loginSchema),
    controller.adminLogin
);

// Current logged-in user
router.get(
    "/me",
    requireAuth,
    controller.getMe
);

// Logout
router.post(
    "/logout",
    controller.logout
);

module.exports = router;

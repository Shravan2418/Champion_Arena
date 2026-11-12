
const subjectRoutes = require("./modules/subjects/subject.routes");
const questionRoutes = require("./modules/questions/question.routes");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const examRoutes = require("./modules/exams/exam.routes");
const studentAttemptRoutes = require("./modules/attempts/attempt.routes");
const studentRewardRoutes = require("./modules/rewards/student.routes");
const adminRewardRoutes = require("./modules/rewards/admin.routes");
const studentAccountRoutes = require("./modules/student/student.routes");
const adminInstitutionRoutes =
  require("./modules/admin/institutions/institution.routes");

const adminStudentRoutes =
  require("./modules/admin/students/student.routes");
const adminResultRoutes =
  require("./modules/admin/results/result.routes");
const studentNotificationRoutes =
  require("./modules/notifications/student.routes");

const adminNotificationRoutes =
  require("./modules/notifications/admin.routes");




const pool = require("./config/database");
const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.disable("x-powered-by");

// CORS configuration
const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Requests without an Origin header include Postman.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error("Origin is not allowed by CORS");
        error.statusCode = 403;

        callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/api/health", async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                NOW() AS database_time
        `);

        res.status(200).json({
            success: true,
            message: "Champion Arena API is running",
            database: result.rows[0].database,
            databaseTime: result.rows[0].database_time,
        });
    } catch (error) {
        next(error);
    }
});

// Authentication module
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/student", studentAttemptRoutes);
app.use("/api/student/rewards", studentRewardRoutes);
app.use("/api/admin/rewards", adminRewardRoutes);
app.use("/api/student", studentAccountRoutes);
app.use("/api/admin/institutions", adminInstitutionRoutes);
app.use("/api/admin/students", adminStudentRoutes);
app.use("/api/admin/results", adminResultRoutes);
app.use("/api/student/notifications", studentNotificationRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);



// API 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
});

// Global error handler
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    console.error("API Error:", error);

    const statusCode =
        error.statusCode ||
        (error.type === "entity.parse.failed" ? 400 : 500);

    res.status(statusCode).json({
        success: false,
        message:
            statusCode >= 500 && process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error.message,
        ...(error.code ? { code: error.code } : {}),
    });
});

module.exports = app;


const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const pool = require("./config/database");

const app = express();

// Security middleware
app.use(helmet());

// Allow requests from the React frontend
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Parse incoming JSON
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// API health check and database connection test
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error(error);

    res.status(error.statusCode || 500).json({
        success: false,
        message:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : error.message,
    });
});

module.exports = app;

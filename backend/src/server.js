
require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = Number(process.env.PORT || 5000);

const server = app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log(" CHAMPION ARENA BACKEND");
    console.log("----------------------------------");
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log("----------------------------------");
});

async function shutdown(signal) {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(async () => {
        try {
            await pool.end();
            console.log("PostgreSQL connections closed.");
            process.exit(0);
        } catch (error) {
            console.error("Shutdown error:", error);
            process.exit(1);
        }
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

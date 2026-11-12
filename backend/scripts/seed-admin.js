
require("dotenv").config();

const crypto = require("crypto");
const pool = require("../src/config/database");

const hashPassword = (password) =>
    crypto.createHash("md5").update(password, "utf8").digest("hex");

const main = async () => {
    // This seed script is deliberately restricted to local development.
    if (process.env.NODE_ENV !== "development") {
        throw new Error(
            "Admin seeding is permitted only in development mode."
        );
    }

    const fullName = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!fullName || !email || !password) {
        throw new Error(
            "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env"
        );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("ADMIN_EMAIL is not a valid email address.");
    }

    if (password.length < 12 || password.length > 72) {
        throw new Error(
            "Admin password must be between 12 and 72 characters."
        );
    }

    const passwordHash = hashPassword(password);
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingResult = await client.query(
            `SELECT id, role
             FROM users
             WHERE LOWER(email) = LOWER($1)
             FOR UPDATE`,
            [email]
        );

        let admin;

        if (existingResult.rows.length > 0) {
            const existing = existingResult.rows[0];

            // Never silently promote an existing Student.
            if (existing.role !== "admin") {
                throw new Error(
                    "This email already belongs to a Student. Use a different Admin email."
                );
            }

            const updateResult = await client.query(
                `UPDATE users
                 SET full_name = $1,
                     password_hash = $2,
                     is_active = TRUE,
                     updated_at = NOW()
                 WHERE id = $3
                 RETURNING id, full_name, email, role`,
                [fullName, passwordHash, existing.id]
            );

            admin = updateResult.rows[0];

            console.log("Existing Admin account credentials updated.");
        } else {
            const insertResult = await client.query(
                `INSERT INTO users (
                    full_name,
                    email,
                    password_hash,
                    role,
                    is_active
                )
                VALUES ($1, $2, $3, 'admin', TRUE)
                RETURNING id, full_name, email, role`,
                [fullName, email, passwordHash]
            );

            admin = insertResult.rows[0];

            console.log("Initial Admin account created.");
        }

        await client.query("COMMIT");

        console.log("----------------------------------");
        console.log(" CHAMPION ARENA ADMIN SETUP");
        console.log("----------------------------------");
        console.log("Admin ID:", admin.id);
        console.log("Name:", admin.full_name);
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("----------------------------------");
        console.log("Password is not displayed.");
    } catch (error) {
        await client.query("ROLLBACK").catch(() => {});
        throw error;
    } finally {
        client.release();
    }
};

main()
    .catch((error) => {
        console.error("Admin setup failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });

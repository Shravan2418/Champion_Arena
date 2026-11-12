
const pool = require("../../config/database");

// Find user by email
const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT
            id,
            full_name,
            email,
            password_hash,
            role,
            is_active,
            created_at
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email]
    );

    return result.rows[0] || null;
};

// Create a Student, optional institution membership,
// initial gamification profile and session atomically.
const createStudentWithSession = async ({
    fullName,
    email,
    passwordHash,
    sessionTokenHash,
    expiresAt,
    userAgent,
    ipAddress,
    institutionCodeHash,
    studentIdentifier,
    department,
    courseOrProgram,
    academicYear,
}) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        let institution = null;

        if (institutionCodeHash) {
            const institutionResult = await client.query(
                `SELECT id, name
                 FROM institutions
                 WHERE institution_code_hash = $1
                   AND is_active = TRUE
                 FOR SHARE`,
                [institutionCodeHash]
            );

            if (institutionResult.rows.length === 0) {
                const error = new Error(
                    "Invalid or inactive institution code"
                );
                error.code = "INVALID_INSTITUTION_CODE";
                throw error;
            }

            institution = institutionResult.rows[0];
        }

        const userResult = await client.query(
            `INSERT INTO users (
                full_name,
                email,
                password_hash,
                role,
                terms_accepted_at
            )
            VALUES ($1, $2, $3, 'student', NOW())
            RETURNING
                id,
                full_name,
                email,
                role,
                is_active,
                created_at,
                terms_accepted_at`,
            [fullName, email, passwordHash]
        );

        const user = userResult.rows[0];

        if (institution) {
            await client.query(
                `INSERT INTO student_institutions (
                    student_id,
                    institution_id,
                    membership_status,
                    student_identifier,
                    department,
                    course_or_program,
                    academic_year
                )
                VALUES ($1, $2, 'active', $3, $4, $5, $6)`,
                [
                    user.id,
                    institution.id,
                    studentIdentifier || null,
                    department || null,
                    courseOrProgram || null,
                    academicYear || null,
                ]
            );
        }

        await client.query(
            `INSERT INTO student_gamification (
                student_id,
                total_xp,
                level,
                current_streak,
                longest_streak
            )
            VALUES ($1, 0, 1, 0, 0)`,
            [user.id]
        );

        await client.query(
            `INSERT INTO user_sessions (
                user_id,
                session_token_hash,
                expires_at,
                user_agent,
                ip_address
            )
            VALUES ($1, $2, $3, $4, $5)`,
            [
                user.id,
                sessionTokenHash,
                expiresAt,
                userAgent || null,
                ipAddress || null,
            ]
        );

        await client.query("COMMIT");

        return {
            user,
            institution: institution
                ? {
                    id: institution.id,
                    name: institution.name,
                }
                : null,
        };

    } catch (error) {
        if (transactionStarted) {
            await client.query("ROLLBACK").catch(() => {});
        }

        throw error;

    } finally {
        client.release();
    }
};

// Create a session for an existing user
const createSession = async ({
    userId,
    sessionTokenHash,
    expiresAt,
    userAgent,
    ipAddress,
}) => {
    const result = await pool.query(
        `INSERT INTO user_sessions (
            user_id,
            session_token_hash,
            expires_at,
            user_agent,
            ip_address
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
            userId,
            sessionTokenHash,
            expiresAt,
            userAgent || null,
            ipAddress || null,
        ]
    );

    return result.rows[0];
};

// Retrieve a valid session
const findActiveSessionByHash = async (tokenHash) => {
    const result = await pool.query(
        `SELECT
            s.id AS session_id,
            s.expires_at,
            u.id AS user_id,
            u.full_name,
            u.email,
            u.role,
            u.is_active
         FROM user_sessions s
         INNER JOIN users u ON u.id = s.user_id
         WHERE s.session_token_hash = $1
           AND s.revoked_at IS NULL
           AND s.expires_at > NOW()
           AND u.is_active = TRUE
         LIMIT 1`,
        [tokenHash]
    );

    const session = result.rows[0] || null;

    if (session) {
        await pool.query(
            `UPDATE user_sessions
             SET last_seen_at = NOW()
             WHERE id = $1`,
            [session.session_id]
        );
    }

    return session;
};

// Revoke session
const revokeSessionByHash = async (tokenHash) => {
    const result = await pool.query(
        `UPDATE user_sessions
         SET revoked_at = NOW()
         WHERE session_token_hash = $1
           AND revoked_at IS NULL
         RETURNING id`,
        [tokenHash]
    );

    return result.rows[0] || null;
};

module.exports = {
    findUserByEmail,
    createStudentWithSession,
    createSession,
    findActiveSessionByHash,
    revokeSessionByHash,
};

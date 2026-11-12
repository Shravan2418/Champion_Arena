
const crypto = require("crypto");

const repository = require("./auth.repository");
const AppError = require("../../utils/AppError");

const SESSION_TTL_HOURS = Number(
    process.env.SESSION_TTL_HOURS || 24
);

if (!Number.isFinite(SESSION_TTL_HOURS) || SESSION_TTL_HOURS <= 0) {
    throw new Error("SESSION_TTL_HOURS must be a positive number");
}

// Requested MD5 format: demonstration use only.
const hashPassword = (password) =>
    crypto.createHash("md5").update(password, "utf8").digest("hex");

const verifyPassword = (password, storedHash) => {
    if (!/^[a-f0-9]{32}$/i.test(storedHash?.trim() || "")) {
        return false;
    }

    const expected = Buffer.from(hashPassword(password), "hex");
    const actual = Buffer.from(storedHash.trim(), "hex");

    return crypto.timingSafeEqual(actual, expected);
};

// Session tokens are random; only their SHA-256 hashes are stored.
const hashSessionToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

// Institution codes are case-insensitive and stored as SHA-256 hashes.
const hashInstitutionCode = (code) =>
    crypto.createHash("sha256")
        .update(code.trim().toUpperCase(), "utf8")
        .digest("hex");

const generateSessionToken = () =>
    crypto.randomBytes(32).toString("hex");

const getSessionExpiry = () =>
    new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

const createUserSession = async (user, metadata = {}) => {
    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = getSessionExpiry();

    await repository.createSession({
        userId: user.id,
        sessionTokenHash,
        expiresAt,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
    });

    return {
        user,
        sessionToken,
        expiresAt,
    };
};

// Student registration only
const registerStudent = async (data, metadata = {}) => {
    const {
        fullName,
        email,
        password,
        institutionCode,
        studentIdentifier,
        department,
        courseOrProgram,
        academicYear,
    } = data;

    const passwordHash = hashPassword(password);

    const sessionToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = getSessionExpiry();

    const institutionCodeHash = institutionCode
        ? hashInstitutionCode(institutionCode)
        : null;

    try {
        const registration = await repository.createStudentWithSession({
            fullName,
            email,
            passwordHash,
            sessionTokenHash,
            expiresAt,
            userAgent: metadata.userAgent,
            ipAddress: metadata.ipAddress,
            institutionCodeHash,
            studentIdentifier,
            department,
            courseOrProgram,
            academicYear,
        });

        return {
            user: registration.user,
            institution: registration.institution,
            sessionToken,
            expiresAt,
        };

    } catch (error) {
        if (error.code === "INVALID_INSTITUTION_CODE") {
            throw new AppError(
                "The institution code is invalid or inactive.",
                400,
                "INVALID_INSTITUTION_CODE"
            );
        }

        if (
            error.code === "23505" &&
            error.constraint === "uq_users_email_lower"
        ) {
            throw new AppError(
                "An account with this email already exists.",
                409,
                "EMAIL_ALREADY_REGISTERED"
            );
        }

        throw error;
    }
};

// Login must specify the account category.
const login = async ({ email, password }, expectedRole, metadata = {}) => {
    if (!["student", "admin"].includes(expectedRole)) {
        throw new AppError("Invalid account category", 400);
    }

    const user = await repository.findUserByEmail(email);

    if (
        !user ||
        !user.is_active ||
        user.role !== expectedRole ||
        !verifyPassword(password, user.password_hash)
    ) {
        throw new AppError(
            "Invalid email or password",
            401,
            "INVALID_CREDENTIALS"
        );
    }

    const safeUser = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
    };

    return createUserSession(safeUser, metadata);
};

const getCurrentUser = async (sessionToken) => {
    if (!sessionToken) {
        throw new AppError(
            "Authentication required",
            401,
            "UNAUTHENTICATED"
        );
    }

    const tokenHash = hashSessionToken(sessionToken);

    const session = await repository.findActiveSessionByHash(tokenHash);

    if (!session) {
        throw new AppError(
            "Session expired or invalid",
            401,
            "INVALID_SESSION"
        );
    }

    return {
        id: session.user_id,
        full_name: session.full_name,
        email: session.email,
        role: session.role,
        is_active: session.is_active,
    };
};

const logout = async (sessionToken) => {
    if (!sessionToken) return;

    const tokenHash = hashSessionToken(sessionToken);

    await repository.revokeSessionByHash(tokenHash);
};

module.exports = {
    registerStudent,
    login,
    getCurrentUser,
    logout,
};

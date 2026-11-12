
const getSessionCookieName = () =>
    process.env.SESSION_COOKIE_NAME || "ca_session";

const getSessionToken = (req) => {
    const cookieToken = req.cookies?.[getSessionCookieName()];

    if (cookieToken) {
        return cookieToken;
    }

    // Bearer tokens are useful for API clients such as Postman.
    const authorization = req.headers.authorization || "";

    if (authorization.startsWith("Bearer ")) {
        return authorization.slice(7).trim();
    }

    return null;
};

const getBaseCookieOptions = () => {
    const sameSite = process.env.COOKIE_SAME_SITE || "lax";
    const secure =
        process.env.COOKIE_SECURE === "true" ||
        process.env.NODE_ENV === "production";

    if (sameSite === "none" && !secure) {
        throw new Error(
            "SameSite=None requires COOKIE_SECURE=true"
        );
    }

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
    };
};

const getSessionCookieOptions = (expiresAt) => {
    const maxAge = Math.max(
        0,
        new Date(expiresAt).getTime() - Date.now()
    );

    return {
        ...getBaseCookieOptions(),
        maxAge,
    };
};

const getClearCookieOptions = () => getBaseCookieOptions();

module.exports = {
    getSessionCookieName,
    getSessionToken,
    getSessionCookieOptions,
    getClearCookieOptions,
};

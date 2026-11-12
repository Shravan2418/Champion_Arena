
const { z } = require("zod");

const optionalText = (maxLength) =>
    z.preprocess(
        (value) =>
            typeof value === "string" && value.trim() === ""
                ? undefined
                : value,
        z.string().trim().max(maxLength).optional()
    );

const registerSchema = z.object({
    fullName: z.string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(120),

    email: z.string()
        .trim()
        .email("Enter a valid email address")
        .max(254)
        .transform((value) => value.toLowerCase()),

    password: z.string()
        .min(8, "Password must contain at least 8 characters")
        .max(72),

    institutionCode: optionalText(64),
    studentIdentifier: optionalText(80),
    department: optionalText(120),
    courseOrProgram: optionalText(120),
    academicYear: optionalText(30),

    acceptedTerms: z.boolean().refine(
        (value) => value === true,
        "You must accept the Terms and Conditions"
    ),
}).strict().superRefine((data, ctx) => {
    const hasAcademicDetails = Boolean(
        data.studentIdentifier ||
        data.department ||
        data.courseOrProgram ||
        data.academicYear
    );

    if (hasAcademicDetails && !data.institutionCode) {
        ctx.addIssue({
            code: "custom",
            path: ["institutionCode"],
            message: "Provide an institution code or leave academic details empty.",
        });
    }
});

const loginSchema = z.object({
    email: z.string()
        .trim()
        .email("Enter a valid email address")
        .max(254)
        .transform((value) => value.toLowerCase()),

    password: z.string()
        .min(1, "Password is required")
        .max(72),
}).strict();

module.exports = {
    registerSchema,
    loginSchema,
};

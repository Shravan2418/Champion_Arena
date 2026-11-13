import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  IdCard,
  Landmark,
  Layers3,
  LockKeyhole,
  Mail,
  UserRound,
  UserPlus,
} from "lucide-react";
import AuthLayout from "./AuthLayout";
import "./Registration.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const INITIAL_VALUES = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  institutionCode: "",
  studentIdentifier: "",
  department: "",
  courseOrProgram: "",
  academicYear: "",
  acceptedTerms: false,
};

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical & Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science",
  "Commerce",
  "Science",
  "Arts",
  "Other",
];

const COURSES = [
  "B.Tech",
  "B.E.",
  "B.Sc",
  "B.Com",
  "B.A.",
  "BCA",
  "MCA",
  "M.Tech",
  "MBA",
  "M.Sc",
  "Diploma",
  "Other",
];

const ACADEMIC_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "1st Year (PG)",
  "2nd Year (PG)",
  "Other",
];

function FormField({ label, required = false, icon: Icon, children, className = "" }) {
  return (
    <div className={`ca-register-field ${className}`}>
      <label className="ca-register-label">
        {label}
        {required ? <span className="ca-register-required"> *</span> : <span className="ca-register-optional"> (Optional)</span>}
      </label>
      <div className="ca-register-input-wrap">
        {Icon && <Icon size={18} aria-hidden="true" />}
        {children}
      </div>
    </div>
  );
}

export default function Registration() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [academicOpen, setAcademicOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (notice) setNotice(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setNotice(null);

    const fullName = values.fullName.trim();
    const email = values.email.trim().toLowerCase();
    const hasAcademicDetails = Boolean(
      values.studentIdentifier.trim() ||
      values.department ||
      values.courseOrProgram ||
      values.academicYear
    );

    if (fullName.length < 2) {
      setNotice({ type: "error", text: "Please enter your full name." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    if (values.password.length < 8 || values.password.length > 72) {
      setNotice({ type: "error", text: "Password must contain between 8 and 72 characters." });
      return;
    }

    if (values.password !== values.confirmPassword) {
      setNotice({ type: "error", text: "Passwords do not match. Please check and try again." });
      return;
    }

    if (hasAcademicDetails && !values.institutionCode.trim()) {
      setNotice({
        type: "error",
        text: "Enter your institution code to save academic details, or clear those fields to register independently.",
      });
      return;
    }

    if (!values.acceptedTerms) {
      setNotice({ type: "error", text: "Please accept the Terms and Conditions to continue." });
      return;
    }

    const payload = {
      fullName,
      email,
      password: values.password,
      acceptedTerms: true,
      ...(values.institutionCode.trim() && {
        institutionCode: values.institutionCode.trim(),
        studentIdentifier: values.studentIdentifier.trim() || undefined,
        department: values.department || undefined,
        courseOrProgram: values.courseOrProgram || undefined,
        academicYear: values.academicYear || undefined,
      }),
    };

    setBusy(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationMessage = result.errors?.[0]?.message;
        throw new Error(
          validationMessage || result.message || `Registration failed (HTTP ${response.status}).`
        );
      }

      setNotice({
        type: "success",
        text: result.message || "Your Champion Arena account has been created successfully.",
      });

      // The backend creates a session during registration, so the student is signed in.
      window.setTimeout(() => {
        navigate("/student/dashboard", { replace: true });
      }, 650);
    } catch (registrationError) {
      setNotice({
        type: "error",
        text:
          registrationError instanceof TypeError
            ? "Unable to connect. Please check that the Champion Arena backend is running."
            : registrationError.message || "Registration failed. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout role="student" page="register">
      <motion.section
        className="ca-auth-card ca-register-card"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ca-register-card-heading">
          <span className="ca-register-heading-icon"><UserPlus size={25} /></span>
          <div>
            <h2>Create your <span>Champion Arena</span> account</h2>
            <p>Join the arena. Learn, practice and compete.</p>
          </div>
        </div>

        {notice && (
          <motion.div
            className={`ca-auth-notice ${notice.type}`}
            role={notice.type === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: reduceMotion ? 0 : -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {notice.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            <span>{notice.text}</span>
          </motion.div>
        )}

        <form className="ca-register-form" onSubmit={submit} noValidate>
          <div className="ca-register-section-title">
            <span>Personal Information</span>
            <i />
          </div>

          <FormField label="Full Name" required icon={UserRound} className="full-width">
            <input
              name="fullName"
              value={values.fullName}
              onChange={update}
              placeholder="Enter your full name"
              autoComplete="name"
              minLength={2}
              maxLength={120}
              required
            />
          </FormField>

          <FormField label="Email Address" required icon={Mail} className="full-width">
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={update}
              placeholder="Enter your email address"
              autoComplete="email"
              maxLength={254}
              required
            />
          </FormField>

          <FormField label="Password" required icon={LockKeyhole}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={update}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
            <button
              type="button"
              className="ca-register-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </FormField>

          <FormField label="Confirm Password" required icon={LockKeyhole}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={update}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
            />
            <button
              type="button"
              className="ca-register-password-toggle"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </FormField>

          <button
            type="button"
            className="ca-register-academic-toggle full-width"
            aria-expanded={academicOpen}
            onClick={() => setAcademicOpen((open) => !open)}
          >
            <span>
              <GraduationCap size={20} />
              Academic Information <small>(Optional)</small>
            </span>
            <ChevronDown className={academicOpen ? "is-open" : ""} size={19} />
          </button>

          {academicOpen && (
            <motion.div
              className="ca-register-academic-grid full-width"
              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: reduceMotion ? 0.01 : 0.28 }}
            >
              <div className="ca-register-academic-note full-width">
                Join a college or university using its institution code. You can skip this section and join an institution later from your profile.
              </div>

              <FormField label="Institution Code" icon={Landmark} className="full-width">
                <input
                  name="institutionCode"
                  value={values.institutionCode}
                  onChange={update}
                  placeholder="Enter your college / university code"
                  maxLength={64}
                  autoCapitalize="characters"
                />
              </FormField>

              <FormField label="Student ID / Roll Number" icon={IdCard}>
                <input
                  name="studentIdentifier"
                  value={values.studentIdentifier}
                  onChange={update}
                  placeholder="Enter student ID / roll number"
                  maxLength={80}
                />
              </FormField>

              <FormField label="Department" icon={Layers3}>
                <select name="department" value={values.department} onChange={update}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Course / Programme" icon={BookOpen}>
                <select name="courseOrProgram" value={values.courseOrProgram} onChange={update}>
                  <option value="">Select course / programme</option>
                  {COURSES.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Academic Year" icon={CalendarDays}>
                <select name="academicYear" value={values.academicYear} onChange={update}>
                  <option value="">Select academic year</option>
                  {ACADEMIC_YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </FormField>
            </motion.div>
          )}

          <div className="ca-register-terms-row full-width">
            <label className="ca-register-terms-check" aria-label="Accept Terms and Conditions">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={values.acceptedTerms}
                onChange={update}
              />
              <span className="ca-register-terms-box" aria-hidden="true" />
            </label>
            <p>
              I agree to the{" "}
              <button type="button" onClick={() => navigate("/terms")}>Terms &amp; Conditions</button>
              {" "}and{" "}
              <button type="button" onClick={() => navigate("/privacy")}>Privacy Policy</button>.
            </p>
          </div>

          <button className="ca-auth-primary-button ca-register-submit full-width" type="submit" disabled={busy}>
            {busy ? <span className="ca-auth-spinner" /> : <UserPlus size={20} />}
            <span>{busy ? "Creating account..." : "Create Student Account"}</span>
          </button>
        </form>

        <div className="ca-auth-divider ca-register-divider">
          <span />
          <p>or continue with</p>
          <span />
        </div>

        <button
          className="ca-auth-google-button"
          type="button"
          onClick={() => setNotice({ type: "info", text: "Google sign-up is not connected yet." })}
        >
          <span className="ca-auth-google-mark">G</span>
          <span>Continue with Google</span>
        </button>

        <div className="ca-auth-card-footer">
          <span>Already have an account?</span>
          <button type="button" onClick={() => navigate("/login")}>
            Login Now <ArrowRight size={16} />
          </button>
        </div>

        <p className="ca-register-independent-note">
          No institution code? No problem. Register independently and add your academic details later.
        </p>
      </motion.section>
    </AuthLayout>
  );
}

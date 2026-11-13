import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, UserRound, Mail, LockKeyhole, Eye, EyeOff,
  GraduationCap, Landmark, IdCard, Layers3, BookOpen,
  CalendarDays, UserPlus, CheckCircle2, AlertCircle
} from "lucide-react";

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  college: "",
  institutionCode: "",
  studentId: "",
  department: "",
  course: "",
  academicYear: ""
};

const departments = [
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
  "Other"
];

const courses = [
  "B.Tech", "B.E.", "B.Sc", "B.Com", "B.A.", "BCA", "MCA",
  "M.Tech", "MBA", "M.Sc", "Diploma", "Other"
];

const academicYears = [
  "1st Year", "2nd Year", "3rd Year", "4th Year",
  "1st Year (PG)", "2nd Year (PG)", "Other"
];

function FormField({ label, required = false, icon: Icon, children, className = "" }) {
  return (
    <div className={`register-field ${className}`}>
      <label className="register-field-label">
        {label} {required ? <><span className="required-star">*</span></> : <span className="optional-label">(Optional)</span>}
      </label>
      <div className="register-input-wrap">
        {Icon && <Icon className="register-field-icon" size={20} aria-hidden="true" />}
        {children}
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (notice) setNotice(null);
  };

  const submit = (event) => {
    event.preventDefault();
    setNotice(null);

    const fullName = values.fullName.trim();
    const email = values.email.trim().toLowerCase();

    if (fullName.length < 2) {
      setNotice({ type: "error", text: "Please enter your full name." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (values.password.length < 8 || values.password.length > 25) {
      setNotice({ type: "error", text: "Password must be between 8 and 25 characters." });
      return;
    }
    if (values.password !== values.confirmPassword) {
      setNotice({ type: "error", text: "Passwords do not match. Please check and try again." });
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setNotice({
        type: "success",
        text: "Registration details validated successfully. Backend registration is not connected yet."
      });
    }, 650);
  };

  return (
    <div className="site-shell registration-shell">
      <header className="site-header">
        <button className="brand-home" onClick={() => navigate("/")} aria-label="Champion Arena home">
          <img src="/images/champion-arena-logo.png" alt="Champion Arena" className="brand-logo" />
        </button>
        <nav className="header-actions" aria-label="Main navigation">
          <button className="header-login" onClick={() => navigate("/login")}>Login</button>
          <button className="header-register is-selected" onClick={() => navigate("/register")}>Register</button>
        </nav>
      </header>

      <main className="login-hero registration-hero">
        <div className="hero-overlay" aria-hidden="true" />
        <section className="intro-content registration-intro">
          <div className="platform-badge">
            <span className="gamepad-symbol">●</span>
            <span>Gamified Learning &amp; Exam Platform</span>
          </div>

          <div className="intro-heading registration-heading">
            <h1>
              Create Your
              <span>Champion <strong>Arena</strong></span>
              <span>Account</span>
            </h1>
            <span className="heading-rays" aria-hidden="true">✦</span>
            <span className="heading-swoosh" aria-hidden="true" />
          </div>

          <p className="intro-description">
            Join Champion Arena and start your<br className="desktop-break" />
            gamified learning &amp; exam journey today!
          </p>

          <div className="feature-list">
            <article className="feature-item">
              <div className="feature-icon feature-rocket"><UserPlus size={32} /></div>
              <div className="feature-copy">
                <h2>Create Your Account</h2>
                <p>Join the learning arena</p>
              </div>
            </article>
            <article className="feature-item">
              <div className="feature-icon feature-chart"><GraduationCap size={33} /></div>
              <div className="feature-copy">
                <h2>Build Your Profile</h2>
                <p>Add your academic details</p>
              </div>
            </article>
            <article className="feature-item">
              <div className="feature-icon feature-trophy"><CheckCircle2 size={33} /></div>
              <div className="feature-copy">
                <h2>Start Your Journey</h2>
                <p>Learn, practice and compete</p>
              </div>
            </article>
          </div>

          <div className="learning-ribbon">
            <span>Learn</span><i>•</i><span>Practice</span><i>•</i><span>Compete</span><i>•</i><span>Excel</span>
          </div>
        </section>

        <section className="auth-area registration-auth-area" aria-label="Student registration form">
          <div className="auth-card registration-card">
            <div className="registration-card-heading">
              <div className="registration-heading-icon"><UserPlus size={29} /></div>
              <div>
                <h2>Register for <span>Champion Arena</span></h2>
                <p>Create your account and join the learning arena!</p>
              </div>
            </div>

            {notice && (
              <div className={`form-notice ${notice.type}`} role="status">
                {notice.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                <span>{notice.text}</span>
              </div>
            )}

            <form className="registration-form" onSubmit={submit} noValidate>
              <FormField label="Full Name" required icon={UserRound} className="field-full">
                <input name="fullName" value={values.fullName} onChange={update}
                  placeholder="Enter your full name" autoComplete="name" required />
              </FormField>

              <FormField label="Email Address" required icon={Mail}>
                <input name="email" type="email" value={values.email} onChange={update}
                  placeholder="Enter your email address" autoComplete="email" required />
              </FormField>

              <FormField label="Password" required icon={LockKeyhole}>
                <input name="password" type={showPassword ? "text" : "password"}
                  value={values.password} onChange={update} placeholder="Create a password"
                  autoComplete="new-password" minLength={8} maxLength={25} required />
                <button type="button" className="register-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                </button>
              </FormField>

              <FormField label="Confirm Password" required icon={LockKeyhole}>
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"}
                  value={values.confirmPassword} onChange={update} placeholder="Re-enter your password"
                  autoComplete="new-password" minLength={8} maxLength={25} required />
                <button type="button" className="register-password-toggle"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirmPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                </button>
              </FormField>

              <FormField label="College / University" icon={GraduationCap}>
                <input name="college" value={values.college} onChange={update}
                  placeholder="Enter college / university name" autoComplete="organization" />
              </FormField>

              <FormField label="Institution Code" icon={Landmark}>
                <input name="institutionCode" value={values.institutionCode} onChange={update}
                  placeholder="Enter institution code" />
              </FormField>

              <FormField label="Student ID / Roll Number" icon={IdCard}>
                <input name="studentId" value={values.studentId} onChange={update}
                  placeholder="Enter student ID / roll number" />
              </FormField>

              <FormField label="Department" icon={Layers3}>
                <select name="department" value={values.department} onChange={update}>
                  <option value="">Select department</option>
                  {departments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </FormField>

              <FormField label="Course / Programme" icon={BookOpen}>
                <select name="course" value={values.course} onChange={update}>
                  <option value="">Select course / programme</option>
                  {courses.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </FormField>

              <FormField label="Academic Year" icon={CalendarDays}>
                <select name="academicYear" value={values.academicYear} onChange={update}>
                  <option value="">Select academic year</option>
                  {academicYears.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </FormField>

              <button className="submit-button registration-submit field-full" type="submit" disabled={busy}>
                {busy ? <span className="loading-spinner" /> : <UserPlus size={25} />}
                <span>{busy ? "Creating account..." : "Create Account"}</span>
              </button>
            </form>

            <div className="separator registration-separator">
              <span /><p>or continue with</p><span />
            </div>

            <button className="google-button registration-google" type="button"
              onClick={() => setNotice({ type: "info", text: "Google sign-up will be connected when authentication is implemented." })}>
              <span className="google-mark">G</span>
              <span>Continue with Google</span>
            </button>

            <div className="register-prompt registration-login-prompt">
              <span>Already have an account?</span>
              <button type="button" onClick={() => navigate("/login")}>
                Login Now <ArrowRight size={17} />
              </button>
            </div>
            <p className="frontend-note">Frontend preview · Registration is not connected to a backend</p>
          </div>
        </section>
      </main>
    </div>
  );
}

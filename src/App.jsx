import React, { useState } from "react";
import RegistrationPage from "./RegistrationPage.jsx";
import HomePage from "./HomePage.jsx";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  ArrowRight, ChartNoAxesCombined, Eye, EyeOff, Gamepad2,
  GraduationCap, LockKeyhole, LogIn, Mail, Rocket, ShieldCheck,
  Trophy, CheckCircle2, AlertCircle
} from "lucide-react";

const LOGO = "/images/champion-arena-logo.png";

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState(localStorage.getItem("champion_remembered_username") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(Boolean(localStorage.getItem("champion_remembered_username")));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  function selectRole(nextRole) {
    setRole(nextRole);
    setNotice(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    const normalizedUsername = email.trim();
    if (normalizedUsername.length < 3 || normalizedUsername.length > 40) {
      setNotice({ type: "error", text: "Username must be between 3 and 40 characters." });
      return;
    }
    if (password.length < 8 || password.length > 25) {
      setNotice({ type: "error", text: "Password must be between 8 and 25 characters." });
      return;
    }

    if (remember) localStorage.setItem("champion_remembered_username", normalizedUsername);
    else localStorage.removeItem("champion_remembered_username");

    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setNotice({ type: "success", text: `Demo ${role.toLowerCase()} login successful. Opening dashboard...` });
      window.setTimeout(() => {
        navigate(role === "Admin" ? "/admin/dashboard" : "/student/dashboard");
      }, 700);
    }, 650);
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="brand-home" onClick={() => navigate("/")} aria-label="Champion Arena home">
          <img src={LOGO} alt="Champion Arena" className="brand-logo" />
        </button>
        <nav className="header-actions" aria-label="Main navigation">
          <button className="header-login is-selected" onClick={() => navigate("/login")}>Login</button>
          <button className="header-register" onClick={() => navigate("/register")}>Register</button>
        </nav>
      </header>

      <main className="login-hero">
        <div className="hero-overlay" aria-hidden="true" />
        <section className="intro-content">
          <div className="platform-badge">
            <Gamepad2 size={21} fill="currentColor" />
            <span>Gamified Learning &amp; Exam Platform</span>
          </div>

          <div className="intro-heading">
            <h1>
              Welcome Back to
              <span>Champion <strong>Arena</strong></span>
            </h1>
            <span className="heading-rays" aria-hidden="true">✦</span>
            <span className="heading-swoosh" aria-hidden="true" />
          </div>

          <p className="intro-description">
            Log in to continue your learning journey,<br className="desktop-break" />
            track your progress, and achieve your goals!
          </p>

          <div className="feature-list">
            <article className="feature-item">
              <div className="feature-icon feature-rocket"><Rocket size={34} /></div>
              <div className="feature-copy">
                <h2>Take Quizzes<br />&amp; Exams</h2>
                <p>Test your knowledge</p>
              </div>
            </article>
            <article className="feature-item">
              <div className="feature-icon feature-chart"><ChartNoAxesCombined size={34} /></div>
              <div className="feature-copy">
                <h2>Track Your<br />Progress</h2>
                <p>Monitor and improve</p>
              </div>
            </article>
            <article className="feature-item">
              <div className="feature-icon feature-trophy"><Trophy size={34} /></div>
              <div className="feature-copy">
                <h2>Earn Badges<br />&amp; Rewards</h2>
                <p>Get recognized for your efforts</p>
              </div>
            </article>
          </div>

          <div className="learning-ribbon">
            <span>Learn</span><i>•</i><span>Practice</span><i>•</i><span>Compete</span><i>•</i><span>Excel</span>
          </div>
        </section>

        <section className="auth-area" aria-label="Login form">
          <div className="auth-card">
            <div className="role-tabs" role="tablist" aria-label="Select login type">
              <button
                type="button"
                role="tab"
                aria-selected={role === "Student"}
                className={`role-tab ${role === "Student" ? "active" : ""}`}
                onClick={() => selectRole("Student")}
              >
                <GraduationCap size={32} />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === "Admin"}
                className={`role-tab ${role === "Admin" ? "active" : ""}`}
                onClick={() => selectRole("Admin")}
              >
                <ShieldCheck size={31} />
                <span>Admin Login</span>
              </button>
            </div>

            <h2 className="auth-title">Login to <span>Champion Arena</span></h2>

            {notice && (
              <div className={`form-notice ${notice.type}`} role="status">
                {notice.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                <span>{notice.text}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label className="input-wrap">
                <Mail size={25} aria-hidden="true" />
                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  aria-label="Username"
                  required
                />
              </label>

              <label className="input-wrap">
                <LockKeyhole size={25} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-label="Password"
                  minLength={8}
                  maxLength={25}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={23} /> : <EyeOff size={23} />}
                </button>
              </label>

              <div className="form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-link" onClick={() => navigate("/forgot-password")}>
                  Forgot Password?
                </button>
              </div>

              <button className="submit-button" type="submit" disabled={busy}>
                {busy ? <span className="loading-spinner" /> : <LogIn size={27} />}
                <span>{busy ? "Please wait..." : "Login"}</span>
              </button>
            </form>

            <div className="separator">
              <span />
              <p>or continue with</p>
              <span />
            </div>

            <button
              className="google-button"
              type="button"
              onClick={() => setNotice({
                type: "info",
                text: "Google sign-in will be connected when authentication is implemented."
              })}
            >
              <span className="google-mark">G</span>
              <span>Continue with Google</span>
            </button>

            <div className="register-prompt">
              <span>Don’t have an account?</span>
              <button type="button" onClick={() => navigate("/register")}>
                Register Now <ArrowRight size={17} />
              </button>
            </div>
            <p className="frontend-note">Frontend preview · Authentication is not connected</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function PlaceholderPage({ title, description }) {
  const navigate = useNavigate();
  return (
    <main className="placeholder-page">
      <div className="placeholder-card">
        <img src={LOGO} alt="Champion Arena" />
        <h1>{title}</h1>
        <p>{description}</p>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </div>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/forgot-password" element={<PlaceholderPage title="Reset your password" description="Password recovery will be implemented with the authentication flow." />} />
      <Route path="/student/dashboard" element={<PlaceholderPage title="Student Dashboard" description="Demo navigation succeeded. Connect this page to the student dashboard when ready." />} />
      <Route path="/admin/dashboard" element={<PlaceholderPage title="Admin Dashboard" description="Demo navigation succeeded. Connect this page to the admin dashboard when ready." />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

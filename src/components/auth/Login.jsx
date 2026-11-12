import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  Gamepad2,
  GraduationCap,
  LockKeyhole,
  LogIn,
  Mail,
  Rocket,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import "./Login.css";

const features = [
  {
    icon: Rocket,
    title: "Take Quizzes",
    subtitle: "& Exams",
    description: "Test your knowledge",
    className: "feature-blue",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Track Your",
    subtitle: "Progress",
    description: "Monitor and improve",
    className: "feature-green",
  },
  {
    icon: Trophy,
    title: "Earn Badges",
    subtitle: "& Rewards",
    description: "Get recognized for your efforts",
    className: "feature-purple",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("champion_remembered_email");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < 8 || password.length > 25) {
      setError("Password must contain 8 to 25 characters.");
      return;
    }

    setLoading(true);
    if (rememberMe) {
      localStorage.setItem("champion_remembered_email", normalizedEmail);
    } else {
      localStorage.removeItem("champion_remembered_email");
    }

    // Frontend-only demo: no credentials are sent to a server.
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(`Demo login successful as ${role}.`);
      window.setTimeout(() => {
        navigate(role === "Admin" ? "/admin/dashboard" : "/student/dashboard");
      }, 550);
    }, 650);
  };

  return (
    <div className="champion-login">
      <header className="login-navbar">
        <button className="brand" onClick={() => navigate("/login")} aria-label="Champion Arena home">
          <span className="brand-trophy"><Trophy size={43} /></span>
          <span className="brand-name">Champion <strong>Arena</strong></span>
        </button>

        <div className="navbar-actions">
          <button className="nav-login" onClick={() => navigate("/login")}>Login</button>
          <button className="nav-register" onClick={() => navigate("/register")}>Register</button>
        </div>
      </header>

      <main className="login-main">
        <section className="login-intro">
          <div className="platform-label">
            <Gamepad2 size={23} />
            <span>Gamified Learning &amp; Exam Platform</span>
          </div>

          <motion.div
            className="intro-heading"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1>Welcome Back to<br />Champion <span>Arena</span></h1>
            <div className="heading-underline" />
          </motion.div>

          <p className="intro-description">
            Log in to continue your learning journey,<br className="desktop-break" />
            track your progress, and achieve your goals!
          </p>

          <div className="feature-list">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  className="feature-item"
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12 }}
                >
                  <div className={`feature-icon ${feature.className}`}>
                    <Icon size={42} strokeWidth={2.2} />
                  </div>
                  <div className="feature-text">
                    <h2>{feature.title}<br />{feature.subtitle}</h2>
                    <p>{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="student-art" aria-label="Students learning illustration">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-cap">🎓</div>
            <div className="student-scene">
              <div className="student student-one">
                <div className="student-hair" />
                <div className="student-face">◡</div>
                <div className="student-body" />
              </div>
              <div className="student student-two">
                <div className="student-hair" />
                <div className="student-face">◡</div>
                <div className="student-body" />
              </div>
              <div className="laptop"><div /></div>
              <div className="book book-one" />
              <div className="book book-two" />
            </div>
          </div>

          <div className="bottom-wave">
            <span>Learn</span><b>•</b><span>Practice</span><b>•</b>
            <span>Compete</span><b>•</b><span>Excel</span>
          </div>
        </section>

        <section className="login-form-section">
          <motion.div
            className="login-card"
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55 }}
          >
            <div className="role-tabs">
              <button
                type="button"
                className={`role-tab ${role === "Student" ? "active" : ""}`}
                onClick={() => { setRole("Student"); setError(""); setSuccess(""); }}
              >
                <GraduationCap size={34} /><span>Student Login</span>
              </button>
              <button
                type="button"
                className={`role-tab ${role === "Admin" ? "active" : ""}`}
                onClick={() => { setRole("Admin"); setError(""); setSuccess(""); }}
              >
                <ShieldCheck size={34} /><span>Admin Login</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.h2
                className="login-card-heading"
                key={role}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
              >
                Login to <span>Champion Arena</span>
              </motion.h2>
            </AnimatePresence>

            {error && <div className="login-message error-message" role="alert">{error}</div>}
            {success && <div className="login-message success-message" role="status">{success}</div>}

            <form onSubmit={handleLogin}>
              <label className="form-input">
                <Mail size={26} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); setError(""); }}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-input">
                <LockKeyhole size={26} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(""); }}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={25}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={24} /> : <EyeOff size={24} />}
                </button>
              </label>

              <div className="form-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <button type="button" className="forgot-password" onClick={() => navigate("/forgot-password")}>
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="submit-login" disabled={loading}>
                {loading ? <span className="spinner" /> : <LogIn size={29} />}
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>

            <div className="login-divider"><span /><p>or continue with</p><span /></div>

            <button
              type="button"
              className="google-login"
              onClick={() => setError("Google sign-in will be connected when the backend is implemented.")}
            >
              <span className="google-icon">G</span>
              <span>Continue with Google</span>
            </button>

            <div className="register-prompt">
              <span>Don't have an account?</span>
              <button type="button" onClick={() => navigate("/register")}>
                Register Now <ArrowRight size={17} />
              </button>
            </div>
            <p className="demo-note">Frontend preview mode · Authentication is not connected</p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

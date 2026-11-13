import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";
import AuthLayout from "./AuthLayout";
import "./Login.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const REMEMBERED_EMAIL_KEY = "champion_remembered_email";

export default function Login() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "admin";

  const loginEndpoint = useMemo(
    () => `${API_BASE_URL}/auth/${isAdmin ? "admin" : "student"}/login`,
    [isAdmin]
  );

  useEffect(() => {
    try {
      const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    } catch {
      // Browser storage may be unavailable in private browsing.
    }
  }, []);

  const changeRole = (nextRole) => {
    if (loading || nextRole === role) return;
    setRole(nextRole);
    setError("");
    setInfo("");
    setPassword("");
    setShowPassword(false);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError("Password must contain between 8 and 72 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(loginEndpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.message || `Login failed (HTTP ${response.status}).`
        );
      }

      const authenticatedUser = payload?.data?.user;
      if (!authenticatedUser) {
        throw new Error("The server returned an invalid login response.");
      }

      if (authenticatedUser.role !== role) {
        throw new Error("This account does not match the selected login type.");
      }

      try {
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // A storage failure must not cancel a successful login.
      }

      navigate(
        role === "admin" ? "/admin/dashboard" : "/student/dashboard",
        { replace: true }
      );
    } catch (loginError) {
      setError(
        loginError instanceof TypeError
          ? "Unable to connect. Please check that the Champion Arena backend is running."
          : loginError.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout role={role} page="login">
      <motion.section
        className="ca-auth-card ca-login-card"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ca-login-role-tabs" role="tablist" aria-label="Choose login type">
          <button
            type="button"
            role="tab"
            aria-selected={!isAdmin}
            className={`ca-login-role-tab ${!isAdmin ? "active" : ""}`}
            onClick={() => changeRole("student")}
            disabled={loading}
          >
            {!isAdmin && (
              <motion.span
                className="ca-login-role-indicator"
                layoutId="ca-login-role-indicator"
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
              />
            )}
            <GraduationCap size={24} aria-hidden="true" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={isAdmin}
            className={`ca-login-role-tab ${isAdmin ? "active" : ""}`}
            onClick={() => changeRole("admin")}
            disabled={loading}
          >
            {isAdmin && (
              <motion.span
                className="ca-login-role-indicator"
                layoutId="ca-login-role-indicator"
                transition={{ type: "spring", stiffness: 340, damping: 30 }}
              />
            )}
            <ShieldCheck size={24} aria-hidden="true" />
            <span>Admin Login</span>
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role}
            className="ca-login-card-content"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 12, filter: reduceMotion ? "none" : "blur(2px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -10, filter: reduceMotion ? "none" : "blur(1px)" }}
            transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ca-auth-card-heading">
              <h2>
                Login to <span>Champion Arena</span>
              </h2>
              {isAdmin && <p className="ca-auth-card-subtitle">(Admin Portal)</p>}
            </div>

            {error && (
              <div className="ca-auth-notice error" role="alert">
                <Info size={17} /> <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="ca-auth-notice info" role="status">
                <Info size={17} /> <span>{info}</span>
              </div>
            )}

            <form className="ca-login-form" onSubmit={handleLogin}>
              <label className="ca-auth-input-wrap">
                <Mail size={20} aria-hidden="true" />
                <input
                  type="email"
                  name="email"
                  placeholder={isAdmin ? "Enter your admin email" : "Enter your email address"}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setInfo("");
                  }}
                  autoComplete="username"
                  inputMode="email"
                  maxLength={254}
                  required
                />
              </label>

              <label className="ca-auth-input-wrap">
                <LockKeyhole size={20} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                    setInfo("");
                  }}
                  autoComplete="current-password"
                  minLength={8}
                  maxLength={72}
                  required
                />
                <button
                  type="button"
                  className="ca-auth-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                </button>
              </label>

              <div className="ca-login-form-options">
                <label className="ca-auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span className="ca-auth-checkbox" aria-hidden="true" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="ca-auth-text-link"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>

              <button className="ca-auth-primary-button" type="submit" disabled={loading}>
                {loading ? <span className="ca-auth-spinner" /> : <LogIn size={21} />}
                <span>{loading ? "Please wait..." : isAdmin ? "Login as Admin" : "Login"}</span>
              </button>
            </form>

            <div className="ca-auth-divider">
              <span />
              <p>or continue with</p>
              <span />
            </div>

            <button
              type="button"
              className="ca-auth-google-button"
              onClick={() => setInfo("Google sign-in is not connected yet.")}
            >
              <span className="ca-auth-google-mark">G</span>
              <span>Continue with Google</span>
            </button>

            <div className="ca-auth-card-footer">
              <span>Don't have an account?</span>
              <button type="button" onClick={() => navigate("/register")}>
                Register Now <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </AuthLayout>
  );
}

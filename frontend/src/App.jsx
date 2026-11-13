import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Link,
} from "react-router-dom";
import HomePage from "./pages/public/HomePage";
import Login from "./components/auth/Login";
import Registration from "./components/auth/Registration";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { fetchCurrentUser } from "./services/sessionApi";

function SessionChecking({ message = "Checking your Champion Arena session…" }) {
  return (
    <main className="ca-auth-state" role="status" aria-live="polite">
      <div className="ca-auth-state-card">
        <div className="ca-auth-loading-spinner" aria-hidden="true" />
        <h1>Champion Arena</h1>
        <p>{message}</p>
      </div>
    </main>
  );
}

function AdminRoute() {
  const [session, setSession] = useState({ status: "checking", user: null });

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;

        if (user?.role === "admin") {
          setSession({ status: "authorized", user });
        } else if (user?.role === "student") {
          setSession({ status: "student", user });
        } else {
          setSession({ status: "unauthenticated", user: null });
        }
      })
      .catch(() => {
        if (active) setSession({ status: "unauthenticated", user: null });
      });

    return () => {
      active = false;
    };
  }, []);

  if (session.status === "checking") {
    return <SessionChecking message="Verifying administrator access…" />;
  }

  if (session.status === "student") {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (session.status !== "authorized") {
    return <Navigate to="/login" replace />;
  }

  return <AdminDashboard />;
}

function NotFoundPage() {
  return (
    <main className="ca-auth-state">
      <div className="ca-auth-state-card">
        <h1>Page not found</h1>
        <p>The page you requested does not exist.</p>
        <Link className="ca-primary-button" to="/login">
          Go to Login
        </Link>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
       <Route path="/register" element={<Registration />} />

        <Route path="/student/*" element={<StudentDashboard />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/*" element={<AdminRoute />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Public pages
import HomePage from "./pages/public/HomePage.jsx";

// Authentication pages
import Login from "./components/auth/Login.jsx";
import RegistrationPage from "./components/auth/Registration.jsx";

// Student and Admin dashboards
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<RegistrationPage />} />

        {/* Student */}
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Invalid routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

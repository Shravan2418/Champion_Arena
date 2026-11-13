import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Layers,
  ChartNoAxesColumnIncreasing,
  Award,
  BookOpen,
  Settings,
} from "lucide-react";

// Shared Admin Portal navigation data. Kept outside component modules so
// React Fast Refresh can safely treat AdminSidebar.jsx as a component module.
export const adminNavigation = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Students", path: "/admin/students", icon: Users },
  { label: "Exams", path: "/admin/exams", icon: CalendarDays },
  { label: "Question Bank", path: "/admin/question-bank", icon: FileText },
  { label: "Quizzes", path: "/admin/quizzes", icon: Layers },
  { label: "Results & Analytics", path: "/admin/results", icon: ChartNoAxesColumnIncreasing },
  { label: "Achievements", path: "/admin/achievements", icon: Award },
  { label: "Resources", path: "/admin/resources", icon: BookOpen },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

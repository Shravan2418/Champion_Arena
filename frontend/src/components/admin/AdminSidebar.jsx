import {
  LayoutDashboard, Users, CircleHelp, BookOpen,
  CalendarDays, Trophy, ClipboardCheck,
  ChartNoAxesColumnIncreasing, Award, Settings,
  LogOut, Crown
} from "lucide-react";

import BrandLogo from "../common/BrandLogo";

const items = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Students", icon: Users },
  { name: "Questions", icon: CircleHelp },
  { name: "Subjects", icon: BookOpen },
  { name: "Exams", icon: CalendarDays },
  { name: "Results", icon: ClipboardCheck },
  { name: "Leaderboard", icon: Trophy },
  { name: "Achievements", icon: Award },
  { name: "Reports", icon: ChartNoAxesColumnIncreasing },
  { name: "Settings", icon: Settings },
];

export default function AdminSidebar({ active, onSelect }) {
  return (
    <aside className="admin-sidebar">
      <BrandLogo />

      <div className="admin-panel-label">
        <Crown size={15} />
        <span>ADMIN PANEL</span>
      </div>

      <div className="admin-sidebar-line" />

      <nav className="admin-nav">
        {items.map(({ name, icon: Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={`admin-nav-item ${active === name ? "active" : ""}`}
          >
            <Icon size={22} strokeWidth={2} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <button
          type="button"
          className="admin-logout"
          onClick={() => alert("Logout will be connected to admin authentication.")}
        >
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

import {
  Trophy, LayoutDashboard, CalendarDays, ClipboardCheck,
  Award, ChartNoAxesColumnIncreasing, UserRound, Settings, LogOut
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "My Exams", icon: CalendarDays },
  { name: "Practice Quizzes", icon: ClipboardCheck },
  { name: "Leaderboard", icon: Trophy },
  { name: "Achievements", icon: Award },
  { name: "Reports", icon: ChartNoAxesColumnIncreasing },
  { name: "Profile", icon: UserRound },
  { name: "Settings", icon: Settings },
];

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Trophy className="brand-trophy" size={43} />
        <div className="brand-name">
          <span>Champion</span>
          <strong>Arena</strong>
        </div>
      </div>

      <div className="sidebar-divider" />

      <nav className="sidebar-menu">
        {menuItems.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={`menu-item ${active === name ? "active" : ""}`}
            onClick={() => setActive(name)}
          >
            <Icon size={21} />
            <span>{name}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="menu-item logout-item" onClick={() => alert("Logout functionality will be connected to authentication.")}>
          <LogOut size={21} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

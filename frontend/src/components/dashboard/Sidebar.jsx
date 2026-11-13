import {
  BookOpen, ChartNoAxesColumnIncreasing, ClipboardList,
  FileText, Home, LogOut, Star, Trophy, UserRound, X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: Home },
  { name: "Exams", icon: FileText },
  { name: "Quizzes", icon: ClipboardList },
  { name: "Leaderboard", icon: Trophy },
  { name: "Achievements", icon: Star },
  { name: "My Performance", icon: ChartNoAxesColumnIncreasing },
  { name: "Resources", icon: BookOpen },
  { name: "Profile", icon: UserRound },
];

export default function Sidebar({ active, onNavigate, onLogout, isOpen, onClose }) {
  return (
    <>
      <button type="button" className={`ca-sidebar-scrim ${isOpen ? "is-visible" : ""}`} aria-label="Close navigation" onClick={onClose} tabIndex={isOpen ? 0 : -1} />
      <aside className={`ca-sidebar ${isOpen ? "is-open" : ""}`}>
        <button type="button" className="ca-sidebar-close" onClick={onClose} aria-label="Close navigation"><X size={20} /></button>
        <nav className="ca-sidebar-nav" aria-label="Student navigation">
          {menuItems.map(({ name, icon: Icon }) => (
            <button key={name} type="button" className={`ca-sidebar-item ${active === name ? "is-active" : ""}`} onClick={() => onNavigate(name)} aria-current={active === name ? "page" : undefined}>
              <Icon size={23} strokeWidth={active === name ? 2.3 : 1.9} /><span>{name}</span>
            </button>
          ))}
          <button type="button" className="ca-sidebar-item ca-sidebar-logout" onClick={onLogout}><LogOut size={23} /><span>Logout</span></button>
        </nav>
        <div className="ca-sidebar-trophy-art" aria-hidden="true">
          <div className="ca-sidebar-trophy-glow" />
          <div className="ca-sidebar-laurel ca-sidebar-laurel-left">❧</div>
          <div className="ca-sidebar-trophy-cup"><Trophy size={78} strokeWidth={1.45} /><Star size={27} fill="currentColor" /></div>
          <div className="ca-sidebar-laurel ca-sidebar-laurel-right">❧</div>
          <div className="ca-sidebar-wave" />
        </div>
      </aside>
    </>
  );
}

import { LogOut, Trophy, X } from "lucide-react";
import { adminNavigation } from "./adminNavigation";

export default function AdminSidebar({ active, onSelect, open = false, onClose, onLogout }) {
  return (
    <>
      <button
        type="button"
        className={`admin-sidebar-scrim ${open ? "is-visible" : ""}`}
        aria-label="Close admin navigation"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />

      <aside className={`admin-sidebar ${open ? "is-open" : ""}`} aria-label="Admin navigation">
        <button className="admin-sidebar-close" type="button" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="admin-sidebar-nav-label">ADMIN WORKSPACE</div>

        <nav className="admin-nav">
          {adminNavigation.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              type="button"
              className={`admin-nav-item ${active === label ? "active" : ""}`}
              onClick={() => onSelect(path)}
              aria-current={active === label ? "page" : undefined}
            >
              <Icon size={22} strokeWidth={2} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button type="button" className="admin-nav-item admin-logout" onClick={onLogout}>
            <LogOut size={22} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </div>

        <div className="admin-sidebar-trophy" aria-hidden="true">
          <span className="admin-sidebar-laurel left">❧</span>
          <span className="admin-sidebar-laurel right">❧</span>
          <div className="admin-sidebar-trophy-glow" />
          <Trophy size={92} strokeWidth={1.55} />
          <StarMark />
          <div className="admin-sidebar-wave" />
        </div>
      </aside>
    </>
  );
}

function StarMark() {
  return <span className="admin-sidebar-trophy-star">★</span>;
}

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import BrandLogo from "../common/BrandLogo";

const initialsFromName = (name = "Student") =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "S";

export default function Header({ user, onMenuClick, onLogout, onNavigate }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const studentName = user?.full_name || user?.fullName || "Student";
  const closeMenus = () => { setProfileOpen(false); setNotificationsOpen(false); };

  return (
    <header className="ca-topbar">
      <button type="button" className="ca-mobile-menu" onClick={onMenuClick} aria-label="Open student navigation">
        <Menu size={23} />
      </button>
      <div className="ca-header-brand"><BrandLogo /></div>
      <span className="ca-header-separator" aria-hidden="true" />
      <div className="ca-topbar-spacer" />

      <div className="ca-header-popover-wrap">
        <button type="button" className={`ca-icon-button ca-notification-trigger ${notificationsOpen ? "is-open" : ""}`} aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }}>
          <Bell size={24} /><span className="ca-notification-count">1</span>
        </button>
        <AnimatePresence>
          {notificationsOpen && (
            <motion.div className="ca-header-popover ca-notification-popover" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.16 }}>
              <strong>Notifications</strong>
              <p>Sample preview notification: your next learning challenge is waiting.</p>
              <small>Demo content · Live notification feed not connected</small>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="ca-header-profile-divider" aria-hidden="true" />
      <div className="ca-header-popover-wrap">
        <button type="button" className="ca-profile-trigger" aria-expanded={profileOpen} onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }}>
          <span className="ca-student-avatar">{initialsFromName(studentName)}</span>
          <span className="ca-profile-name">{studentName}</span>
          <ChevronDown size={17} className={profileOpen ? "is-rotated" : ""} />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div className="ca-header-popover ca-profile-popover" initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.16 }}>
              <div className="ca-popover-user">
                <span className="ca-student-avatar">{initialsFromName(studentName)}</span>
                <span><strong>{studentName}</strong><small>Student</small></span>
              </div>
              <button type="button" onClick={() => { closeMenus(); onNavigate("Profile"); }}><UserRound size={16} /> View profile</button>
              <button type="button" className="ca-popover-logout" onClick={() => { closeMenus(); onLogout(); }}><LogOut size={16} /> Logout</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}


import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Target,
  FileText,
  Trophy,
  Star,
  Info,
  Menu,
  X,
} from "lucide-react";
import "./ArenaNavbar.css";

const LOGO = "/images/champion-arena-logo.png";

const NAV_ITEMS = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Practice", href: "#features", icon: Target },
  { label: "Exams", href: "#journey", icon: FileText },
  { label: "Leaderboard", href: "#rewards", icon: Trophy },
  { label: "Achievements", href: "#achievements", icon: Star },
  { label: "About", href: "#about", icon: Info },
];

export default function ArenaNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";

  const closeMenu = () => setMenuOpen(false);

  const getHref = (href) => {
    return isHome ? href : `/${href}`;
  };

  return (
    <header className="arena-navbar">
      <div className="arena-nav-inner">

        <button
          type="button"
          className="arena-brand"
          onClick={() => {
            closeMenu();
            navigate("/");
          }}
          aria-label="Champion Arena home"
        >
          <img src={LOGO} alt="Champion Arena" />
        </button>

        <span className="nav-divider" aria-hidden="true" />

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          className={`arena-nav-links ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={getHref(href)}
              className={`arena-nav-link ${
                isHome && label === "Home" ? "is-active" : ""
              }`}
              onClick={closeMenu}
            >
              <Icon size={17} strokeWidth={2.2} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="arena-nav-actions">
          <button
            type="button"
            className={`arena-login-btn ${isLogin ? "is-current" : ""}`}
            onClick={() => {
              closeMenu();
              navigate("/login");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={`arena-join-btn ${isRegister ? "is-current" : ""}`}
            onClick={() => {
              closeMenu();
              navigate("/register");
            }}
          >
            Join the Arena
          </button>
        </div>

      </div>
    </header>
  );
}

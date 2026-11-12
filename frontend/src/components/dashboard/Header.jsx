import { Menu, Bell, Coins, Gem, Plus, ChevronDown } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onMenuClick}>
        <Menu size={25} />
      </button>

      <div className="topbar-spacer" />

      <div className="currency-group">
        <div className="currency-pill">
          <Coins size={25} className="coin-icon" />
          <strong>3,420</strong>
          <button aria-label="Get more coins"><Plus size={17} /></button>
        </div>

        <div className="currency-pill">
          <Gem size={25} className="gem-icon" />
          <strong>245</strong>
          <button aria-label="Get more gems"><Plus size={17} /></button>
        </div>
      </div>

      <button className="notification-button" aria-label="Notifications">
        <Bell size={23} />
        <span className="notification-dot" />
      </button>

      <div className="profile-divider" />

      <button className="profile-menu">
        <div className="avatar">S</div>
        <span>Shravan</span>
        <ChevronDown size={17} />
      </button>
    </header>
  );
}

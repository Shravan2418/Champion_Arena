import { useState } from "react";
import {
  UserRound,
  Pencil,
  ShieldCheck,
  Award,
  Target,
  Trophy,
  Flame,
  Download,
  FileBadge,
  KeyRound,
  LogOut,
  Mail,
  IdCard,
  GraduationCap,
  Building2,
  CalendarDays,
  X,
  CheckCircle2,
  Info,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { PageBanner, GlassPanel, ProgressBar } from "../../components/student/PortalUI";

const initialProfile = {
  fullName: "",
  email: "",
  rollNumber: "",
  department: "",
  yearSemester: "",
};

export default function ProfilePage({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [profile, setProfile] = useState(() => ({
    ...initialProfile,
    fullName: user?.full_name || user?.fullName || "",
    email: user?.email || "",
  }));
  const [draft, setDraft] = useState(() => ({
    ...initialProfile,
    fullName: user?.full_name || user?.fullName || "",
    email: user?.email || "",
  }));
  const [saveMessage, setSaveMessage] = useState("");
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState({ current: "", next: "", confirm: "" });

  const displayedName = profile.fullName || user?.full_name || user?.fullName || "Student";
  const displayedEmail = profile.email || user?.email || "Not available";
  const updateDraft = (field, value) => setDraft((previous) => ({ ...previous, [field]: value }));
  const saveProfilePreview = (event) => {
    event.preventDefault();
    setProfile(draft);
    setSaveMessage("Preview updated locally. Connect the profile API to persist these changes to your account.");
  };

  const downloadReport = () => {
    const rows = [
      ["Metric", "Value", "Data status"],
      ["Student", profile.fullName, "Displayed profile value"],
      ["Average accuracy", "86%", "Sample data"],
      ["Exams taken", "12", "Sample data"],
      ["Quizzes taken", "20", "Sample data"],
      ["Total score", "1,250", "Sample data"],
      ["XP", "2,350 / 3,000", "Sample data"],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "champion-arena-sample-profile-report.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="portal-page profile-page">
      <PageBanner
        icon={IdCard}
        eyebrow="YOUR ACCOUNT • YOUR PROGRESS"
        title="My"
        accent="Profile"
        description="Manage your account, track your progress, and personalize your experience."
        art={() => <div className="banner-profile-art"><GraduationCapFallback /><Trophy size={91} /><span>✦</span></div>}
      />

      <section className="profile-summary-card">
        <div className="profile-summary-user">
          <div className="profile-large-avatar"><span>{displayedName.trim().charAt(0).toUpperCase() || "S"}</span><button type="button" title="Avatar upload is not connected" aria-label="Avatar upload unavailable"><Pencil size={14} /></button></div>
          <div className="profile-user-name"><h2>{displayedName}</h2><span className="student-role-pill"><GraduationCap size={15} /> Student</span><strong><span className="gold-shield">★</span> Level 4 <i>•</i> <b>Gold</b></strong></div>
        </div>
        <div className="profile-xp-summary"><div><strong>2,350 / 3,000 XP</strong><span>Level 4 <i>→</i> Level 5</span></div><ProgressBar value={78.3} tone="green" /></div>
        <div className="profile-current-tier"><Trophy size={56} /><strong>Gold</strong><span>Current Tier</span></div>
      </section>

      <div className="profile-tabs" role="tablist" aria-label="Profile sections">
        {[{ name: "Overview", icon: Award }, { name: "Edit Profile", icon: Pencil }, { name: "Security & Privacy", icon: ShieldCheck }].map(({ name, icon: Icon }) => <button key={name} type="button" role="tab" aria-selected={activeTab === name} className={activeTab === name ? "selected" : ""} onClick={() => { setActiveTab(name); setSaveMessage(""); }}><Icon size={18} />{name}</button>)}
      </div>

      {activeTab === "Overview" && <div className="profile-overview-grid">
        <GlassPanel title="Personal Information" icon={IdCard} className="profile-info-panel" action={<button type="button" className="panel-icon-action" onClick={() => { setDraft(profile); setActiveTab("Edit Profile"); }} aria-label="Edit profile"><Pencil size={17} /></button>}>
          <ProfileInfoRow icon={UserRound} label="Full Name" value={displayedName} />
          <ProfileInfoRow icon={Mail} label="Email" value={displayedEmail} />
          <ProfileInfoRow icon={IdCard} label="Roll Number" value={profile.rollNumber || "Not provided"} />
          <ProfileInfoRow icon={Building2} label="Department" value={profile.department || "Not provided"} />
          <ProfileInfoRow icon={CalendarDays} label="Year / Semester" value={profile.yearSemester || "Not provided"} />
          <small className="profile-data-note"><Info size={13} /> Academic details were not included in the uploaded frontend source.</small>
        </GlassPanel>

        <div className="profile-center-column">
          <GlassPanel title="Performance Summary" icon={Target} action={<button type="button" className="portal-text-action" onClick={() => onNavigate?.("My Performance")}>View Details →</button>}>
            <div className="profile-performance-grid"><ProfileMetric icon={Target} value="86%" label="Avg. Accuracy" tone="purple" /><ProfileMetric icon={Trophy} value="12" label="Exams Taken" tone="gold" /><ProfileMetric icon={CheckCircle2} value="20" label="Quizzes Taken" tone="cyan" /><ProfileMetric icon={Award} value="1,250" label="Total Score" tone="green" /></div>
          </GlassPanel>
          <GlassPanel title="Achievements" icon={Award} action={<button type="button" className="portal-text-action" onClick={() => onNavigate?.("Achievements")}>View All →</button>}>
            <div className="profile-achievement-row"><ProfileBadge tone="silver" icon={Award} title="Silver" label="Accuracy" /><ProfileBadge tone="gold" icon={Trophy} title="Gold" label="Performance" /><ProfileBadge tone="red" icon={Flame} title="Streak" label="7 Days" /></div>
          </GlassPanel>
        </div>

        <GlassPanel title="Quick Actions" icon={Zap} className="profile-quick-panel">
          <button className="profile-quick-action" type="button" onClick={downloadReport}><Download size={19} /> Download Reports</button>
          <button className="profile-quick-action" type="button" onClick={() => setCertificateOpen(true)}><FileBadge size={19} /> My Certificates</button>
          <button className="profile-quick-action" type="button" onClick={() => setActiveTab("Security & Privacy")}><KeyRound size={19} /> Change Password</button>
          <button className="profile-quick-action danger" type="button" onClick={onLogout}><LogOut size={19} /> Logout</button>
          <small>Report export contains clearly marked sample metrics. Certificate and password services are not connected in this frontend archive.</small>
        </GlassPanel>
      </div>}

      {activeTab === "Edit Profile" && <GlassPanel title="Edit Personal Information" icon={Pencil} className="profile-edit-panel">
        <form className="profile-edit-form" onSubmit={saveProfilePreview}>
          <label>Full Name<input value={draft.fullName} onChange={(event) => updateDraft("fullName", event.target.value)} required maxLength={80} /></label>
          <label>Email<input type="email" value={draft.email} onChange={(event) => updateDraft("email", event.target.value)} placeholder="Email not supplied" /></label>
          <label>Roll Number<input value={draft.rollNumber} onChange={(event) => updateDraft("rollNumber", event.target.value)} placeholder="Roll number not supplied" /></label>
          <label>Department<input value={draft.department} onChange={(event) => updateDraft("department", event.target.value)} placeholder="Department not supplied" /></label>
          <label>Year / Semester<input value={draft.yearSemester} onChange={(event) => updateDraft("yearSemester", event.target.value)} placeholder="Year / semester not supplied" /></label>
          <div className="profile-form-note"><Info size={16} /> Changes are kept in this page preview only. No profile update API was present in the supplied source.</div>
          {saveMessage && <p className="profile-save-message"><CheckCircle2 size={16} /> {saveMessage}</p>}
          <div className="profile-form-actions"><button type="button" className="portal-button secondary" onClick={() => { setDraft(profile); setSaveMessage(""); }}>Reset</button><button type="submit" className="portal-button primary">Save Preview</button></div>
        </form>
      </GlassPanel>}

      {activeTab === "Security & Privacy" && <GlassPanel title="Security & Privacy" icon={ShieldCheck} className="profile-security-panel">
        <div className="profile-security-banner"><ShieldCheck size={31} /><div><strong>Protect your account</strong><p>Password updates and active-session management require the backend security endpoints.</p></div></div>
        <form className="profile-security-form" onSubmit={(event) => { event.preventDefault(); setSaveMessage("Password change is not connected. No password was changed."); }}>
          <label>Current Password<div><input type={showPassword ? "text" : "password"} value={passwordDraft.current} onChange={(event) => setPasswordDraft((value) => ({ ...value, current: event.target.value }))} placeholder="Enter current password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          <label>New Password<input type="password" value={passwordDraft.next} onChange={(event) => setPasswordDraft((value) => ({ ...value, next: event.target.value }))} placeholder="Enter new password" /></label>
          <label>Confirm New Password<input type="password" value={passwordDraft.confirm} onChange={(event) => setPasswordDraft((value) => ({ ...value, confirm: event.target.value }))} placeholder="Confirm new password" /></label>
          <div className="profile-form-note"><Info size={16} /> Password form is a visual preview only; submitting it will not send or store your password.</div>
          {saveMessage && <p className="profile-save-message"><Info size={16} /> {saveMessage}</p>}
          <button type="submit" className="portal-button primary" disabled={!passwordDraft.current || !passwordDraft.next || !passwordDraft.confirm}>Save Password Preview</button>
        </form>
      </GlassPanel>}

      {certificateOpen && <div className="portal-modal-backdrop" onMouseDown={() => setCertificateOpen(false)}><section className="portal-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}><button className="portal-modal-close" type="button" onClick={() => setCertificateOpen(false)} aria-label="Close"><X size={18} /></button><div className="portal-modal-icon"><FileBadge size={29} /></div><h2>My Certificates</h2><p>No certificate files or certificate API are available in the uploaded frontend. Completed certificates will appear here when connected.</p><button type="button" className="portal-button primary modal-full-button" onClick={() => setCertificateOpen(false)}>Close</button></section></div>}
    </div>
  );
}

function ProfileInfoRow({ icon: Icon, label, value }) {
  return <div className="profile-info-row"><Icon size={19} /><strong>{label}</strong><span>{value}</span></div>;
}

function ProfileMetric({ icon: Icon, value, label, tone }) {
  return <div className={`profile-metric tone-${tone}`}><span><Icon size={25} /></span><strong>{value}</strong><small>{label}</small></div>;
}

function ProfileBadge({ icon: Icon, tone, title, label }) {
  return <div className="profile-badge"><span className={`profile-badge-icon ${tone}`}><Icon size={31} /></span><strong>{title}</strong><small>{label}</small></div>;
}

function GraduationCapFallback() {
  return <div className="profile-graduation-cap"><Award size={76} /></div>;
}


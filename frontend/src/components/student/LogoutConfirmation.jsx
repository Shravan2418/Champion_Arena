import { useState } from "react";
import { LogOut, X, ShieldCheck, AlertCircle } from "lucide-react";

export default function LogoutConfirmation({ open, onCancel, onConfirm, error = "" }) {
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;

  const confirmLogout = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="logout-modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section className="logout-confirmation-card" role="dialog" aria-modal="true" aria-labelledby="logout-title" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="logout-modal-close" onClick={onCancel} aria-label="Close logout dialog" disabled={submitting}><X size={24} /></button>
        <div className="logout-door-illustration"><div className="logout-door-glow" /><div className="logout-door"><LogOut size={70} /></div><div className="logout-door-light" /><span>✦</span></div>
        <h2 id="logout-title">Logout from Champion Arena?</h2>
        <p>Are you sure you want to end your session?<br />You can always log in again to continue your progress.</p>
        {error && <div className="logout-integration-note" role="alert"><AlertCircle size={17} /> {error}</div>}
        <div className="logout-modal-actions">
          <button type="button" className="logout-cancel-button" onClick={onCancel} disabled={submitting}>Cancel</button>
          <button type="button" className="logout-confirm-button" onClick={confirmLogout} disabled={submitting}><LogOut size={24} /> {submitting ? "Signing out…" : "Logout"}</button>
        </div>
        <div className="logout-security-note"><ShieldCheck size={14} /> Your progress is associated with your account</div>
      </section>
    </div>
  );
}

import { motion } from "motion/react";

export function PageBanner({
  icon: Icon,
  eyebrow = "CHAMPION ARENA",
  title,
  accent,
  description,
  art: Art,
}) {
  return (
    <motion.section
      className="portal-banner"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="portal-banner-icon">{Icon && <Icon size={42} strokeWidth={2.1} />}</div>
      <div className="portal-banner-copy">
        <span className="portal-eyebrow">{eyebrow}</span>
        <h1>
          {title} {accent && <strong>{accent}</strong>}
        </h1>
        <p>{description}</p>
        <span className="portal-banner-underline" />
      </div>
      <div className="portal-banner-art" aria-hidden="true">
        <div className="portal-banner-orbit orbit-one" />
        <div className="portal-banner-orbit orbit-two" />
        {Art ? <Art /> : Icon && <Icon size={94} strokeWidth={1.1} />}
        <span className="banner-spark spark-one">✦</span>
        <span className="banner-spark spark-two">✧</span>
        <span className="banner-spark spark-three">✦</span>
      </div>
    </motion.section>
  );
}

export function StatCard({ icon: Icon, value, label, tone = "purple", helper }) {
  return (
    <motion.article
      className={`portal-stat-card tone-${tone}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={{ y: -3 }}
    >
      <div className="portal-stat-icon">{Icon && <Icon size={27} strokeWidth={2.3} />}</div>
      <div className="portal-stat-copy">
        <strong>{value}</strong>
        <span>{label}</span>
        {helper && <small>{helper}</small>}
      </div>
    </motion.article>
  );
}

export function GlassPanel({
  title,
  icon: Icon,
  action,
  className = "",
  children,
}) {
  return (
    <section className={`portal-panel ${className}`}>
      {(title || action) && (
        <div className="portal-panel-heading">
          <div className="portal-panel-title">
            {Icon && <Icon size={21} />}
            {title && <h2>{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PortalTabs({ items, value, onChange, className = "" }) {
  return (
    <div className={`portal-tabs ${className}`} role="tablist">
      {items.map((item) => {
        const label = typeof item === "string" ? item : item.label;
        const Icon = typeof item === "string" ? null : item.icon;
        return (
          <button
            type="button"
            role="tab"
            aria-selected={value === label}
            key={label}
            className={value === label ? "selected" : ""}
            onClick={() => onChange(label)}
          >
            {Icon && <Icon size={17} />}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value, tone = "purple" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`portal-progress tone-${tone}`}>
      <span style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function EmptyState({ title = "Nothing to show yet", description }) {
  return (
    <div className="portal-empty-state">
      <span className="portal-empty-icon">✦</span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}

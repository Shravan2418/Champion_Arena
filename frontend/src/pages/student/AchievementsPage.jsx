import { useMemo, useState } from "react";
import {
  Award,
  Medal,
  Flame,
  GraduationCap,
  ChartNoAxesColumnIncreasing,
  Trophy,
  Star,
  Target,
  Lock,
  CheckCircle2,
  CalendarDays,
  Crown,
  Sparkles,
  X,
} from "lucide-react";
import { PageBanner, StatCard, GlassPanel, PortalTabs, ProgressBar, EmptyState } from "../../components/student/PortalUI";

const achievementData = [
  { id: "first-steps", name: "First Steps", category: "Progress", description: "Complete your first practice quiz and begin your learning journey.", requirement: "Complete 1 practice quiz", reward: 50, unlocked: true, date: "Nov 02, 2026", icon: Target, metal: "gold" },
  { id: "streak-master", name: "Streak Master", category: "Progress", description: "Maintain a consistent seven-day learning streak.", requirement: "Maintain a 7-day streak", reward: 100, unlocked: true, date: "Nov 08, 2026", icon: Flame, metal: "red" },
  { id: "exam-explorer", name: "Exam Explorer", category: "Exams", description: "Attempt ten examinations and explore different subjects.", requirement: "Attempt 10 exams", reward: 150, unlocked: true, date: "Nov 09, 2026", icon: GraduationCap, metal: "purple" },
  { id: "high-achiever", name: "High Achiever", category: "Exams", description: "Score 90% or above in an examination.", requirement: "Score 90%+ in an exam", reward: 200, unlocked: true, date: "Nov 10, 2026", icon: ChartNoAxesColumnIncreasing, metal: "red" },
  { id: "quiz-champion", name: "Quiz Champion", category: "Quizzes", description: "Complete twenty practice quizzes.", requirement: "Complete 20 quizzes", reward: 200, unlocked: true, date: "Nov 10, 2026", icon: Trophy, metal: "blue" },
  { id: "consistent-learner", name: "Consistent Learner", category: "Study", description: "Practice for fifteen consecutive days.", requirement: "Practice for 15 days", reward: 250, unlocked: true, date: "Nov 11, 2026", icon: CalendarDays, metal: "purple" },
  { id: "perfectionist", name: "Perfectionist", category: "Special", description: "Achieve a perfect score in an examination.", requirement: "Score 100% in any exam", reward: 300, unlocked: false, progress: 0, icon: Star, metal: "silver" },
  { id: "elite-scholar", name: "Elite Scholar", category: "Special", description: "Unlock thirty achievements across the platform.", requirement: "Unlock 30 achievements", reward: 500, unlocked: false, progress: 53, icon: Crown, metal: "silver" },
];

const categories = ["All Badges", "Progress", "Study", "Exams", "Quizzes", "Special"];

function AchievementModal({ item, onClose }) {
  if (!item) return null;
  const Icon = item.icon;
  return (
    <div className="portal-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="portal-modal achievement-modal" role="dialog" aria-modal="true" aria-labelledby="achievement-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="portal-modal-close" type="button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        <div className={`achievement-medal-art metal-${item.metal}`}><Icon size={43} /></div>
        <span className="portal-eyebrow">{item.unlocked ? "ACHIEVEMENT UNLOCKED" : "ACHIEVEMENT LOCKED"}</span>
        <h2 id="achievement-modal-title">{item.name}</h2>
        <p>{item.description}</p>
        <div className="achievement-modal-requirement"><strong>Unlock criteria</strong><span>{item.requirement}</span></div>
        <div className="achievement-modal-reward"><Sparkles size={18} /> Reward: <strong>+{item.reward} XP</strong></div>
        {item.unlocked ? <span className="achievement-earned-date">Unlocked {item.date}</span> : <><ProgressBar value={item.progress ?? 0} tone="gold" /><small className="achievement-modal-progress">{item.progress ?? 0}% progress</small></>}
        <button type="button" className="portal-button primary modal-full-button" onClick={onClose}>Got it</button>
      </section>
    </div>
  );
}

export default function AchievementsPage() {
  const [category, setCategory] = useState("All Badges");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => achievementData.filter((item) => category === "All Badges" || item.category === category), [category]);
  const unlocked = achievementData.filter((item) => item.unlocked).length;
  const recent = achievementData.filter((item) => item.unlocked).slice(1, 4);

  return (
    <div className="portal-page achievements-page">
      <PageBanner
        icon={Award}
        eyebrow="EARN • UNLOCK • CELEBRATE"
        title="My"
        accent="Achievements"
        description="Track your milestones, earn badges, and showcase your progress!"
        art={() => <div className="banner-achievement-art"><Medal className="achievement-large-medal" size={95} /><Trophy className="achievement-large-trophy" size={112} /><span>✦</span></div>}
      />

      <div className="portal-stat-grid four-columns">
        <StatCard icon={Medal} value="24" label="Total Achievements" tone="gold" />
        <StatCard icon={CheckCircle2} value="16" label="Unlocked" tone="green" />
        <StatCard icon={Lock} value="8" label="Locked" tone="red" />
        <StatCard icon={Star} value="67%" label="Completion Rate" tone="purple" />
      </div>

      <div className="achievement-layout">
        <GlassPanel className="achievement-collection-panel">
          <PortalTabs items={categories} value={category} onChange={setCategory} className="achievement-category-tabs" />
          <div className="achievement-grid reference-achievement-grid">
            {filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button type="button" key={item.id} className={`achievement-card ${item.unlocked ? "is-unlocked" : "is-locked"}`} onClick={() => setSelected(item)}>
                  <span className={`achievement-medal-art metal-${item.metal}`}><Icon size={39} /></span>
                  <strong>{item.name}</strong>
                  <span className="achievement-card-description">{item.requirement}</span>
                  {item.unlocked ? <span className="achievement-state unlocked"><CheckCircle2 size={14} /> Unlocked</span> : <span className="achievement-state locked"><Lock size={13} /> Locked</span>}
                </button>
              );
            })}
            {filtered.length === 0 && <EmptyState title="No achievements in this category" />}
          </div>
          <div className="portal-panel-foot"><span className="demo-data-tag">Sample achievement data</span><span>Showing {filtered.length} featured badges</span></div>
        </GlassPanel>

        <div className="achievement-side-column">
          <GlassPanel title="Your Achievement Progress" icon={Trophy} className="achievement-progress-panel">
            <div className="achievement-progress-body">
              <div className="achievement-donut"><div><strong>67%</strong><span>Completed</span></div></div>
              <div className="achievement-progress-copy"><strong>16 / 24 Achievements</strong><ProgressBar value={67} tone="green" /><small>{unlocked} featured badges unlocked in this sample view</small></div>
            </div>
          </GlassPanel>
          <GlassPanel title="Recent Achievements" icon={Sparkles} className="recent-achievements-panel" action={<button className="portal-text-action" type="button" onClick={() => setCategory("All Badges")}>View All →</button>}>
            <div className="recent-achievement-list">
              {recent.map((item) => {
                const Icon = item.icon;
                return <div className="recent-achievement-row" key={item.id}><span className={`recent-achievement-icon metal-${item.metal}`}><Icon size={21} /></span><div><strong>{item.name}</strong><small>{item.requirement}</small></div><time>{item.date.replace(", 2026", "")}</time></div>;
              })}
            </div>
          </GlassPanel>
        </div>
      </div>

      <AchievementModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

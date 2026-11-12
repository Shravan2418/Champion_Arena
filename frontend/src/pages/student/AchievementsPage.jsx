import { useMemo, useState } from "react";
import {
  Award, Trophy, Medal, Flame, Brain, BookOpen, Target,
  Lock, CheckCircle2, Zap, Star, Shield, Sparkles, X
} from "lucide-react";

const achievements = [
  { id: 1, name: "First Victory", category: "Exams", description: "Complete your first exam successfully.", requirement: "Complete 1 exam", earned: true, date: "Nov 02, 2026", icon: Trophy, color: "gold" },
  { id: 2, name: "Perfect Ten", category: "Exams", description: "Answer 10 questions correctly in a row.", requirement: "10 consecutive correct answers", earned: true, date: "Nov 04, 2026", icon: Star, color: "purple" },
  { id: 3, name: "Seven Day Streak", category: "Streaks", description: "Study or practice for seven consecutive days.", requirement: "Reach a 7-day streak", earned: true, date: "Nov 08, 2026", icon: Flame, color: "orange" },
  { id: 4, name: "Quiz Explorer", category: "Practice", description: "Complete five practice quizzes.", requirement: "Complete 5 practice quizzes", earned: true, date: "Nov 09, 2026", icon: Brain, color: "blue" },
  { id: 5, name: "Knowledge Seeker", category: "Practice", description: "Explore questions from five different subjects.", requirement: "Practice 5 subjects", earned: true, date: "Nov 10, 2026", icon: BookOpen, color: "green" },
  { id: 6, name: "Rising Champion", category: "Milestones", description: "Reach 2,000 experience points.", requirement: "Earn 2,000 XP", earned: true, date: "Nov 11, 2026", icon: Medal, color: "gold" },
  { id: 7, name: "Consistency Pro", category: "Streaks", description: "Maintain a 14-day learning streak.", requirement: "Reach a 14-day streak", earned: false, progress: 50, icon: Flame, color: "orange" },
  { id: 8, name: "Exam Master", category: "Exams", description: "Successfully complete 20 exams.", requirement: "Complete 20 exams", earned: false, progress: 45, icon: Shield, color: "blue" },
  { id: 9, name: "Accuracy Ace", category: "Exams", description: "Reach 95% average exam accuracy.", requirement: "Reach 95% accuracy", earned: false, progress: 86, icon: Target, color: "green" },
  { id: 10, name: "Learning Machine", category: "Practice", description: "Complete 25 practice quizzes.", requirement: "Complete 25 quizzes", earned: false, progress: 32, icon: Brain, color: "purple" },
  { id: 11, name: "Elite Champion", category: "Milestones", description: "Earn 5,000 experience points.", requirement: "Earn 5,000 XP", earned: false, progress: 47, icon: Zap, color: "gold" },
  { id: 12, name: "Legendary Streak", category: "Streaks", description: "Maintain a 30-day learning streak.", requirement: "Reach a 30-day streak", earned: false, progress: 23, icon: Sparkles, color: "purple" },
];

const categories = ["All", "Exams", "Practice", "Streaks", "Milestones"];

export default function AchievementsPage() {
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);

  const earnedCount = achievements.filter((a) => a.earned).length;
  const filtered = useMemo(() => achievements.filter((a) => {
    const categoryMatch = category === "All" || a.category === category;
    const statusMatch = status === "All" || (status === "Earned" ? a.earned : !a.earned);
    return categoryMatch && statusMatch;
  }), [category, status]);

  return (
    <div className="feature-page achievements-page">
      <div className="feature-page-header">
        <div>
          <span className="feature-eyebrow">EVERY MILESTONE MATTERS</span>
          <h1><Award /> My Achievements</h1>
          <p>Celebrate your progress and unlock new milestones as you learn.</p>
        </div>
        <div className="feature-header-icon achievements-header-icon"><Medal /></div>
      </div>

      <section className="achievement-overview">
        <div className="achievement-overview-main">
          <div className="achievement-overview-icon"><Trophy /></div>
          <div className="achievement-overview-copy">
            <span>YOUR ACHIEVEMENT JOURNEY</span>
            <h2>{earnedCount} of {achievements.length} Badges Earned</h2>
            <p>Every quiz, exam and learning streak brings you closer to the next badge.</p>
            <div className="achievement-overview-track"><span style={{ width: `${earnedCount / achievements.length * 100}%` }} /></div>
            <small>{Math.round(earnedCount / achievements.length * 100)}% completed</small>
          </div>
        </div>
        <div className="achievement-xp">
          <Sparkles />
          <span>EXPERIENCE POINTS</span>
          <strong>2,350 <small>/ 3,000 XP</small></strong>
          <div className="achievement-xp-track"><span /></div>
          <small>650 XP to Gold Level 5</small>
        </div>
      </section>

      <section className="achievement-stats">
        <article><div className="achievement-stat-icon earned-stat"><CheckCircle2 /></div><span>Earned Badges</span><strong>{earnedCount}</strong></article>
        <article><div className="achievement-stat-icon locked-stat"><Lock /></div><span>Locked Badges</span><strong>{achievements.length - earnedCount}</strong></article>
        <article><div className="achievement-stat-icon points-stat"><Star /></div><span>XP Collected</span><strong>2,350</strong></article>
        <article><div className="achievement-stat-icon streak-stat"><Flame /></div><span>Current Streak</span><strong>7 Days</strong></article>
      </section>

      <section className="feature-panel achievement-collection">
        <div className="feature-panel-heading achievement-collection-heading">
          <div><h2><Medal /> Badge Collection</h2><p>Unlock badges by reaching your learning goals.</p></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter badge status">
            <option>All</option><option>Earned</option><option>Locked</option>
          </select>
        </div>

        <div className="achievement-category-tabs">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={category === item ? "selected" : ""}>{item}</button>
          ))}
        </div>

        <div className="achievement-grid">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`achievement-badge-card ${item.earned ? "" : "badge-locked"}`} key={item.id} onClick={() => setSelected(item)}>
                <div className={`achievement-badge-art ${item.color}`}>
                  <Icon size={34} />
                  {item.earned ? <span className="badge-check"><CheckCircle2 size={18} /></span> : <span className="badge-lock"><Lock size={16} /></span>}
                </div>
                <strong>{item.name}</strong>
                <span className="badge-category">{item.category}</span>
                <p>{item.earned ? `Earned ${item.date}` : item.requirement}</p>
                {!item.earned && <div className="badge-progress"><span style={{ width: `${item.progress}%` }} /></div>}
                {!item.earned && <small>{item.progress}% complete</small>}
                {item.earned && <span className="earned-tag">EARNED</span>}
              </button>
            );
          })}
          {filtered.length === 0 && <p className="empty-table">No badges in this category yet.</p>}
        </div>
      </section>

      {selected && (
        <div className="feature-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
            <button className="feature-modal-close" onClick={() => setSelected(null)} aria-label="Close"><X /></button>
            <div className={`achievement-badge-art modal-badge-art ${selected.color}`}><selected.icon size={42} /></div>
            <span className="feature-eyebrow">{selected.earned ? "BADGE UNLOCKED" : "BADGE IN PROGRESS"}</span>
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <strong>{selected.requirement}</strong>
            {!selected.earned && <div className="badge-progress modal-progress"><span style={{ width: `${selected.progress}%` }} /></div>}
            {selected.earned && <span className="earned-tag">Earned {selected.date}</span>}
            <button className="feature-primary-button" onClick={() => setSelected(null)}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}

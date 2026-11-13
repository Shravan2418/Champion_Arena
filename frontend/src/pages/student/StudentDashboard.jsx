import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Award, BookOpen, CalendarDays, ChartNoAxesColumnIncreasing,
  CheckCircle2, ChevronRight, CirclePlay, FileText, Flame,
  Medal, ShieldCheck, Sparkles, Star, Target, Trophy, Zap,
} from "lucide-react";

import Header from "../../components/dashboard/Header";
import Sidebar from "../../components/dashboard/Sidebar";
import ExamsPage from "./ExamsPage";
import QuizzesPage from "./QuizzesPage";
import LeaderboardPage from "./LeaderboardPage";
import AchievementsPage from "./AchievementsPage";
import ReportsPage from "./ReportsPage";
import ResourcesPage from "./ResourcesPage";
import ProfilePage from "./ProfilePage";
import LogoutConfirmation from "../../components/student/LogoutConfirmation";
import { fetchCurrentUser, logoutSession } from "../../services/sessionApi";
import { studentDashboardDemo } from "./studentDashboard.demo";
import "../../styles/student-dashboard.css";
import "../../styles/student-portal.css";

const DEMO_MODE = import.meta.env.DEV && import.meta.env.VITE_DASHBOARD_DEMO_MODE === "true";
const staticMotion = { initial: false, animate: false, transition: { duration: 0 } };
const fmt = (value) => Number(value || 0).toLocaleString("en-IN");
const initials = (name = "Student") => name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() || "").join("") || "S";

const studentRoutes = {
  Dashboard: "/student/dashboard",
  Exams: "/student/exams",
  Quizzes: "/student/quizzes",
  Leaderboard: "/student/leaderboard",
  Achievements: "/student/achievements",
  "My Performance": "/student/performance",
  Resources: "/student/resources",
  Profile: "/student/profile",
};

const studentRouteAliases = {
  dashboard: "Dashboard", home: "Dashboard",
  exams: "Exams", exam: "Exams", "my-exams": "Exams", myexams: "Exams",
  quizzes: "Quizzes", quiz: "Quizzes", "practice-quizzes": "Quizzes",
  leaderboard: "Leaderboard", rankings: "Leaderboard",
  achievements: "Achievements", achievement: "Achievements", badges: "Achievements",
  performance: "My Performance", "my-performance": "My Performance", myperformance: "My Performance",
  reports: "My Performance", report: "My Performance", results: "My Performance",
  resources: "Resources", resource: "Resources", "study-resources": "Resources",
  profile: "Profile", "my-profile": "Profile",
};

function resolveStudentPage(pathname) {
  let decoded = pathname || "/student/dashboard";
  try { decoded = decodeURIComponent(decoded); } catch { /* Keep malformed URL unchanged. */ }
  const normalized = decoded.toLowerCase().replace(/\/+$/, "") || "/student/dashboard";
  const lastSegment = normalized.split("/").filter(Boolean).pop() || "dashboard";
  return studentRouteAliases[lastSegment] || "Dashboard";
}

function DemoNotice() {
  return <span className="ca-demo-notice"><i /> DEMO PREVIEW · SAMPLE METRICS</span>;
}

function WelcomeBanner({ name, reduceMotion }) {
  return (
    <motion.section className="ca-welcome-banner ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, ease: "easeOut" },
    })}>
      <div className="ca-welcome-copy">
        <span className="ca-welcome-hand" aria-hidden="true">👋</span>
        <div>
          <h1>Welcome, {name}!</h1>
          <p>Keep practicing and move up the leaderboard!</p>
          <DemoNotice />
        </div>
      </div>
      <div className="ca-welcome-trophy" aria-hidden="true">
        <span className="ca-welcome-star star-one">✦</span><span className="ca-welcome-star star-two">✧</span><span className="ca-welcome-star star-three">✦</span>
        <div className="ca-welcome-laurel">❧</div>
        <div className="ca-welcome-trophy-icon"><Trophy size={72} strokeWidth={1.55} /></div>
        <div className="ca-welcome-laurel right">❧</div>
      </div>
    </motion.section>
  );
}

function LevelCard({ data, reduceMotion }) {
  const percent = Math.min(100, Math.round((data.earned / data.nextLevel) * 100));
  return (
    <motion.section className="ca-level-card ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.46, delay: 0.04, ease: "easeOut" },
    })}>
      <div className="ca-level-card-top">
        <div className="ca-level-shield"><ShieldCheck size={43} fill="rgba(255,201,36,.16)" /></div>
        <div><h2>{data.tier}</h2><p>Level {data.level}</p></div>
      </div>
      <div className="ca-level-meta"><strong>Level {data.level}</strong></div>
      <div className="ca-xp-track" role="progressbar" aria-label="XP progress" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <motion.span initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.25 }} />
      </div>
      <p className="ca-xp-label">{fmt(data.earned)} / {fmt(data.nextLevel)} XP</p>
    </motion.section>
  );
}

const statIcons = { exams: Target, accuracy: CheckCircle2, score: ChartNoAxesColumnIncreasing, streak: Flame };
function Statistics({ stats, reduceMotion }) {
  return (
    <section className="ca-stats-grid" aria-label="Student statistics">
      {stats.map((item, index) => {
        const Icon = statIcons[item.kind];
        return (
          <motion.article className={`ca-stat-card ca-stat-${item.kind} ca-glow-panel`} key={item.label} {...(reduceMotion ? staticMotion : {
            initial: { opacity: 0, y: 9 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, delay: 0.06 + index * 0.055 },
          })}>
            <div className="ca-stat-icon"><Icon size={31} strokeWidth={2.4} /></div>
            <div className="ca-stat-copy"><strong>{item.value}</strong><span>{item.label}</span></div>
          </motion.article>
        );
      })}
    </section>
  );
}

const progressIcons = { exam: FileText, quiz: CheckCircle2, practice: BookOpen };
function ProgressCard({ data, reduceMotion }) {
  return (
    <motion.section className="ca-panel ca-progress-panel ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.12 },
    })}>
      <div className="ca-panel-heading"><ChartNoAxesColumnIncreasing size={25} /><h2>Your Progress</h2></div>
      <div className="ca-progress-content">
        <div className="ca-accuracy-ring" style={{ "--accuracy": `${data.accuracy}%` }}>
          <div className="ca-accuracy-ring-inner"><strong>{data.accuracy}%</strong><span>Overall</span><span>Accuracy</span></div>
        </div>
        <div className="ca-progress-list">
          {data.rows.map((row) => {
            const Icon = progressIcons[row.kind];
            return (
              <div className="ca-progress-row" key={row.label}>
                <Icon size={23} /><span className="ca-progress-row-label">{row.label}</span>
                <div className="ca-mini-progress-track" role="progressbar" aria-label={`${row.label} progress`} aria-valuenow={row.percent} aria-valuemin={0} aria-valuemax={100}>
                  <motion.span initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${row.percent}%` }} transition={{ duration: reduceMotion ? 0 : 0.85, delay: 0.25 }} />
                </div>
                <strong>{row.value}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

function BadgeArtwork({ kind }) {
  const Icon = kind === "streak" ? Flame : Star;
  return <div className={`ca-badge-art ca-badge-${kind}`}><div className="ca-badge-art-inner"><Icon size={34} fill="rgba(255,255,255,.12)" /></div></div>;
}

function BadgesCard({ badges, onViewAll, reduceMotion }) {
  return (
    <motion.section className="ca-panel ca-badges-panel ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.17 },
    })}>
      <div className="ca-panel-heading"><Award size={24} /><h2>Your Badges</h2><button type="button" className="ca-view-all" onClick={onViewAll}>View All <ChevronRight size={17} /></button></div>
      <div className="ca-badges-row">
        {badges.map((badge) => <div className="ca-earned-badge" key={badge.name}><BadgeArtwork kind={badge.kind} /><strong>{badge.name}</strong><span>{badge.detail}</span></div>)}
      </div>
    </motion.section>
  );
}

function RankMedal({ rank }) {
  if (rank === 1) return <span className="ca-rank-medal ca-rank-gold"><Trophy size={17} fill="currentColor" /></span>;
  if (rank === 2) return <span className="ca-rank-medal ca-rank-silver"><Medal size={17} fill="currentColor" /></span>;
  if (rank === 3) return <span className="ca-rank-medal ca-rank-bronze"><Medal size={17} fill="currentColor" /></span>;
  return <span className="ca-rank-number">{rank}</span>;
}

function LeaderboardCard({ data, studentName, onViewAll, reduceMotion }) {
  return (
    <motion.section className="ca-panel ca-leaderboard-panel ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.22 },
    })}>
      <div className="ca-panel-heading"><Trophy size={25} /><h2>Leaderboard <span>(Top 5)</span></h2><button type="button" className="ca-view-all ca-icon-view-all" onClick={onViewAll} aria-label="View full leaderboard"><ChevronRight size={18} /></button></div>
      <div className="ca-leader-list">
        {data.leaders.map((leader) => <div className="ca-leader-row" key={leader.rank}><RankMedal rank={leader.rank} /><span className={`ca-leader-avatar ca-leader-avatar-${leader.rank}`}>{leader.initials}</span><strong>{leader.name}</strong><b>{fmt(leader.points)}</b></div>)}
      </div>
      <div className="ca-your-rank-divider"><span />Your Rank<span /></div>
      <div className="ca-leader-row ca-current-leader"><span className="ca-rank-number">{data.currentStudent.rank}</span><span className="ca-leader-avatar ca-current-avatar">{initials(studentName)}</span><strong>You ({studentName})</strong><b>{fmt(data.currentStudent.points)}</b></div>
    </motion.section>
  );
}

function UpcomingExamsCard({ exams, onViewAll, reduceMotion }) {
  const [previewExam, setPreviewExam] = useState(null);
  return (
    <motion.section className="ca-panel ca-upcoming-panel ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.2 },
    })}>
      <div className="ca-panel-heading"><CalendarDays size={25} /><h2>Upcoming Exams</h2><button type="button" className="ca-view-all" onClick={onViewAll}>View All <ChevronRight size={17} /></button></div>
      <div className="ca-upcoming-list">
        {exams.map((exam) => (
          <article className="ca-upcoming-row" key={exam.id}>
            <div className="ca-upcoming-icon"><FileText size={24} /></div>
            <div className="ca-upcoming-info"><strong>{exam.name}</strong><span><CalendarDays size={14} /> {exam.date}, {exam.time}</span></div>
            <ChevronRight className="ca-upcoming-chevron" size={20} />
            <button type="button" className="ca-start-button" onClick={() => setPreviewExam(exam)}>Start</button>
          </article>
        ))}
      </div>
      {previewExam && (
        <div className="ca-demo-exam-backdrop" role="presentation" onClick={() => setPreviewExam(null)}>
          <section className="ca-demo-exam-dialog" role="dialog" aria-modal="true" aria-labelledby="ca-demo-exam-title" onClick={(event) => event.stopPropagation()}>
            <div className="ca-demo-exam-icon"><CalendarDays size={26} /></div>
            <span className="ca-demo-dialog-label">SAMPLE SCHEDULE ITEM</span>
            <h3 id="ca-demo-exam-title">{previewExam.name}</h3>
            <p>{previewExam.date} at {previewExam.time}</p>
            <p className="ca-demo-dialog-note">This dashboard card currently uses preview data. Live exam launch will be connected when the exam API is available.</p>
            <div className="ca-demo-dialog-actions">
              <button type="button" className="ca-demo-dialog-secondary" onClick={() => setPreviewExam(null)}>Close</button>
              <button type="button" className="ca-demo-dialog-primary" onClick={() => { setPreviewExam(null); onViewAll(); }}>View Exams</button>
            </div>
          </section>
        </div>
      )}
    </motion.section>
  );
}

function QuickActionsCard({ onAction, reduceMotion }) {
  const actions = [
    { label: "Practice", icon: Target, kind: "practice" },
    { label: "Take Quiz", icon: CirclePlay, kind: "quiz" },
    { label: "Study Resources", icon: BookOpen, kind: "resources" },
    { label: "View Analytics", icon: ChartNoAxesColumnIncreasing, kind: "analytics" },
  ];
  return (
    <motion.section className="ca-panel ca-quick-actions-panel ca-glow-panel" {...(reduceMotion ? staticMotion : {
      initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.25 },
    })}>
      <div className="ca-panel-heading"><Zap size={25} /><h2>Quick Actions</h2></div>
      <div className="ca-quick-actions-grid">
        {actions.map(({ label, icon: Icon, kind }) => <button type="button" className={`ca-quick-action ca-action-${kind}`} key={kind} onClick={() => onAction(kind)}><span className="ca-quick-action-icon"><Icon size={36} strokeWidth={2.25} /></span><span>{label}</span></button>)}
      </div>
    </motion.section>
  );
}

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = resolveStudentPage(location.pathname);
  const [authState, setAuthState] = useState(DEMO_MODE ? "ready" : "loading");
  const [user, setUser] = useState(DEMO_MODE ? { full_name: import.meta.env.VITE_DEMO_STUDENT_NAME || "Student", role: "student" } : null);
  const [authError, setAuthError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const reduceMotion = useReducedMotion();

  const loadSession = useCallback(async () => {
    setAuthState("loading");
    setAuthError("");
    if (DEMO_MODE) {
      setUser({ full_name: import.meta.env.VITE_DEMO_STUDENT_NAME || "Student", role: "student" });
      setAuthState("ready");
      return;
    }
    try {
      const currentUser = await fetchCurrentUser();
      if (!currentUser) {
        setUser(null);
        setAuthState("unauthenticated");
        return;
      }
      if (currentUser.role !== "student") {
        setUser(currentUser);
        setAuthState(currentUser.role === "admin" ? "admin" : "unauthenticated");
        return;
      }
      setUser(currentUser);
      setAuthState("ready");
    } catch (error) {
      setUser(null);
      setAuthError(error.status === 401 ? "Your Student session has expired. Please sign in again." : error.message);
      setAuthState("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (DEMO_MODE) return undefined;
    let mounted = true;
    fetchCurrentUser()
      .then((currentUser) => {
        if (!mounted) return;
        if (!currentUser) {
          setUser(null);
          setAuthState("unauthenticated");
        } else if (currentUser.role !== "student") {
          setUser(currentUser);
          setAuthState(currentUser.role === "admin" ? "admin" : "unauthenticated");
        } else {
          setUser(currentUser);
          setAuthState("ready");
        }
      })
      .catch((error) => {
        if (!mounted) return;
        setUser(null);
        setAuthError(error.status === 401 ? "Your Student session has expired. Please sign in again." : error.message);
        setAuthState("unauthenticated");
      });
    return () => { mounted = false; };
  }, []);

  const studentName = user?.full_name || user?.fullName || "Student";
  const dashboardData = studentDashboardDemo;

  const handleNavigate = useCallback((name) => {
    const route = studentRoutes[name] || studentRoutes.Dashboard;
    navigate(route);
    setMenuOpen(false);
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    setLogoutError("");
    if (!DEMO_MODE) {
      try {
        await logoutSession();
      } catch (error) {
        setLogoutError(error.message || "Could not end the session. Please try again.");
        return false;
      }
    }
    setLogoutOpen(false);
    setUser(null);
    setAuthState("unauthenticated");
    navigate("/login", { replace: true });
    return true;
  }, [navigate]);

  const handleQuickAction = (kind) => {
    if (kind === "practice" || kind === "quiz") handleNavigate("Quizzes");
    else if (kind === "resources") handleNavigate("Resources");
    else if (kind === "analytics") handleNavigate("My Performance");
  };

  if (authState === "loading") {
    return <main className="ca-auth-state"><div className="ca-auth-state-card"><div className="ca-auth-state-spinner" /><h1>Preparing your arena</h1><p>Checking your student session…</p></div></main>;
  }
  if (authState === "admin") return <Navigate to="/admin" replace />;
  if (authState !== "ready" || !user) {
    return (
      <main className="ca-auth-state">
        <div className="ca-auth-state-card">
          <div className="ca-auth-state-icon"><ShieldCheck size={34} /></div>
          <h1>Student sign-in required</h1>
          <p>{authError || "Sign in with a Student account to open your Champion Arena portal."}</p>
          <button type="button" className="ca-primary-button" onClick={() => navigate("/login")}>Go to Login</button>
          <button type="button" className="ca-simple-back" onClick={loadSession}>Check session again</button>
        </div>
      </main>
    );
  }

  const renderContent = () => {
    if (active === "Dashboard") {
      return (
        <div className="ca-dashboard-content">
          <div className="ca-top-grid">
            <div className="ca-top-left-column"><WelcomeBanner name={studentName} reduceMotion={reduceMotion} /><Statistics stats={dashboardData.stats} reduceMotion={reduceMotion} /></div>
            <LevelCard data={dashboardData.xp} reduceMotion={reduceMotion} />
          </div>
          <div className="ca-middle-grid">
            <ProgressCard data={dashboardData.progress} reduceMotion={reduceMotion} />
            <BadgesCard badges={dashboardData.badges} onViewAll={() => handleNavigate("Achievements")} reduceMotion={reduceMotion} />
            <LeaderboardCard data={dashboardData} studentName={studentName} onViewAll={() => handleNavigate("Leaderboard")} reduceMotion={reduceMotion} />
          </div>
          <div className="ca-bottom-grid">
            <UpcomingExamsCard exams={dashboardData.upcomingExams} onViewAll={() => handleNavigate("Exams")} reduceMotion={reduceMotion} />
            <QuickActionsCard onAction={handleQuickAction} reduceMotion={reduceMotion} />
          </div>
        </div>
      );
    }
    if (active === "Exams") return <ExamsPage />;
    if (active === "Quizzes") return <QuizzesPage />;
    if (active === "Leaderboard") return <LeaderboardPage />;
    if (active === "Achievements") return <AchievementsPage />;
    if (active === "My Performance") return <ReportsPage onNavigate={handleNavigate} />;
    if (active === "Resources") return <ResourcesPage />;
    if (active === "Profile") return <ProfilePage user={user} onLogout={() => setLogoutOpen(true)} onNavigate={handleNavigate} />;
    return null;
  };

  return (
    <div className="ca-student-app">
      <Header user={user} onMenuClick={() => setMenuOpen((value) => !value)} onLogout={() => setLogoutOpen(true)} onNavigate={handleNavigate} />
      <div className="ca-dashboard-body">
        <Sidebar active={active} onNavigate={handleNavigate} onLogout={() => setLogoutOpen(true)} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className={`ca-dashboard-main ${active === "Dashboard" ? "" : "ca-dashboard-main-scroll"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="ca-dashboard-page"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          {active === "Dashboard" && <div className="ca-data-source-note"><Sparkles size={12} /> Metrics, leaderboard and exam entries are sample preview data until dashboard APIs are connected.</div>}
        </main>
      </div>
      <LogoutConfirmation open={logoutOpen} onCancel={() => { setLogoutOpen(false); setLogoutError(""); }} onConfirm={handleLogout} error={logoutError} />
    </div>
  );
}

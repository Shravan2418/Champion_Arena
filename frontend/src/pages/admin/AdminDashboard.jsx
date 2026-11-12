import { useState } from "react";

import {
  Menu, Bell, ChevronDown, Trophy, GraduationCap, BookOpen,
  ClipboardList, Users, ClipboardCheck, CalendarDays,
  ChartNoAxesColumnIncreasing, TrendingUp, Target,
  UserRoundPlus, FileText, Zap, Award, ArrowRight,
  BookPlus, CalendarPlus, Sparkles, CircleHelp
} from "lucide-react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import "../../styles/admin.css";

const statistics = [
  { title: "Total Students", value: "247", change: "+12%", icon: Users, tone: "blue" },
  { title: "Total Questions", value: "120", change: "+0%", icon: ClipboardCheck, tone: "purple" },
  { title: "Ongoing Exams", value: "1", change: "+0%", icon: CalendarDays, tone: "green" },
  { title: "Total Results", value: "186", change: "+18%", icon: Trophy, tone: "gold" },
];

const weekly = [
  { day: "Mon", exams: 120, quiz: 340, users: 620 },
  { day: "Tue", exams: 145, quiz: 390, users: 640 },
  { day: "Wed", exams: 160, quiz: 380, users: 650 },
  { day: "Thu", exams: 200, quiz: 420, users: 710 },
  { day: "Fri", exams: 210, quiz: 450, users: 735 },
  { day: "Sat", exams: 245, quiz: 470, users: 780 },
  { day: "Sun", exams: 270, quiz: 520, users: 880 },
];

const leaderboard = [
  { rank: 1, name: "Rahul Sharma", score: "9/10", avatar: "R", tone: "first" },
  { rank: 2, name: "Ananya Reddy", score: "8/10", avatar: "A", tone: "second" },
  { rank: 3, name: "Shravan Kumar", score: "7/10", avatar: "S", tone: "third" },
  { rank: 4, name: "Priya Singh", score: "5/10", avatar: "P", tone: "fourth" },
  { rank: 5, name: "Karthik M.", score: "3/10", avatar: "K", tone: "fifth" },
];

const subjectData = [
  { name: "Maths", value: 95, color: "#1488ec" },
  { name: "Physics", value: 88, color: "#16b94d" },
  { name: "Chemistry", value: 82, color: "#9954e8" },
  { name: "Programming", value: 90, color: "#f49a24" },
];

const recentActivity = [
  { title: "Rahul Sharma answered correctly", time: "5 sec ago", tone: "green" },
  { title: "Ananya Reddy joined the exam", time: "12 sec ago", tone: "blue" },
  { title: "Shravan Kumar answered correctly", time: "18 sec ago", tone: "purple" },
  { title: "Priya Singh started the exam", time: "22 sec ago", tone: "orange" },
];

const actions = [
  { name: "Add Questions", icon: BookPlus, tone: "green", target: "Questions" },
  { name: "Add Subjects", icon: BookOpen, tone: "purple", target: "Subjects" },
  { name: "Create Exam", icon: CalendarPlus, tone: "orange", target: "Exams" },
  { name: "Manage Students", icon: Users, tone: "blue", target: "Students" },
];

function AdminHeader({ onMenuClick }) {
  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-menu-toggle"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
      >
        <Menu size={27} />
      </button>

      <div className="admin-topbar-spacer" />

      <button className="admin-notification" type="button" aria-label="Notifications">
        <Bell size={24} />
        <span />
      </button>

      <div className="admin-profile-divider" />

      <button className="admin-profile" type="button">
        <div className="admin-avatar">A</div>
        <strong>Admin</strong>
        <ChevronDown size={17} />
      </button>
    </header>
  );
}

function WelcomeBanner() {
  return (
    <section className="admin-welcome-banner">
      <div className="admin-banner-light" />
      <div className="admin-banner-trophy">
        
        <Trophy size={76} />
      </div>

      <div className="admin-banner-copy">
        <h2>Welcome, <strong>Admin!</strong></h2>
        <p>Manage Exams, Monitor Performance &amp; Inspire Students</p>
      </div>

      <div className="admin-banner-art">
        <Sparkles className="admin-banner-stars" size={25} />
        <GraduationCap className="admin-cap" size={92} />
        <BookOpen className="admin-banner-book" size={49} />
      </div>

      <div className="admin-banner-wave" />
    </section>
  );
}

function Statistics() {
  return (
    <section className="admin-stat-grid">
      {statistics.map((item) => {
        const Icon = item.icon;

        return (
          <article className="admin-stat-card" key={item.title}>
            <div className={`admin-stat-icon ${item.tone}`}>
              <Icon size={34} strokeWidth={2.2} />
            </div>

            <div className="admin-stat-info">
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <small>
                <TrendingUp size={13} />
                {item.change}
              </small>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ExamOverview() {
  const x = (index) => 55 + index * 100;
  const y = (value) => 185 - value * 0.15;

  const points = (field) =>
    weekly.map((item, index) => `${x(index)},${y(item[field])}`).join(" ");

  return (
    <section className="admin-card admin-overview-card">
      <div className="admin-card-heading">
        <div>
          <h3><ChartNoAxesColumnIncreasing /> Exam Overview</h3>
          <p>Overall exam performance and weekly activity.</p>
        </div>

        <select defaultValue="Today" aria-label="Overview period">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="admin-overview-content">
        <div className="admin-donut-wrap">
          <div className="admin-performance-donut">
            <div className="admin-donut-center">
              <strong>75%</strong>
              <span>Avg. Accuracy</span>
            </div>
          </div>
        </div>

        <div className="admin-weekly-chart">
          <div className="admin-chart-labels">
            <span><i className="chart-blue" /> Exams</span>
            <span><i className="chart-green" /> Quizzes</span>
            <span><i className="chart-purple" /> Activity</span>
          </div>

          <div className="admin-svg-wrap">
            <svg viewBox="0 0 720 220" preserveAspectRatio="none" className="admin-chart-svg">
              {[25, 65, 105, 145, 185].map((line, index) => (
                <g key={line}>
                  <line x1="38" y1={line} x2="710" y2={line} className="admin-chart-gridline" />
                  <text x="1" y={line + 4} className="admin-chart-axis">{1000 - index * 200}</text>
                </g>
              ))}

              {weekly.map((item, index) => (
                <rect
                  key={item.day}
                  x={x(index) - 16}
                  y={185 - item.exams * .43}
                  width="31"
                  height={item.exams * .43}
                  rx="5"
                  className="admin-exam-bar"
                />
              ))}

              <polyline points={points("quiz")} className="admin-quiz-line" />
              <polyline points={points("users")} className="admin-user-line" />

              {weekly.map((item, index) => (
                <g key={`${item.day}-points`}>
                  <circle cx={x(index)} cy={y(item.quiz)} r="4.5" className="admin-quiz-point" />
                  <circle cx={x(index)} cy={y(item.users)} r="4.5" className="admin-user-point" />
                </g>
              ))}

              <rect x="652" y="2" width="53" height="26" rx="9" className="admin-chart-badge" />
              <text x="678" y="20" textAnchor="middle" className="admin-chart-badge-text">92%</text>
            </svg>
          </div>

          <div className="admin-chart-days">
            {weekly.map((item) => <span key={item.day}>{item.day}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveLeaderboard() {
  return (
    <section className="admin-live-leaderboard">
      <div className="admin-live-heading">
        <Trophy size={38} />
        <div>
          <h3><span>Live Exam</span> Leaderboard</h3>
          <p>Real-time ranking during examination</p>
        </div>
      </div>

      <div className="admin-live-list">
        {leaderboard.map((student) => (
          <div className={`admin-live-row ${student.tone}`} key={student.rank}>
            <div className="admin-live-rank">
              {student.rank <= 3 ? <MedalIcon rank={student.rank} /> : student.rank}
            </div>

            <div className="admin-live-avatar">{student.avatar}</div>

            <div className="admin-live-student">
              <strong>{student.name}</strong>
              <div className="admin-live-track">
                <span style={{ width: `${Number(student.score.split("/")[0]) * 10}%` }} />
              </div>
            </div>

            <b>{student.score}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function MedalIcon({ rank }) {
  return (
    <span className={`admin-medal-rank rank-${rank}`}>
      {rank}
    </span>
  );
}

function SubjectPerformance() {
  return (
    <section className="admin-card admin-subject-card">
      <div className="admin-card-heading">
        <h3><Target /> Subject Performance</h3>
        <button type="button" className="admin-text-link" onClick={() => alert("Subject details will be connected next.")}>
          View Details <ArrowRight size={14} />
        </button>
      </div>

      <div className="admin-subject-grid">
        {subjectData.map((subject) => (
          <div className="admin-subject-item" key={subject.name}>
            <div
              className="admin-subject-ring"
              style={{
                "--subject-value": `${subject.value}%`,
                "--subject-color": subject.color
              }}
            >
              <div>{subject.value}%</div>
            </div>
            <strong>{subject.name}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentActivities() {
  const icons = [UserRoundPlus, Users, CircleHelp, CalendarDays];

  return (
    <section className="admin-card admin-recent-card">
      <div className="admin-card-heading">
        <h3><Zap /> Recent Activities</h3>
        <button type="button" className="admin-text-link" onClick={() => alert("Full activity history will be added next.")}>
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="admin-recent-list">
        {recentActivity.map((activity, index) => {
          const Icon = icons[index];

          return (
            <div className="admin-recent-item" key={activity.title}>
              <div className={`admin-activity-dot ${activity.tone}`}>
                <Icon size={19} />
              </div>
              <div className="admin-recent-copy">
                <strong>{activity.title}</strong>
              </div>
              <small>{activity.time}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuickActions({ onSelect }) {
  return (
    <section className="admin-quick-card">
      <div className="admin-quick-heading">
        <Zap size={25} />
        <h3>Quick Actions</h3>
      </div>

      <div className="admin-quick-grid">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.name}
              type="button"
              className={`admin-quick-action ${action.tone}`}
              onClick={() => onSelect(action.target)}
            >
              <Icon size={31} />
              <span>{action.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AdminModulePreview({ name, onBack }) {
  const moduleIcons = {
    Students: Users,
    Questions: CircleHelp,
    Subjects: BookOpen,
    Exams: CalendarDays,
    Results: ClipboardCheck,
    Leaderboard: Trophy,
    Achievements: Award,
    Reports: ChartNoAxesColumnIncreasing,
    Settings: ClipboardList,
  };

  const Icon = moduleIcons[name] || ClipboardList;

  return (
    <div className="admin-module-preview">
      <Icon size={48} />
      <h2>{name}</h2>
      <p>This management section will be implemented as the next Admin module.</p>
      <button onClick={onBack}>Back to Dashboard</button>
    </div>
  );
}

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  const selectPage = (name) => {
    setActive(name);
    setMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar-wrap ${menuOpen ? "open" : ""}`}>
        <AdminSidebar active={active} onSelect={selectPage} />
      </div>

      <main className="admin-main">
        <AdminHeader onMenuClick={() => setMenuOpen((value) => !value)} />

        {active === "Dashboard" ? (
          <div className="admin-content">
            <WelcomeBanner />
            <Statistics />

            <div className="admin-main-grid">
              <ExamOverview />
              <LiveLeaderboard />
            </div>

            <div className="admin-bottom-grid">
              <SubjectPerformance />
              <RecentActivities />
              <QuickActions onSelect={selectPage} />
            </div>
          </div>
        ) : (
          <div className="admin-content">
            <AdminModulePreview name={active} onBack={() => setActive("Dashboard")} />
          </div>
        )}
      </main>
    </div>
  );
}


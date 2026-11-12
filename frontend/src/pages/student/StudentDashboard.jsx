
import MyExams from "./MyExams";
import ExaminationPage from "./ExaminationPage";
import {
  Trophy, ClipboardList, CheckCircle2, ChartNoAxesColumnIncreasing,
  Flame, Target, Brain, BookOpen, Monitor, CalendarDays,
  Crown, FileText, Play, ArrowRight, Clock,
  Shield, Star, Sparkles, Award
} from "lucide-react";

import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import "../../styles/dashboard.css";
import LeaderboardPage from "./LeaderboardPage";
import AchievementsPage from "./AchievementsPage";
import ReportsPage from "./ReportsPage";

const stats = [
  { icon: ClipboardList, value: "12", label: "Exams Taken", color: "purple" },
  { icon: CheckCircle2, value: "86%", label: "Avg. Accuracy", color: "green" },
  { icon: ChartNoAxesColumnIncreasing, value: "1,250", label: "Total Score", color: "blue" },
  { icon: Flame, value: "7", label: "Day Streak", color: "orange" },
];

const subjects = [
  { name: "Aptitude", value: 80, icon: Target, color: "green" },
  { name: "Logical Reasoning", value: 70, icon: Brain, color: "yellow" },
  { name: "General Knowledge", value: 75, icon: BookOpen, color: "green" },
  { name: "Computer Basics", value: 60, icon: Monitor, color: "yellow" },
];

const leaders = [
  { rank: 1, name: "Ananya R.", score: "3,820", avatar: "A" },
  { rank: 2, name: "Karthik M.", score: "3,650", avatar: "K" },
  { rank: 3, name: "Vishnu S.", score: "3,510", avatar: "V" },
  { rank: 4, name: "You (Shravan)", score: "3,300", avatar: "S", you: true },
  { rank: 5, name: "Priya D.", score: "3,280", avatar: "P" },
];

const exams = [
  { name: "DBMS Internal Test", date: "Nov 15, 10:00 AM" },
  { name: "Aptitude Test", date: "Nov 20, 11:00 AM" },
];

const achievements = [
  { name: "Bronze", detail: "5+ Correct", icon: Shield, color: "bronze" },
  { name: "Silver", detail: "10+ Correct", icon: Shield, color: "silver" },
  { name: "Gold", detail: "20+ Correct", icon: Shield, color: "gold" },
];

function Hero() {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-eyebrow">
          <Sparkles size={17} /> YOUR LEARNING JOURNEY
        </div>
        <h1>Hello, <span>Shravan!</span></h1>
        <p>Ready for your next challenge?</p>
        <div className="hero-subtitle">
          Keep learning. Keep growing. Reach the top.
        </div>
      </div>

      <div className="levelup-art">
        <div className="levelup-glow" />
        <div className="levelup-shield">
          <Trophy size={49} />
          <div className="levelup-arrow">↑</div>
        </div>
        <div className="levelup-text">LEVEL <span>UP</span></div>
        <div className="levelup-laurel">✦</div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats-grid">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div className="stat-card" key={item.label}>
            <div className={`stat-icon ${item.color}`}>
              <Icon size={27} />
            </div>
            <div>
              <h2>{item.value}</h2>
              <p>{item.label}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ProgressCard() {
  return (
    <section className="panel progress-panel">
      <div className="panel-heading">
        <ChartNoAxesColumnIncreasing className="heading-icon blue-text" />
        <h3>Your Progress</h3>
      </div>

      <div className="progress-content">
        <div className="progress-circle">
          <div className="progress-circle-inner">
            <strong>72%</strong>
            <span>Overall Progress</span>
          </div>
        </div>

        <div className="subject-list">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <div className="subject-item" key={subject.name}>
                <div className={`subject-icon ${subject.color}`}>
                  <Icon size={23} />
                </div>
                <div className="subject-info">
                  <div className="subject-label">
                    <strong>{subject.name}</strong>
                    <b>{subject.value}%</b>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${subject.color}`}
                      style={{ width: `${subject.value}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Leaderboard() {
  return (
    <section className="panel leaderboard-panel">
      <div className="panel-heading">
        <Trophy className="heading-icon gold-text" />
        <h3>Leaderboard (Top 5)</h3>
        <button
          className="view-all"
          onClick={() => alert("Leaderboard details coming soon.")}
        >
          View All <ArrowRight size={17} />
        </button>
      </div>

      <div className="leader-list">
        {leaders.map((leader) => (
          <div
            className={`leader-row ${leader.you ? "current-user" : ""}`}
            key={leader.rank}
          >
            <div className="leader-rank">
              {leader.rank <= 3 ? (
                <Crown size={20} className={`rank-${leader.rank}`} />
              ) : leader.rank}
            </div>
            <div className={`leader-avatar avatar-${leader.rank}`}>
              {leader.avatar}
            </div>
            <strong>{leader.name}</strong>
            <b>{leader.score}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function UpcomingExams() {
  const [startedExam, setStartedExam] = useState(null);

  return (
    <section className="panel exams-panel">
      <div className="panel-heading">
        <CalendarDays className="heading-icon blue-text" />
        <h3>Upcoming Exams</h3>
        <button
          className="view-all"
          onClick={() => alert("All exams will be available here.")}
        >
          View All <ArrowRight size={17} />
        </button>
      </div>

      <div className="exam-list">
        {exams.map((exam) => (
          <div className="exam-row" key={exam.name}>
            <div className="exam-icon">
              <FileText size={24} />
            </div>
            <div className="exam-info">
              <strong>{exam.name}</strong>
              <span>
                <CalendarDays size={15} /> {exam.date}
              </span>
            </div>
            <button
              className="start-button"
              onClick={() => setStartedExam(exam.name)}
            >
              <Play size={15} fill="currentColor" />
              Start
            </button>
          </div>
        ))}
      </div>

      {startedExam && (
        <div
          className="modal-backdrop"
          onClick={() => setStartedExam(null)}
        >
          <div
            className="exam-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{startedExam}</h3>
            <p>
              Exam interface will be connected in the next development phase.
            </p>
            <button onClick={() => setStartedExam(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}

function Achievements() {
  return (
    <section className="panel achievements-panel">
      <div className="panel-heading">
        <Award className="heading-icon purple-text" />
        <h3>My Achievements</h3>
        <button
          className="view-all"
          onClick={() => alert("All achievements will be available here.")}
        >
          View All <ArrowRight size={17} />
        </button>
      </div>

      <div className="achievement-list">
        {achievements.map((item) => {
          const Icon = item.icon;
          return (
            <div className="achievement-item" key={item.name}>
              <div className={`achievement-medal ${item.color}`}>
                <Icon size={37} />
                <Star
                  size={17}
                  className="medal-star"
                  fill="currentColor"
                />
              </div>
              <strong>{item.name}</strong>
              <span>{item.detail}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DailyGoal() {
  const [completed, setCompleted] = useState(1);

  return (
    <section className="panel daily-panel">
      <div className="panel-heading">
        <Target className="heading-icon purple-text" />
        <h3>Daily Goal</h3>
        <span className="time-left">
          <Clock size={14} /> 12h 34m Left
        </span>
      </div>

      <p className="goal-title">Complete 2 Practice Quizzes</p>

      <div className="goal-progress-row">
        <div className="progress-track goal-track">
          <div
            className="progress-fill green"
            style={{ width: `${completed * 50}%` }}
          />
        </div>
        <strong>{completed}/2</strong>
      </div>

      <button
        className="goal-action"
        onClick={() =>
          setCompleted((previous) => previous >= 2 ? 0 : previous + 1)
        }
      >
        {completed === 2 ? "Reset Demo Goal" : "Complete Demo Goal"}
      </button>
    </section>
  );
}

function LevelCard() {
  return (
    <section className="level-card">
      <div className="level-card-top">
        <div className="level-trophy">
          <Trophy size={39} />
        </div>
        <div>
          <h2>Gold</h2>
          <p>Level 4</p>
        </div>
      </div>

      <div className="xp-track">
        <div className="xp-fill" />
      </div>

      <p className="xp-label">2,350 / 3,000 XP</p>
    </section>
  );
}

export default function StudentDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [examMode, setExamMode] = useState(false);

  if (examMode) {
    return (
      <ExaminationPage
        onExit={() => setExamMode(false)}
      />
    );
  }

  return (
    <div className="dashboard-layout">
      <div className={menuOpen ? "sidebar-wrapper open" : "sidebar-wrapper"}>
        <Sidebar
          active={active}
          setActive={(name) => {
            setActive(name);
            setMenuOpen(false);
          }}
        />
      </div>

      <main className="dashboard-main">
        <Header onMenuClick={() => setMenuOpen(!menuOpen)} />

        {active === "Dashboard" ? (
          <div className="dashboard-content">
            <div className="top-section">
              <Hero />
              <LevelCard />
            </div>

            <Stats />

            <div className="middle-section">
              <ProgressCard />
              <Leaderboard />
            </div>

            <div className="bottom-section">
              <UpcomingExams />
              <Achievements />
              <DailyGoal />
            </div>

            <footer className="dashboard-footer">
              Learn <span>•</span> Practice <span>•</span> Compete <span>•</span> Excel
            </footer>
          </div>
        ) : active === "My Exams" ? (
          <MyExams
            onStartExam={() => setExamMode(true)}
          />
        ) : active === "Leaderboard" ? (
          <LeaderboardPage />
        ) : active === "Achievements" ? (
          <AchievementsPage />
        ) : active === "Reports" ? (
          <ReportsPage />
        ) : (
          <div className="section-placeholder">
            <Trophy size={42} />
            <h2>{active}</h2>
            <p>
              This section is part of the Student Dashboard navigation.
              Its functionality can be added next.
            </p>
            <button onClick={() => setActive("Dashboard")}>
              Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

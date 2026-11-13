import { useMemo, useState } from "react";
import {
  Target,
  CheckCircle2,
  Trophy,
  ChartNoAxesColumnIncreasing,
  Search,
  Database,
  Monitor,
  Network,
  Code2,
  Calculator,
  Brain,
  Clock3,
  CircleHelp,
  X,
  Layers,
  ClipboardCheck,
  Play,
  Info,
} from "lucide-react";
import { PageBanner, StatCard, PortalTabs, EmptyState } from "../../components/student/PortalUI";

const quizzes = [
  { id: "QZ-DBMS-01", title: "DBMS Practice Quiz", subject: "DBMS", questions: 25, duration: 30, difficulty: "Medium", icon: Database, tone: "violet" },
  { id: "QZ-OS-01", title: "Operating Systems Quiz", subject: "Operating Systems", questions: 20, duration: 25, difficulty: "Easy", icon: Monitor, tone: "cyan" },
  { id: "QZ-CN-01", title: "Computer Networks Quiz", subject: "Computer Networks", questions: 30, duration: 40, difficulty: "Hard", icon: Network, tone: "blue" },
  { id: "QZ-DS-01", title: "Data Structures Quiz", subject: "Data Structures", questions: 25, duration: 30, difficulty: "Medium", icon: Code2, tone: "pink" },
  { id: "QZ-APT-01", title: "Aptitude Practice Quiz", subject: "Aptitude", questions: 15, duration: 20, difficulty: "Easy", icon: Calculator, tone: "gold" },
  { id: "QZ-LOG-01", title: "Logical Reasoning Quiz", subject: "Reasoning", questions: 20, duration: 25, difficulty: "Medium", icon: Brain, tone: "purple" },
];

function QuizDetailsModal({ quiz, onClose }) {
  if (!quiz) return null;
  const Icon = quiz.icon;
  return (
    <div className="portal-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="portal-modal quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="portal-modal-close" type="button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        <div className={`quiz-card-icon ${quiz.tone}`}><Icon size={34} /></div>
        <span className="portal-eyebrow">PRACTICE QUIZ · SAMPLE CATALOGUE</span>
        <h2 id="quiz-modal-title">{quiz.title}</h2>
        <p>{quiz.subject} · {quiz.id}</p>
        <div className="quiz-modal-metrics"><span><CircleHelp size={17} /> {quiz.questions} questions</span><span><Clock3 size={17} /> {quiz.duration} minutes</span><span className={`difficulty-pill ${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span></div>
        <div className="portal-info-callout"><Info size={17} /> The uploaded frontend does not include a published question-set API or quiz data. This card is demo catalogue content; an attempt cannot be started or saved yet.</div>
        <div className="portal-modal-actions"><button className="portal-button secondary" type="button" onClick={onClose}>Close</button><button className="portal-button disabled" type="button" disabled>Question set unavailable</button></div>
      </section>
    </div>
  );
}

export default function QuizzesPage() {
  const [view, setView] = useState("All Quizzes");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [difficulty, setDifficulty] = useState("All Difficulties");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const matchesSearch = `${quiz.title} ${quiz.subject}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesSubject = view !== "By Subject" || subject === "All Subjects" || quiz.subject === subject;
    const matchesDifficulty = view !== "By Difficulty" || difficulty === "All Difficulties" || quiz.difficulty === difficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  }), [search, subject, difficulty, view]);

  return (
    <div className="portal-page quizzes-page">
      <PageBanner
        icon={ClipboardCheck}
        eyebrow="PRACTICE • LEARN • LEVEL UP"
        title="Practice"
        accent="Quizzes"
        description="Sharpen your concepts, test your knowledge, and boost your exam performance!"
        art={() => <div className="banner-quiz-art"><div className="banner-clipboard"><ClipboardCheck size={74} /><i /><i /><i /></div><div className="banner-pencil" /><Trophy className="banner-quiz-trophy" size={76} /></div>}
      />

      <div className="portal-stat-grid four-columns">
        <StatCard icon={Target} value="24" label="Quizzes Attempted" tone="purple" />
        <StatCard icon={CheckCircle2} value="20" label="Quizzes Completed" tone="green" />
        <StatCard icon={Trophy} value="4" label="Best Streak" tone="gold" />
        <StatCard icon={ChartNoAxesColumnIncreasing} value="92%" label="Avg. Accuracy" tone="cyan" />
      </div>

      <div className="portal-toolbar quiz-toolbar">
        <PortalTabs items={["All Quizzes", "By Subject", "By Difficulty"]} value={view} onChange={setView} />
        <label className="portal-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search quizzes..." aria-label="Search quizzes" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}</label>
        {view === "By Subject" && <select className="portal-select" value={subject} onChange={(event) => setSubject(event.target.value)} aria-label="Filter by subject"><option>All Subjects</option>{[...new Set(quizzes.map((quiz) => quiz.subject))].map((item) => <option key={item}>{item}</option>)}</select>}
        {view === "By Difficulty" && <select className="portal-select" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Filter by difficulty"><option>All Difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option></select>}
      </div>

      <div className="quiz-card-grid">
        {filtered.map((quiz) => {
          const Icon = quiz.icon;
          return (
            <article className="portal-quiz-card" key={quiz.id}>
              <div className={`quiz-card-icon ${quiz.tone}`}><Icon size={35} /></div>
              <span className={`difficulty-pill ${quiz.difficulty.toLowerCase()}`}>{quiz.difficulty}</span>
              <div className="quiz-card-copy"><h2>{quiz.title}</h2><p><Layers size={15} /> {quiz.subject}</p></div>
              <div className="quiz-card-meta"><span><CircleHelp size={16} /> {quiz.questions} Questions</span><span><Clock3 size={16} /> {quiz.duration} min</span></div>
              <button type="button" className="quiz-start-button" onClick={() => setSelectedQuiz(quiz)}><Play size={16} fill="currentColor" /> Start Quiz</button>
            </article>
          );
        })}
        {filtered.length === 0 && <EmptyState title="No quizzes found" description="Try a different keyword or remove the selected filter." />}
      </div>
      <div className="portal-page-note"><span className="demo-data-tag">Demo catalogue</span><span>Only single-correct MCQ quiz formats are represented in this portal design.</span></div>
      <QuizDetailsModal quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
    </div>
  );
}

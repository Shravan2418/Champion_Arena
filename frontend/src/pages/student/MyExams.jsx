
import { useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ClipboardList,
  CalendarDays,
  CirclePlay,
  CircleCheck,
  CircleX,
  Clock3,
  ArrowRight,
  Code2,
  Database,
  Network,
  BookOpen,
  X,
  Info,
  CheckCircle2,
  Timer,
  FileQuestion,
  Trophy,
  ChevronDown,
  GraduationCap,
} from "lucide-react";

import "../../styles/my-exams.css";

// Demo exam data. Replace with API data when backend integration is ready.
const examData = [
  {
    id: "JAVA-2026-014",
    name: "Java Programming Assessment",
    subject: "Programming",
    category: "In Progress",
    date: "Nov 12, 2026",
    time: "03:00 PM",
    duration: 60,
    questions: 60,
    marks: 100,
    difficulty: "Medium",
    answered: 32,
    progress: 53,
    icon: Code2,
    description: "Test your understanding of Java programming concepts.",
  },
  {
    id: "DSA-2026-021",
    name: "Data Structures & Algorithms",
    subject: "Computer Science",
    category: "Upcoming",
    date: "Nov 18, 2026",
    time: "10:00 AM – 11:30 AM",
    duration: 90,
    questions: 60,
    marks: 100,
    difficulty: "Easy",
    icon: Code2,
    description: "Assess your knowledge of data structures and algorithms.",
  },
  {
    id: "PY-2026-008",
    name: "Python Fundamentals",
    subject: "Programming",
    category: "Available",
    date: "Nov 12, 2026",
    time: "Available Now",
    duration: 45,
    questions: 30,
    marks: 50,
    difficulty: "Medium",
    icon: BookOpen,
    description: "Evaluate your Python fundamentals and problem-solving skills.",
    closingDate: "Nov 15, 2026",
  },
  {
    id: "DBMS-2026-003",
    name: "Database Management Systems",
    subject: "Computer Science",
    category: "Completed",
    date: "Nov 10, 2026",
    time: "Submitted",
    duration: 60,
    questions: 50,
    marks: 100,
    difficulty: "Medium",
    score: 86,
    percentage: 86,
    resultPublished: true,
    icon: Database,
    description: "Database concepts, SQL queries and normalization.",
  },
  {
    id: "CN-2026-005",
    name: "Computer Networks",
    subject: "Computer Science",
    category: "Missed",
    date: "Nov 05, 2026",
    time: "10:00 AM – 11:00 AM",
    duration: 60,
    questions: 40,
    marks: 100,
    difficulty: "Hard",
    retakeAllowed: false,
    icon: Network,
    description: "Computer networking fundamentals and protocols.",
  },
  {
    id: "APT-2026-010",
    name: "Quantitative Aptitude",
    subject: "Aptitude",
    category: "Upcoming",
    date: "Nov 20, 2026",
    time: "11:00 AM – 12:00 PM",
    duration: 60,
    questions: 40,
    marks: 80,
    difficulty: "Easy",
    icon: BookOpen,
    description: "Practice mathematical aptitude and reasoning.",
  },
  {
    id: "GK-2026-011",
    name: "General Knowledge Test",
    subject: "General Knowledge",
    category: "Completed",
    date: "Nov 08, 2026",
    time: "Submitted",
    duration: 30,
    questions: 25,
    marks: 50,
    difficulty: "Easy",
    score: 42,
    percentage: 84,
    resultPublished: true,
    icon: BookOpen,
    description: "Test your general awareness and knowledge.",
  },
];

const tabs = [
  { name: "All Exams", icon: ClipboardList },
  { name: "Upcoming", icon: CalendarDays },
  { name: "Available", icon: CirclePlay },
  { name: "In Progress", icon: Timer },
  { name: "Completed", icon: CircleCheck },
  { name: "Missed", icon: CircleX },
];

const statusStyles = {
  Upcoming: "upcoming",
  Available: "available",
  "In Progress": "ongoing",
  Completed: "completed",
  Missed: "missed",
};

function StatusBadge({ status }) {
  return (
    <span className={`ca-status ${statusStyles[status]}`}>
      <span className="ca-status-dot" />
      {status}
    </span>
  );
}

function DifficultyBadge({ difficulty }) {
  return (
    <span className={`ca-difficulty ${difficulty.toLowerCase()}`}>
      {difficulty}
    </span>
  );
}

function ExamModal({ exam, onClose, onStartExam }) {
  if (!exam) return null;

  const isCompleted = exam.category === "Completed";
  const isOngoing = exam.category === "In Progress";
  const isMissed = exam.category === "Missed";
  const isUpcoming = exam.category === "Upcoming";

  return (
    <div className="ca-modal-overlay" onClick={onClose}>
      <div
        className="ca-exam-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="ca-modal-close" onClick={onClose}>
          <X size={21} />
        </button>

        <div className="ca-modal-icon">
          <GraduationCap size={32} />
        </div>

        <h2>{exam.name}</h2>
        <p className="ca-modal-subtitle">{exam.description}</p>

        <StatusBadge status={exam.category} />

        <div className="ca-modal-details">
          <div>
            <CalendarDays />
            <span>
              <small>Exam Date</small>
              <strong>{exam.date}</strong>
            </span>
          </div>

          <div>
            <Clock3 />
            <span>
              <small>Schedule</small>
              <strong>{exam.time}</strong>
            </span>
          </div>

          <div>
            <Timer />
            <span>
              <small>Duration</small>
              <strong>{exam.duration} minutes</strong>
            </span>
          </div>

          <div>
            <FileQuestion />
            <span>
              <small>Questions</small>
              <strong>{exam.questions}</strong>
            </span>
          </div>

          <div>
            <Trophy />
            <span>
              <small>Maximum Marks</small>
              <strong>{exam.marks}</strong>
            </span>
          </div>

          <div>
            <Info />
            <span>
              <small>Difficulty</small>
              <strong>{exam.difficulty}</strong>
            </span>
          </div>
        </div>

        {isCompleted && exam.resultPublished && (
          <div className="ca-result-box">
            <span>Your Result</span>
            <strong>{exam.score}/{exam.marks}</strong>
            <b>{exam.percentage}%</b>
          </div>
        )}

        {isOngoing && (
          <div className="ca-modal-progress">
            <div>
              <span>Exam Progress</span>
              <strong>{exam.progress}%</strong>
            </div>
            <div className="ca-progress-track">
              <div style={{ width: `${exam.progress}%` }} />
            </div>
            <small>{exam.answered} of {exam.questions} questions answered</small>
          </div>
        )}

        {isUpcoming && (
          <div className="ca-info-note">
            Your exam is scheduled. Check the instructions before the exam
            begins.
          </div>
        )}

        {isMissed && (
          <div className="ca-info-note">
            {exam.retakeAllowed
              ? "A retake may be available. Check the exam instructions."
              : "Retake is not allowed for this examination."}
          </div>
        )}

        <div className="ca-modal-actions">
          <button className="ca-secondary-btn" onClick={onClose}>
            Close
          </button>

          {!isMissed && (
            <button
              className="ca-primary-btn"
             onClick={() => {
  if (
    exam.category === "Available" ||
    exam.category === "In Progress"
  ) {
    onStartExam?.(exam);
  }
}}
            >
              {isCompleted
                ? "View Result"
                : isOngoing
                  ? "Resume Exam"
                  : isUpcoming
                    ? "View Schedule"
                    : "Start Exam"}
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContinueExam({ exam, onView }) {
  return (
    <section className="ca-continue-card">
      <div className="ca-continue-illustration">
        <div className="ca-illustration-glow" />
        <div className="ca-illustration-icon">
          <ClipboardList size={57} />
          <GraduationCap size={37} className="ca-cap-icon" />
        </div>
      </div>

      <div className="ca-continue-description">
        <StatusBadge status="In Progress" />
        <h2>Continue Your Exam</h2>
        <p>
          You have an examination in progress. Resume and complete it
          before your time runs out.
        </p>
      </div>

      <div className="ca-continue-divider" />

      <div className="ca-continue-information">
        <h3>{exam.name}</h3>
        <p>{exam.id} <span>•</span> {exam.subject}</p>

        <div className="ca-continue-meta">
          <span><Clock3 /> {exam.duration} min</span>
          <span><FileQuestion /> {exam.questions} Questions</span>
          <span><CheckCircle2 /> {exam.answered}/{exam.questions} Answered</span>
        </div>
      </div>

      <div className="ca-continue-action">
        <div className="ca-progress-label">
          <span>Your Progress</span>
          <strong>{exam.progress}%</strong>
        </div>

        <div className="ca-progress-track">
          <div style={{ width: `${exam.progress}%` }} />
        </div>

        <button className="ca-lime-button" onClick={() => onView(exam)}>
          Resume Exam <ArrowRight size={19} />
        </button>
      </div>
    </section>
  );
}

function ExamSection({
  title,
  exams,
  icon: SectionIcon,
  onView,
}) {
  if (!exams.length) return null;

  return (
    <section className="ca-exam-section">
      <div className="ca-section-heading">
        <div className="ca-section-title">
          <SectionIcon size={22} />
          <h3>{title}</h3>
          <span className="ca-section-count">{exams.length}</span>
        </div>

        <span className="ca-section-label">
          {title === "Upcoming Exams" && "Prepare yourself"}
          {title === "Available Exams" && "Ready to attempt"}
          {title === "Completed Exams" && "Your performance"}
          {title === "Missed Exams" && "Past schedule"}
        </span>
      </div>

      <div className="ca-exam-list">
        {exams.map((exam) => {
          const Icon = exam.icon;

          return (
            <article className="ca-exam-row" key={exam.id}>
              <div className={`ca-exam-subject-icon ${statusStyles[exam.category]}`}>
                <Icon size={25} />
              </div>

              <div className="ca-exam-main-info">
                <div className="ca-exam-name-line">
                  <h4>{exam.name}</h4>
                  <StatusBadge status={exam.category} />
                </div>
                <span className="ca-exam-code">
                  {exam.id} <i>•</i> {exam.subject}
                </span>
              </div>

              <div className="ca-exam-date">
                <strong><CalendarDays size={16} /> {exam.date}</strong>
                <span><Clock3 size={16} /> {exam.time}</span>
              </div>

              <div className="ca-exam-numbers">
                <strong>{exam.duration} min</strong>
                <span>Duration</span>
              </div>

              <div className="ca-exam-numbers">
                <strong>{exam.questions}</strong>
                <span>Questions</span>
              </div>

              {exam.category === "Completed" ? (
                <div className="ca-exam-result">
                  {exam.resultPublished ? (
                    <>
                      <strong>{exam.score}/{exam.marks}</strong>
                      <span>{exam.percentage}% Score</span>
                    </>
                  ) : (
                    <span className="ca-pending-result">Result Pending</span>
                  )}
                </div>
              ) : (
                <div className="ca-exam-difficulty">
                  <DifficultyBadge difficulty={exam.difficulty} />
                </div>
              )}

              <button
                className="ca-view-button"
                onClick={() => onView(exam)}
              >
                {exam.category === "Available"
                  ? "Start Exam"
                  : exam.category === "Completed"
                    ? "View Result"
                    : "View Details"}
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function MyExams({ onStartExam }) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Exams");
  const [difficulty, setDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("Upcoming First");
  const [selectedExam, setSelectedExam] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredExams = useMemo(() => {
    let result = [...examData];

    const query = search.toLowerCase().trim();

    if (query) {
      result = result.filter((exam) =>
        `${exam.name} ${exam.subject} ${exam.id}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (activeTab !== "All Exams") {
      result = result.filter((exam) => exam.category === activeTab);
    }

    if (difficulty !== "All") {
      result = result.filter((exam) => exam.difficulty === difficulty);
    }

    if (sortBy === "Name A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "Highest Score") {
      result.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    } else if (sortBy === "Upcoming First") {
      result.sort((a, b) => {
        const order = {
          "In Progress": 0,
          Available: 1,
          Upcoming: 2,
          Completed: 3,
          Missed: 4,
        };
        return order[a.category] - order[b.category];
      });
    }

    return result;
  }, [search, activeTab, difficulty, sortBy]);

  const getSection = (category) =>
    filteredExams.filter((exam) => exam.category === category);

  const ongoingExam = getSection("In Progress")[0];

  const sectionData = [
    { title: "Upcoming Exams", category: "Upcoming", icon: CalendarDays },
    { title: "Available Exams", category: "Available", icon: CirclePlay },
    { title: "Completed Exams", category: "Completed", icon: CircleCheck },
    { title: "Missed Exams", category: "Missed", icon: CircleX },
  ];

  const isSearching = search.trim() || difficulty !== "All";

  return (
    <div className="ca-exams-page">
      <div className="ca-exams-heading">
        <div className="ca-page-title-icon">
          <ClipboardList size={29} />
        </div>
        <div>
          <h1>My <span>Exams</span></h1>
          <p>Explore, take, and track all your examinations in one place.</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="ca-search-toolbar">
        <div className="ca-search-box">
          <Search size={21} />
          <input
            type="text"
            placeholder="Search exams by name, subject or exam code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="ca-filter-wrapper">
          <button
            className={`ca-filter-button ${showFilters ? "selected" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={19} />
            Filters
          </button>

          {showFilters && (
            <div className="ca-filter-dropdown">
              <div className="ca-filter-heading">
                <strong>Filter Exams</strong>
                <button onClick={() => setShowFilters(false)}>
                  <X size={17} />
                </button>
              </div>

              <label htmlFor="ca-difficulty">Difficulty Level</label>
              <select
                id="ca-difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <button
                className="ca-clear-filter"
                onClick={() => {
                  setDifficulty("All");
                  setShowFilters(false);
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className="ca-sort-box">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort exams"
          >
            <option value="Upcoming First">Sort: Upcoming First</option>
            <option value="Name A-Z">Sort: Name A-Z</option>
            <option value="Highest Score">Sort: Highest Score</option>
          </select>
          <ChevronDown size={17} />
        </div>
      </div>

      {/* STATISTICS */}
      <section className="ca-exam-stats">
        <div className="ca-exam-stat total">
          <div className="ca-stat-icon"><ClipboardList size={27} /></div>
          <div><span>Total Exams</span><strong>24</strong></div>
        </div>

        <div className="ca-exam-stat upcoming">
          <div className="ca-stat-icon"><CalendarDays size={27} /></div>
          <div><span>Upcoming</span><strong>05</strong></div>
        </div>

        <div className="ca-exam-stat progress">
          <div className="ca-stat-icon"><CirclePlay size={27} /></div>
          <div><span>In Progress</span><strong>01</strong></div>
        </div>

        <div className="ca-exam-stat completed">
          <div className="ca-stat-icon"><CircleCheck size={27} /></div>
          <div><span>Completed</span><strong>18</strong></div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <div className="ca-exam-tabs">
        {tabs.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={activeTab === name ? "active" : ""}
            onClick={() => setActiveTab(name)}
          >
            <Icon size={19} />
            <span>{name}</span>
          </button>
        ))}
      </div>

      {/* ONGOING EXAM */}
      {ongoingExam && (
        <ContinueExam
          exam={ongoingExam}
          onView={setSelectedExam}
        />
      )}

      {/* EXAM SECTIONS */}
      {sectionData.map((section) => (
        <ExamSection
          key={section.category}
          title={section.title}
          exams={getSection(section.category)}
          icon={section.icon}
          onView={setSelectedExam}
        />
      ))}

      {/* EMPTY STATE */}
      {!filteredExams.length && (
        <div className="ca-empty-state">
          <div><Search size={34} /></div>
          <h3>No Exams Found</h3>
          <p>
            We couldn't find any exams matching your search or selected filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setDifficulty("All");
              setActiveTab("All Exams");
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {isSearching && filteredExams.length > 0 && (
        <div className="ca-results-count">
          Showing {filteredExams.length} matching examinations
        </div>
      )}

      <footer className="ca-exams-footer">
        Learn <span>•</span> Practice <span>•</span> Compete <span>•</span> Excel
      </footer>

      {/* EXAM DETAILS MODAL */}
      <ExamModal
  exam={selectedExam}
  onClose={() => setSelectedExam(null)}
  onStartExam={onStartExam}
/>
    </div>
  );
}

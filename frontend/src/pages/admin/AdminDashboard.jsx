import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Menu,
  ChevronDown,
  X,
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Trophy,
  Users,
  CircleHelp,
  ClipboardCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
  Target,
  Zap,
  Play,
  Clock,
  RotateCcw,
  Save,
  Palette,
  Database,
  UserRound,
  Star,
  Medal,
  Crown,
  BookOpen,
  Layers,
  Settings,
  LogOut,
  GraduationCap,
  FileText,
  CircleX,
  ImageUp,
  Moon,
  Award,
} from "lucide-react";

import BrandLogo from "../../components/common/BrandLogo";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminNavigation } from "../../components/admin/adminNavigation";
import "../../styles/admin.css";

const DEMO_NOTICE = "Frontend preview · sample data";

const initialStudents = [
  { id: 1, name: "Ananya R.", email: "ananya@example.edu", roll: "21CS045", department: "Computer Science", year: "III / V", exams: 12, score: 96, status: "Active" },
  { id: 2, name: "Karthik M.", email: "karthik@example.edu", roll: "21CS046", department: "Computer Science", year: "III / V", exams: 12, score: 94, status: "Active" },
  { id: 3, name: "Vishnu S.", email: "vishnu@example.edu", roll: "21IT012", department: "Information Tech", year: "III / V", exams: 11, score: 92, status: "Active" },
  { id: 4, name: "Priya D.", email: "priya@example.edu", roll: "22CS017", department: "Computer Science", year: "II / III", exams: 10, score: 91, status: "Active" },
  { id: 5, name: "Rohan K.", email: "rohan@example.edu", roll: "22IT031", department: "Information Tech", year: "II / III", exams: 10, score: 89, status: "Active" },
];

const initialExams = [
  { id: 1, title: "DBMS Internal Test", subject: "DBMS", type: "Exam", date: "Nov 15, 2026 · 10:00 AM", duration: "90 min", questions: 50, status: "Ongoing" },
  { id: 2, title: "Operating Systems Quiz", subject: "OS", type: "Quiz", date: "Nov 17, 2026 · 2:00 PM", duration: "30 min", questions: 20, status: "Upcoming" },
  { id: 3, title: "Aptitude Test", subject: "Aptitude", type: "Exam", date: "Nov 20, 2026 · 11:00 AM", duration: "60 min", questions: 40, status: "Upcoming" },
  { id: 4, title: "CN Practice Quiz", subject: "CN", type: "Quiz", date: "Nov 22, 2026 · 4:00 PM", duration: "30 min", questions: 25, status: "Draft" },
  { id: 5, title: "Data Structures Exam", subject: "DS", type: "Exam", date: "Nov 10, 2026 · 10:00 AM", duration: "120 min", questions: 60, status: "Completed" },
];

const initialQuestions = [
  { id: 1, question: "Which of the following is a property of a DBMS?", subject: "DBMS", topic: "Introduction", difficulty: "Medium", status: "Approved", source: "Question Bank" },
  { id: 2, question: "The time complexity of binary search is ____.", subject: "DSA", topic: "Searching", difficulty: "Easy", status: "Approved", source: "Question Bank" },
  { id: 3, question: "What is the primary purpose of normalization?", subject: "DBMS", topic: "Normalization", difficulty: "Hard", status: "Under Review", source: "Question Bank" },
  { id: 4, question: "Which component manages process scheduling?", subject: "OS", topic: "Processes", difficulty: "Easy", status: "Approved", source: "Exam Specific" },
  { id: 5, question: "Which data structure follows FIFO order?", subject: "DSA", topic: "Queues", difficulty: "Medium", status: "Rejected", source: "Question Bank" },
];

const initialQuizzes = [
  { id: 1, title: "DBMS Quick Quiz", subject: "DBMS", questions: 20, duration: "20 min", difficulty: "Medium", status: "Active", attempts: 1240, average: 78 },
  { id: 2, title: "Operating Systems Basics", subject: "OS", questions: 15, duration: "15 min", difficulty: "Easy", status: "Active", attempts: 2015, average: 84 },
  { id: 3, title: "Aptitude Practice Set", subject: "Aptitude", questions: 30, duration: "30 min", difficulty: "Hard", status: "Scheduled", attempts: 0, average: 0 },
  { id: 4, title: "CN Concepts Quiz", subject: "CN", questions: 25, duration: "25 min", difficulty: "Medium", status: "Completed", attempts: 1890, average: 81 },
  { id: 5, title: "Data Structures Quiz", subject: "DS", questions: 20, duration: "20 min", difficulty: "Easy", status: "Completed", attempts: 1560, average: 86 },
];

const initialResults = [
  { id: 1, title: "DBMS Final Exam", subject: "DBMS", date: "Nov 15, 2026 · 10:00 AM", students: 482, passRate: 82, average: 78 },
  { id: 2, title: "OS Mid Term", subject: "OS", date: "Nov 12, 2026 · 2:00 PM", students: 418, passRate: 76, average: 73 },
  { id: 3, title: "Aptitude Test", subject: "Aptitude", date: "Nov 10, 2026 · 11:00 AM", students: 612, passRate: 71, average: 69 },
  { id: 4, title: "CN Quiz", subject: "CN", date: "Nov 8, 2026 · 4:00 PM", students: 356, passRate: 89, average: 84 },
  { id: 5, title: "DSA Test", subject: "DSA", date: "Nov 5, 2026 · 10:00 AM", students: 521, passRate: 84, average: 81 },
];

const initialAchievements = [
  { id: 1, title: "Exam Ace", category: "Exam Based", criteria: "Score ≥ 90% in any exam", reward: 100, earned: 412, status: "Active", icon: "medal" },
  { id: 2, title: "Quiz Master", category: "Quiz Based", criteria: "Complete 10 quizzes", reward: 50, earned: 865, status: "Active", icon: "target" },
  { id: 3, title: "Top Performer", category: "Performance", criteria: "Top 5% overall score", reward: 150, earned: 124, status: "Active", icon: "crown" },
  { id: 4, title: "Streak Champion", category: "Performance", criteria: "Maintain 7-day study streak", reward: 75, earned: 538, status: "Active", icon: "flame" },
  { id: 5, title: "Subject Expert", category: "Special", criteria: "Score ≥ 90% in a subject", reward: 100, earned: 306, status: "Inactive", icon: "book" },
];

const initialResources = [
  { id: 1, title: "DBMS Complete Notes.pdf", subject: "DBMS", type: "Study Notes", size: "4.2 MB", date: "Nov 10, 2026", downloads: 2340, status: "Active" },
  { id: 2, title: "Operating System – Video Series", subject: "OS", type: "Video Lecture", size: "850 MB", date: "Nov 8, 2026", downloads: 1890, status: "Active" },
  { id: 3, title: "Aptitude Practice Questions.pdf", subject: "Aptitude", type: "Question Paper", size: "3.6 MB", date: "Nov 6, 2026", downloads: 3210, status: "Active" },
  { id: 4, title: "CN Important Topics.docx", subject: "CN", type: "Study Notes", size: "2.1 MB", date: "Nov 5, 2026", downloads: 1240, status: "Pending" },
  { id: 5, title: "DSA Reference Book.pdf", subject: "DSA", type: "E-Book", size: "12.4 MB", date: "Nov 3, 2026", downloads: 3960, status: "Active" },
];

const pageInfo = {
  dashboard: { title: "Admin Dashboard", accent: "", description: "Manage students, exams, questions, and platform performance.", icon: ChartNoAxesColumnIncreasing },
  students: { title: "Students", accent: "Management", description: "Manage student accounts, view performance, and track overall progress.", icon: GraduationCap },
  exams: { title: "Exams", accent: "Management", description: "Create, schedule, manage and track all examinations.", icon: CalendarDays },
  "question-bank": { title: "Question", accent: "Bank", description: "Create, organize and manage a centralized pool of single-correct MCQs.", icon: BookOpen },
  quizzes: { title: "Quizzes", accent: "Management", description: "Create engaging quizzes, set rules, and track student performance.", icon: Layers },
  results: { title: "Results &", accent: "Analytics", description: "View examination results, analyze performance, and get detailed insights.", icon: ChartNoAxesColumnIncreasing },
  achievements: { title: "Achievements", accent: "Management", description: "Create, manage and track student achievements, badges and rewards.", icon: Award },
  resources: { title: "Resources", accent: "Management", description: "Upload, organize and manage study materials, notes, and reference resources.", icon: BookOpen },
  settings: { title: "Settings", accent: "", description: "Configure and manage your platform, users, and system preferences.", icon: Settings },
};

function routeKey(pathname) {
  const last = pathname.split("/").filter(Boolean).at(-1) || "dashboard";
  return pageInfo[last] ? last : "dashboard";
}

function PageHero({ page, extra }) {
  const info = pageInfo[page] || pageInfo.dashboard;
  const Icon = info.icon;
  return (
    <section className="admin-page-hero">
      <div className="admin-page-hero-icon"><Icon size={52} strokeWidth={1.8} /></div>
      <div className="admin-page-hero-copy">
        <div className="admin-hero-eyebrow">CHAMPION ARENA · ADMIN PORTAL</div>
        <h1>{info.title} {info.accent && <em>{info.accent}</em>}</h1>
        <p>{info.description}</p>
      </div>
      <div className="admin-hero-art" aria-hidden="true">
        <span className="hero-art-star star-a">✦</span>
        <span className="hero-art-star star-b">✧</span>
        <div className="hero-art-books"><i /><i /><i /></div>
        <div className="hero-art-cap"><GraduationCap size={76} /></div>
        <div className="hero-art-cup"><Trophy size={80} /></div>
      </div>
      {extra && <div className="admin-hero-extra">{extra}</div>}
    </section>
  );
}

function DemoTag() {
  return <span className="admin-demo-tag"><span /> {DEMO_NOTICE}</span>;
}

function StatCard({ title, value, icon: Icon, trend, tone = "purple" }) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon ${tone}`}><Icon size={30} strokeWidth={2.1} /></div>
      <div className="admin-stat-copy"><strong>{value}</strong><span>{title}</span></div>
      {trend && <small className="admin-stat-trend"><TrendingUp size={13} /> {trend}</small>}
    </article>
  );
}

function StatGrid({ items }) {
  return <section className={`admin-stat-grid count-${items.length}`}>{items.map((item) => <StatCard key={item.title} {...item} />)}</section>;
}

function Panel({ title, icon: Icon, action, className = "", children }) {
  return (
    <section className={`admin-panel ${className}`}>
      <div className="admin-panel-heading">
        <div className="admin-panel-title">{Icon && <Icon size={21} />}<h2>{title}</h2></div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  const tone = ({ Active: "green", Approved: "green", Completed: "green", Ongoing: "green", Upcoming: "blue", Scheduled: "blue", Pending: "yellow", "Under Review": "yellow", Draft: "muted", Inactive: "muted", Rejected: "red", Missed: "red" })[status] || "muted";
  return <span className={`admin-status ${tone}`}><i />{status}</span>;
}

function SearchField({ value, onChange, placeholder }) {
  return <label className="admin-search-field"><Search size={18} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function SelectFilter({ value, onChange, options, label }) {
  return (
    <label className="admin-select-filter">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown size={16} />
    </label>
  );
}

function PrimaryButton({ children, onClick, icon: Icon = Plus, type = "button" }) {
  return <button type={type} className="admin-primary-button" onClick={onClick}>{Icon && <Icon size={18} />}<span>{children}</span></button>;
}

function SecondaryButton({ children, onClick, icon: Icon }) {
  return <button type="button" className="admin-secondary-button" onClick={onClick}>{Icon && <Icon size={17} />}<span>{children}</span></button>;
}

function Pagination({ count, page, setPage, pageSize = 5 }) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="admin-pagination">
      <span>Showing {count === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, count)} of {count} records</span>
      <div>
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Previous page"><ChevronLeft size={17} /></button>
        <b>{page}</b><span className="admin-page-of">/ {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => setPage((value) => Math.min(pages, value + 1))} aria-label="Next page"><ChevronRight size={17} /></button>
      </div>
    </div>
  );
}

function ActionButtons({ onView, onEdit, onDelete }) {
  if (!onView && !onEdit && !onDelete) return null;
  return (
    <div className="admin-row-actions">
      {onView && <button type="button" title="View" aria-label="View" onClick={onView}><Eye size={17} /></button>}
      {onEdit && <button type="button" title="Edit" aria-label="Edit" onClick={onEdit}><Pencil size={17} /></button>}
      {onDelete && <button type="button" title="Delete" aria-label="Delete" onClick={onDelete}><Trash2 size={17} /></button>}
    </div>
  );
}

function DataTable({ columns, rows, onView, onEdit, onDelete, emptyText = "No records found" }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / 5));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * 5;
  const visible = rows.slice(start, start + 5);
  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-data-table">
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="actions-head">Actions</th></tr></thead>
          <tbody>
            {visible.length ? visible.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => <td key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>)}
                <td><ActionButtons onView={() => onView?.(row)} onEdit={() => onEdit?.(row)} onDelete={() => onDelete?.(row)} /></td>
              </tr>
            )) : <tr><td colSpan={columns.length + 1} className="admin-empty-cell"><CircleAlert size={22} /><strong>{emptyText}</strong><span>Try adjusting your search or filters.</span></td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination count={rows.length} page={currentPage} setPage={setPage} />
    </>
  );
}

function Toolbar({ search, setSearch, placeholder, filters = [], children }) {
  return (
    <div className="admin-toolbar">
      <SearchField value={search} onChange={setSearch} placeholder={placeholder || "Search records..."} />
      {filters.map((filter) => <SelectFilter key={filter.label} {...filter} />)}
      {children}
    </div>
  );
}

function EmptySampleNote() {
  return <div className="admin-sample-note"><CircleAlert size={15} /> Sample preview records only. No backend connection is active in this frontend-only build.</div>;
}

function DashboardPage({ navigate }) {
  const [range, setRange] = useState("Last 6 Months");
  const recentExams = initialExams.slice(0, 4);
  const topStudents = initialStudents.slice(0, 5);
  const bars = [38, 52, 57, 74, 80, 93];
  return (
    <div className="admin-page-stack">
      <PageHero page="dashboard" />
      <StatGrid items={[
        { title: "Total Students", value: "2,486", icon: Users, trend: "+12%", tone: "purple" },
        { title: "Total Exams", value: "48", icon: FileText, trend: "+8%", tone: "blue" },
        { title: "Total Quizzes", value: "126", icon: ClipboardCheck, trend: "+15%", tone: "cyan" },
        { title: "Questions in Bank", value: "5,320", icon: CircleHelp, trend: "+20%", tone: "gold" },
      ]} />

      <div className="admin-dashboard-middle">
        <Panel title="Platform Overview" icon={ChartNoAxesColumnIncreasing} className="admin-dashboard-chart-panel">
          <div className="admin-chart-toolbar"><div className="admin-chart-legend"><span><i className="dot-purple" />Students</span><span><i className="dot-cyan" />Exams</span></div><SelectFilter label="Chart period" value={range} onChange={setRange} options={["Last 6 Months", "Last 30 Days", "This Year"]} /></div>
          <div className="admin-line-chart">
            <div className="admin-y-labels"><span>2,500</span><span>2,000</span><span>1,500</span><span>1,000</span><span>500</span><span>0</span></div>
            <svg viewBox="0 0 640 230" preserveAspectRatio="none" role="img" aria-label="Sample student and exam growth chart">
              {[20, 58, 96, 134, 172, 210].map((y) => <line key={y} x1="10" y1={y} x2="628" y2={y} className="chart-grid" />)}
              <defs><linearGradient id="studentsArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#bd4dff" stopOpacity=".28" /><stop offset="1" stopColor="#bd4dff" stopOpacity="0" /></linearGradient></defs>
              <polygon points="10,172 128,132 246,112 364,82 482,69 628,35 628,210 10,210" fill="url(#studentsArea)" />
              <polyline points="10,172 128,132 246,112 364,82 482,69 628,35" className="students-line" />
              <polyline points="10,196 128,183 246,175 364,153 482,142 628,119" className="exams-line" />
              {bars.map((v, i) => <circle key={i} cx={10 + i * 123} cy={210 - v * 1.88} r="4.5" className="chart-student-dot" />)}
            </svg>
            <div className="admin-x-labels"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span></div>
          </div>
          <div className="admin-chart-caption">Monthly growth trend · Demo dataset</div>
        </Panel>

        <Panel title="Exam Status" icon={ClipboardCheck} className="admin-exam-status-panel">
          <div className="admin-status-chart-layout"><div className="admin-status-donut"><div><strong>48</strong><span>Total Exams</span></div></div><div className="admin-status-legend"><span><i className="legend-green" />Completed <b>28 (58%)</b></span><span><i className="legend-cyan" />Ongoing <b>8 (17%)</b></span><span><i className="legend-yellow" />Upcoming <b>10 (21%)</b></span><span><i className="legend-red" />Draft <b>2 (4%)</b></span></div></div>
        </Panel>

        <Panel title="Quick Actions" icon={Zap} className="admin-quick-panel">
          <div className="admin-quick-actions-grid">
            {[{ label: "Create Exam", icon: Plus, to: "exams" }, { label: "Add Question", icon: CircleHelp, to: "question-bank" }, { label: "Add Student", icon: UserRound, to: "students" }, { label: "Upload Resource", icon: Upload, to: "resources" }].map((item) => <button type="button" className="admin-quick-action" key={item.label} onClick={() => navigate(`/admin/${item.to}`)}><item.icon size={27} /><span>{item.label}</span></button>)}
          </div>
        </Panel>
      </div>

      <div className="admin-dashboard-bottom">
        <Panel title="Recent Exams" icon={CalendarDays} action={<button className="admin-text-action" type="button" onClick={() => navigate("/admin/exams")}>View All <ChevronRight size={15} /></button>} className="admin-recent-exams-panel">
          <div className="admin-compact-list">{recentExams.map((exam) => <div className="admin-compact-row" key={exam.id}><span className="admin-compact-icon"><FileText size={18} /></span><strong>{exam.title}</strong><span>{exam.date.split(" · ")[0]}</span><StatusBadge status={exam.status} /></div>)}</div>
        </Panel>
        <Panel title="Top Performing Students" icon={Trophy} action={<button className="admin-text-action" type="button" onClick={() => navigate("/admin/students")}>View Students <ChevronRight size={15} /></button>} className="admin-top-performers-panel">
          <div className="admin-top-student-list">{topStudents.map((student, index) => <div className="admin-top-student" key={student.id}><span className={`admin-rank-medal rank-${index + 1}`}>{index + 1}</span><span className="admin-mini-avatar">{student.name.charAt(0)}</span><strong>{student.name}</strong><b>{(3820 - index * 140).toLocaleString("en-IN")} XP</b><span className="admin-score-pill">{student.score}%</span></div>)}</div>
        </Panel>
      </div>
      <EmptySampleNote />
    </div>
  );
}

function StudentsPage({ students, setStudents, openDialog, openConfirm }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [year, setYear] = useState("All Years");
  const filtered = useMemo(() => students.filter((student) => `${student.name} ${student.roll} ${student.email}`.toLowerCase().includes(search.toLowerCase()) && (department === "All Departments" || student.department === department) && (year === "All Years" || student.year.startsWith(year))), [students, search, department, year]);
  const active = students.filter((student) => student.status === "Active").length;
  const cols = [
    { key: "name", label: "Student", render: (value, row) => <div className="admin-person-cell"><span className="admin-mini-avatar">{value.charAt(0)}</span><span><strong>{value}</strong><small>{row.email}</small></span></div> },
    { key: "roll", label: "Roll Number" }, { key: "department", label: "Department" }, { key: "year", label: "Year / Sem" }, { key: "exams", label: "Exams Taken" }, { key: "score", label: "Avg. Score", render: (value) => <div className="admin-score-progress"><strong>{value}%</strong><span><i style={{ width: `${value}%` }} /></span></div> }, { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
  ];
  return (
    <div className="admin-page-stack">
      <PageHero page="students" />
      <StatGrid items={[{ title: "Total Students", value: students.length.toLocaleString("en-IN"), icon: Users, tone: "purple" }, { title: "Active Students", value: active.toLocaleString("en-IN"), icon: CheckCircle2, trend: "+8%", tone: "green" }, { title: "Inactive Students", value: (students.length - active).toString(), icon: UserRound, tone: "red" }, { title: "Top Performers", value: students.filter((s) => s.score >= 90).length.toString(), icon: Award, tone: "gold" }]} />
      <Toolbar search={search} setSearch={setSearch} placeholder="Search by name, roll number or email..." filters={[{ label: "Department", value: department, onChange: setDepartment, options: ["All Departments", "Computer Science", "Information Tech", "Electronics", "Mechanical"] }, { label: "Year", value: year, onChange: setYear, options: ["All Years", "III", "II", "I", "IV"] }]}>
        <PrimaryButton onClick={() => openDialog("student")} icon={Plus}>Add Student</PrimaryButton>
        <SecondaryButton icon={Upload} onClick={() => openDialog("import-students")}>Import CSV</SecondaryButton>
      </Toolbar>
      <Panel title="Students Directory" icon={Users} className="admin-table-panel"><DataTable columns={cols} rows={filtered} onView={(row) => openDialog("view-student", row)} onEdit={(row) => openDialog("student", row)} onDelete={(row) => openConfirm("student", row, () => setStudents((items) => items.filter((item) => item.id !== row.id)))} emptyText="No students match your search" /></Panel>
      <EmptySampleNote />
    </div>
  );
}

function ExamsPage({ exams, setExams, openDialog, openConfirm }) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [status, setStatus] = useState("All Status");
  const filtered = useMemo(() => exams.filter((exam) => `${exam.title} ${exam.subject} ${exam.type}`.toLowerCase().includes(search.toLowerCase()) && (subject === "All Subjects" || exam.subject === subject) && (status === "All Status" || exam.status === status)), [exams, search, subject, status]);
  const cols = [
    { key: "title", label: "Exam Title", render: (value) => <div className="admin-title-cell"><span className="admin-table-icon"><FileText size={18} /></span><strong>{value}</strong></div> },
    { key: "subject", label: "Subject", render: (value) => <span className="admin-subject-chip">{value}</span> },
    { key: "type", label: "Type" }, { key: "date", label: "Date & Time" }, { key: "duration", label: "Duration" }, { key: "questions", label: "Questions" }, { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
  ];
  return (
    <div className="admin-page-stack">
      <PageHero page="exams" />
      <StatGrid items={[{ title: "Total Exams", value: exams.length.toString(), icon: CalendarDays, tone: "purple" }, { title: "Ongoing Exams", value: exams.filter((e) => e.status === "Ongoing").length.toString(), icon: Play, tone: "green" }, { title: "Upcoming Exams", value: exams.filter((e) => e.status === "Upcoming").length.toString(), icon: Clock, tone: "gold" }, { title: "Completed Exams", value: exams.filter((e) => e.status === "Completed").length.toString(), icon: CheckCircle2, tone: "cyan" }]} />
      <Toolbar search={search} setSearch={setSearch} placeholder="Search exam by title, subject or code..." filters={[{ label: "Subject", value: subject, onChange: setSubject, options: ["All Subjects", "DBMS", "OS", "Aptitude", "CN", "DS"] }, { label: "Status", value: status, onChange: setStatus, options: ["All Status", "Ongoing", "Upcoming", "Draft", "Completed"] }, { label: "Term", value: "All Terms", onChange: () => {}, options: ["All Terms", "2026–2027", "2025–2026"] }]}>
        <PrimaryButton onClick={() => openDialog("exam")} icon={Plus}>Create Exam</PrimaryButton>
      </Toolbar>
      <Panel title="Examinations" icon={CalendarDays} className="admin-table-panel"><DataTable columns={cols} rows={filtered} onView={(row) => openDialog("view-exam", row)} onEdit={(row) => openDialog("exam", row)} onDelete={(row) => openConfirm("exam", row, () => setExams((items) => items.filter((item) => item.id !== row.id)))} /></Panel>
      <EmptySampleNote />
    </div>
  );
}

function QuestionBankPage({ questions, setQuestions, openDialog, openConfirm }) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [difficulty, setDifficulty] = useState("All Difficulty");
  const [status, setStatus] = useState("All Status");
  const filtered = useMemo(() => questions.filter((q) => `${q.question} ${q.subject} ${q.topic}`.toLowerCase().includes(search.toLowerCase()) && (subject === "All Subjects" || q.subject === subject) && (difficulty === "All Difficulty" || q.difficulty === difficulty) && (status === "All Status" || q.status === status)), [questions, search, subject, difficulty, status]);
  const cols = [
    { key: "question", label: "Question (Preview)", render: (value) => <span className="admin-question-preview">{value}</span> }, { key: "subject", label: "Subject", render: (value) => <span className="admin-subject-chip">{value}</span> }, { key: "topic", label: "Topic" }, { key: "source", label: "Source" }, { key: "difficulty", label: "Difficulty", render: (value) => <span className={`admin-difficulty ${value.toLowerCase()}`}>{value}</span> }, { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> },
  ];
  return (
    <div className="admin-page-stack">
      <PageHero page="question-bank" />
      <StatGrid items={[{ title: "Total Questions", value: questions.length.toLocaleString("en-IN"), icon: Layers, tone: "purple" }, { title: "Approved", value: questions.filter((q) => q.status === "Approved").length.toString(), icon: CheckCircle2, tone: "green" }, { title: "Under Review", value: questions.filter((q) => q.status === "Under Review").length.toString(), icon: Clock, tone: "gold" }, { title: "Rejected", value: questions.filter((q) => q.status === "Rejected").length.toString(), icon: CircleX, tone: "red" }]} />
      <div className="admin-category-tabs"><button className="selected" type="button">All Questions</button><button type="button">By Subject</button><button type="button">By Topic</button><button type="button">By Difficulty</button><button type="button">By Type · MCQ only</button></div>
      <Toolbar search={search} setSearch={setSearch} placeholder="Search question by keyword, ID or text..." filters={[{ label: "Subject", value: subject, onChange: setSubject, options: ["All Subjects", "DBMS", "DSA", "OS", "CN"] }, { label: "Difficulty", value: difficulty, onChange: setDifficulty, options: ["All Difficulty", "Easy", "Medium", "Hard"] }, { label: "Status", value: status, onChange: setStatus, options: ["All Status", "Approved", "Under Review", "Rejected"] }]}>
        <PrimaryButton onClick={() => openDialog("question")} icon={Plus}>Add Question</PrimaryButton>
        <SecondaryButton icon={Upload} onClick={() => openDialog("import-questions")}>Import CSV</SecondaryButton>
      </Toolbar>
      <Panel title="Question Catalogue" icon={CircleHelp} className="admin-table-panel"><DataTable columns={cols} rows={filtered} onView={(row) => openDialog("view-question", row)} onEdit={(row) => openDialog("question", row)} onDelete={(row) => openConfirm("question", row, () => setQuestions((items) => items.filter((item) => item.id !== row.id)))} /></Panel>
      <div className="admin-mcq-rule"><ShieldCheck size={18} /><span>Question format enforced in the interface: single-correct MCQ with exactly four options and one correct answer.</span></div>
      <EmptySampleNote />
    </div>
  );
}

function QuizzesPage({ quizzes, setQuizzes, openDialog, openConfirm }) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [difficulty, setDifficulty] = useState("All Difficulty");
  const [status, setStatus] = useState("All Status");
  const filtered = useMemo(() => quizzes.filter((q) => `${q.title} ${q.subject}`.toLowerCase().includes(search.toLowerCase()) && (subject === "All Subjects" || q.subject === subject) && (difficulty === "All Difficulty" || q.difficulty === difficulty) && (status === "All Status" || q.status === status)), [quizzes, search, subject, difficulty, status]);
  const cols = [
    { key: "title", label: "Quiz Title", render: (value) => <div className="admin-title-cell"><span className="admin-table-icon"><Layers size={18} /></span><strong>{value}</strong></div> }, { key: "subject", label: "Subject", render: (value) => <span className="admin-subject-chip">{value}</span> }, { key: "questions", label: "Questions" }, { key: "duration", label: "Duration" }, { key: "difficulty", label: "Difficulty", render: (value) => <span className={`admin-difficulty ${value.toLowerCase()}`}>{value}</span> }, { key: "status", label: "Status", render: (value) => <StatusBadge status={value} /> }, { key: "attempts", label: "Attempts", render: (value) => value ? value.toLocaleString("en-IN") : "—" }, { key: "average", label: "Avg. Score", render: (value) => value ? `${value}%` : "—" },
  ];
  return (
    <div className="admin-page-stack">
      <PageHero page="quizzes" />
      <StatGrid items={[{ title: "Total Quizzes", value: quizzes.length.toString(), icon: Layers, tone: "purple" }, { title: "Active Quizzes", value: quizzes.filter((q) => q.status === "Active").length.toString(), icon: Play, tone: "green" }, { title: "Scheduled", value: quizzes.filter((q) => q.status === "Scheduled").length.toString(), icon: CalendarDays, tone: "gold" }, { title: "Completed", value: quizzes.filter((q) => q.status === "Completed").length.toString(), icon: CheckCircle2, tone: "cyan" }]} />
      <Toolbar search={search} setSearch={setSearch} placeholder="Search quiz by title, subject or code..." filters={[{ label: "Subject", value: subject, onChange: setSubject, options: ["All Subjects", "DBMS", "OS", "Aptitude", "CN", "DS"] }, { label: "Difficulty", value: difficulty, onChange: setDifficulty, options: ["All Difficulty", "Easy", "Medium", "Hard"] }, { label: "Status", value: status, onChange: setStatus, options: ["All Status", "Active", "Scheduled", "Completed", "Draft"] }]}><PrimaryButton onClick={() => openDialog("quiz")} icon={Plus}>Create Quiz</PrimaryButton></Toolbar>
      <Panel title="Quiz Catalogue" icon={Layers} className="admin-table-panel"><DataTable columns={cols} rows={filtered} onView={(row) => openDialog("view-quiz", row)} onEdit={(row) => openDialog("quiz", row)} onDelete={(row) => openConfirm("quiz", row, () => setQuizzes((items) => items.filter((item) => item.id !== row.id)))} /></Panel>
      <EmptySampleNote />
    </div>
  );
}

function ResultsPage({ openDialog }) {
  const [range, setRange] = useState("Last 30 Days");
  const [subject, setSubject] = useState("All Subjects");
  const [search, setSearch] = useState("");
  const filtered = initialResults.filter((r) => `${r.title} ${r.subject}`.toLowerCase().includes(search.toLowerCase()) && (subject === "All Subjects" || r.subject === subject));
  return (
    <div className="admin-page-stack">
      <PageHero page="results" />
      <div className="admin-toolbar admin-report-toolbar"><SearchField value={search} onChange={setSearch} placeholder="Search exam results..." /><SelectFilter label="Date range" value={range} onChange={setRange} options={["Last 30 Days", "Last 7 Days", "This Year"]} /><SelectFilter label="Subject" value={subject} onChange={setSubject} options={["All Subjects", "DBMS", "OS", "Aptitude", "CN", "DSA"]} /><SecondaryButton icon={Download} onClick={() => downloadCsv(filtered, "champion-arena-results.csv")}>Export Report</SecondaryButton></div>
      <StatGrid items={[{ title: "Total Students", value: "2,486", icon: Users, trend: "+12%", tone: "purple" }, { title: "Students Passed", value: "1,689", icon: CheckCircle2, tone: "green" }, { title: "Overall Success Rate", value: "68%", icon: Target, trend: "+6%", tone: "cyan" }, { title: "Average Score", value: "78%", icon: ChartNoAxesColumnIncreasing, tone: "gold" }]} />
      <div className="admin-analytics-grid">
        <Panel title="Performance Trend" icon={ChartNoAxesColumnIncreasing} className="admin-analytics-line-panel"><div className="admin-chart-legend"><span><i className="dot-purple" />Average Score</span><span><i className="dot-cyan" />Pass Rate</span></div><div className="admin-report-line-chart"><svg viewBox="0 0 600 220" preserveAspectRatio="none"><defs><linearGradient id="reportLineArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ba49ff" stopOpacity=".25" /><stop offset="1" stopColor="#ba49ff" stopOpacity="0" /></linearGradient></defs>{[20,60,100,140,180].map((y) => <line key={y} x1="8" y1={y} x2="592" y2={y} className="chart-grid" />)}<polygon points="8,145 124,118 240,112 356,82 472,67 592,36 592,190 8,190" fill="url(#reportLineArea)" /><polyline points="8,145 124,118 240,112 356,82 472,67 592,36" className="students-line" /><polyline points="8,166 124,145 240,135 356,120 472,109 592,93" className="exams-line" /></svg><div className="admin-x-labels"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span></div></div></Panel>
        <Panel title="Subject-wise Performance" icon={BookOpen} className="admin-subject-breakdown"><div className="admin-subject-bars">{[{ name: "Computer Science", v: 85 }, { name: "Mathematics", v: 78 }, { name: "Physics", v: 72 }, { name: "Chemistry", v: 68 }, { name: "English", v: 62 }].map((item) => <div key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.v}%` }} /></i><strong>{item.v}%</strong></div>)}</div></Panel>
        <Panel title="Result Distribution" icon={Target} className="admin-distribution-panel"><div className="admin-distribution-layout"><div className="admin-result-donut"><div><strong>2,486</strong><span>Students</span></div></div><div className="admin-distribution-legend"><span><i className="legend-green" />Passed <b>68%</b></span><span><i className="legend-yellow" />Reappeared <b>18%</b></span><span><i className="legend-red" />Failed <b>14%</b></span></div></div></Panel>
      </div>
      <div className="admin-dashboard-bottom">
        <Panel title="Recent Exam Results" icon={CalendarDays} className="admin-table-panel"><DataTable columns={[{ key: "title", label: "Exam Title" }, { key: "subject", label: "Subject" }, { key: "date", label: "Date & Time" }, { key: "students", label: "Total Students" }, { key: "passRate", label: "Pass Rate", render: (v) => <span className="admin-score-pill">{v}%</span> }]} rows={filtered} onView={(row) => openDialog("view-result", row)} /></Panel>
        <Panel title="Top Performing Students" icon={Trophy} className="admin-top-performers-panel"><div className="admin-top-student-list">{initialStudents.slice(0, 5).map((s, i) => <div className="admin-top-student" key={s.id}><span className={`admin-rank-medal rank-${i + 1}`}>{i + 1}</span><span className="admin-mini-avatar">{s.name[0]}</span><strong>{s.name}</strong><b>{s.department}</b><span className="admin-score-pill">{s.score}%</span></div>)}</div></Panel>
      </div>
      <EmptySampleNote />
    </div>
  );
}

function AchievementIcon({ kind }) {
  const Icon = kind === "crown" ? Crown : kind === "flame" ? Zap : kind === "book" ? BookOpen : kind === "target" ? Target : Medal;
  return <span className={`admin-achievement-art ${kind}`}><Icon size={36} /></span>;
}

function AchievementsPage({ achievements, setAchievements, openDialog, openConfirm }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const filtered = achievements.filter((a) => `${a.title} ${a.criteria}`.toLowerCase().includes(search.toLowerCase()) && (category === "All Categories" || a.category === category) && (status === "All Status" || a.status === status));
  const cols = [{ key: "title", label: "Achievement Title", render: (v, row) => <div className="admin-title-cell"><AchievementIcon kind={row.icon} /><strong>{v}</strong></div> }, { key: "category", label: "Category", render: (v) => <span className="admin-subject-chip">{v}</span> }, { key: "criteria", label: "Criteria" }, { key: "reward", label: "XP Reward", render: (v) => <strong className="admin-xp-reward"><Trophy size={15} /> {v} XP</strong> }, { key: "earned", label: "Earned By" }, { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> }];
  return (
    <div className="admin-page-stack">
      <PageHero page="achievements" />
      <StatGrid items={[{ title: "Total Achievements", value: achievements.length.toString(), icon: Medal, tone: "gold" }, { title: "Students Earned", value: "1,862", icon: Users, tone: "purple" }, { title: "Total Badges", value: "5,430", icon: Star, tone: "cyan" }, { title: "Achievement Rate", value: "78%", icon: TrendingUp, tone: "green" }]} />
      <div className="admin-category-tabs"><button className="selected" type="button">All Achievements</button><button type="button">Exam Based</button><button type="button">Quiz Based</button><button type="button">Performance</button><button type="button">Special</button><span className="tab-spacer" /><PrimaryButton onClick={() => openDialog("achievement")} icon={Plus}>Create Achievement</PrimaryButton></div>
      <Toolbar search={search} setSearch={setSearch} placeholder="Search achievement by title or description..." filters={[{ label: "Category", value: category, onChange: setCategory, options: ["All Categories", "Exam Based", "Quiz Based", "Performance", "Special"] }, { label: "Status", value: status, onChange: setStatus, options: ["All Status", "Active", "Inactive"] }]} />
      <Panel title="Achievements List" icon={Trophy} className="admin-table-panel"><DataTable columns={cols} rows={filtered} onView={(row) => openDialog("view-achievement", row)} onEdit={(row) => openDialog("achievement", row)} onDelete={(row) => openConfirm("achievement", row, () => setAchievements((items) => items.filter((item) => item.id !== row.id)))} /></Panel>
      <EmptySampleNote />
    </div>
  );
}

function ResourcesPage({ resources, setResources, openDialog, openConfirm }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [subject, setSubject] = useState("All Subjects");
  const filtered = resources.filter((r) => `${r.title} ${r.subject}`.toLowerCase().includes(search.toLowerCase()) && (type === "All Types" || r.type === type) && (subject === "All Subjects" || r.subject === subject));
  const cols = [{ key: "title", label: "Resource Title", render: (v) => <div className="admin-title-cell"><span className="admin-table-icon"><FileText size={18} /></span><strong>{v}</strong></div> }, { key: "subject", label: "Subject", render: (v) => <span className="admin-subject-chip">{v}</span> }, { key: "type", label: "Type" }, { key: "size", label: "Size" }, { key: "date", label: "Uploaded On" }, { key: "downloads", label: "Downloads", render: (v) => v.toLocaleString("en-IN") }, { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> }];
  return (
    <div className="admin-page-stack">
      <PageHero page="resources" />
      <StatGrid items={[{ title: "Total Resources", value: "246", icon: BookOpen, tone: "purple" }, { title: "Total Downloads", value: "12,640", icon: Download, tone: "green" }, { title: "Students Accessed", value: "1,862", icon: Users, tone: "cyan" }, { title: "Usage Rate", value: "92%", icon: TrendingUp, tone: "gold" }]} />
      <div className="admin-category-tabs resource-tabs">{["All Resources", "Study Notes", "Question Papers", "Video Lectures", "E-Books", "Reference Links"].map((item, i) => <button type="button" className={i === 0 ? "selected" : ""} key={item}>{item}</button>)}</div>
      <Toolbar search={search} setSearch={setSearch} placeholder="Search resources by title, subject or keyword..." filters={[{ label: "Subject", value: subject, onChange: setSubject, options: ["All Subjects", "DBMS", "OS", "Aptitude", "CN", "DSA"] }, { label: "Type", value: type, onChange: setType, options: ["All Types", "Study Notes", "Question Paper", "Video Lecture", "E-Book"] }]}><PrimaryButton onClick={() => openDialog("resource")} icon={Upload}>Upload Resource</PrimaryButton></Toolbar>
      <Panel title="Resources Catalogue" icon={BookOpen} className="admin-table-panel"><DataTable columns={cols} rows={filtered} onView={(row) => openDialog("view-resource", row)} onEdit={(row) => openDialog("resource", row)} onDelete={(row) => openConfirm("resource", row, () => setResources((items) => items.filter((item) => item.id !== row.id)))} /></Panel>
      <div className="admin-upload-note"><ImageUp size={18} /><span>File selection is a local UI preview only. Upload storage and real downloads require a backend service.</span></div>
      <EmptySampleNote />
    </div>
  );
}

function SettingsPage() {
  const sections = ["General Settings", "User & Roles", "Exam Settings", "Quiz Settings", "Achievement Settings", "Notification Settings", "Security & Access", "Appearance", "Backup & Data"];
  const [section, setSection] = useState("General Settings");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ name: "Champion Arena", tagline: "Gamified Exam & Learning Platform", email: "admin@championarena.edu", support: "support@championarena.edu", year: "2026 – 2027", timezone: "(GMT+05:30) India Standard Time", description: "Champion Arena is a gamified exam and learning platform that helps students practice, take exams, earn rewards, and track their progress.", registration: true, examAccess: true, rewards: true, notifications: true, darkMode: true });
  const set = (key, value) => { setSettings((current) => ({ ...current, [key]: value })); setSaved(false); };
  const toggle = (key, label, Icon) => <div className="admin-setting-toggle-row" key={key}><span><Icon size={17} />{label}</span><button type="button" className={`admin-switch ${settings[key] ? "on" : ""}`} onClick={() => set(key, !settings[key])} aria-pressed={settings[key]}><i /></button></div>;
  return (
    <div className="admin-page-stack">
      <PageHero page="settings" />
      <div className="admin-settings-layout">
        <nav className="admin-settings-nav" aria-label="Settings sections">{sections.map((item, index) => { const icons = [Settings, Users, CalendarDays, Layers, Award, Bell, ShieldCheck, Palette, Database]; const Icon = icons[index]; return <button type="button" key={item} className={section === item ? "selected" : ""} onClick={() => setSection(item)}><Icon size={19} />{item}</button>; })}</nav>
        <section className="admin-settings-main">
          <div className="admin-settings-card">
            <div className="admin-panel-heading"><div className="admin-panel-title"><Settings size={21} /><h2>{section}</h2></div><span className="admin-settings-demo">Local preview</span></div>
            {section === "General Settings" ? <>
              <p className="admin-settings-intro">Manage basic platform information and configuration.</p>
              <div className="admin-settings-form-grid">
                <label>Platform Name *<input value={settings.name} onChange={(e) => set("name", e.target.value)} /></label>
                <label>Platform Tagline<input value={settings.tagline} onChange={(e) => set("tagline", e.target.value)} /></label>
                <label>Admin Email *<input type="email" value={settings.email} onChange={(e) => set("email", e.target.value)} /></label>
                <label>Support Email<input type="email" value={settings.support} onChange={(e) => set("support", e.target.value)} /></label>
                <label>Academic Year<select value={settings.year} onChange={(e) => set("year", e.target.value)}><option>2026 – 2027</option><option>2025 – 2026</option><option>2027 – 2028</option></select></label>
                <label>Default Time Zone<select value={settings.timezone} onChange={(e) => set("timezone", e.target.value)}><option>(GMT+05:30) India Standard Time</option><option>(GMT+00:00) UTC</option></select></label>
                <label className="full-width">Platform Description<textarea rows="4" maxLength={250} value={settings.description} onChange={(e) => set("description", e.target.value)} /><small>{settings.description.length} / 250</small></label>
              </div>
            </> : <SettingsSection section={section} />}
            <div className="admin-settings-actions"><SecondaryButton icon={RotateCcw} onClick={() => { setSettings({ name: "Champion Arena", tagline: "Gamified Exam & Learning Platform", email: "admin@championarena.edu", support: "support@championarena.edu", year: "2026 – 2027", timezone: "(GMT+05:30) India Standard Time", description: "Champion Arena is a gamified exam and learning platform that helps students practice, take exams, earn rewards, and track their progress.", registration: true, examAccess: true, rewards: true, notifications: true, darkMode: true }); setSaved(false); }}>Reset to Default</SecondaryButton><PrimaryButton icon={Save} onClick={() => setSaved(true)}>Save Changes</PrimaryButton></div>
            {saved && <p className="admin-save-confirm"><CheckCircle2 size={16} /> Settings updated in this preview session only. Changes are not sent to a server.</p>}
          </div>
          <div className="admin-settings-side">
            <Panel title="Platform Branding" icon={Settings}><div className="admin-brand-preview"><BrandLogo /></div><label className="admin-file-label"><ImageUp size={17} /> Choose File<input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => setSaved(Boolean(e.target.files?.[0]))} /></label><small>PNG, JPG or SVG · Max 2 MB · Preview only</small></Panel>
            <Panel title="Quick Settings" icon={Zap}><div className="admin-setting-toggle-list">{toggle("registration", "Student Registration", Settings)}{toggle("examAccess", "Exam Access", CalendarDays)}{toggle("rewards", "Achievements & Rewards", Trophy)}{toggle("notifications", "Notifications", Bell)}{toggle("darkMode", "Dark Mode (Default)", Moon)}</div></Panel>
          </div>
        </section>
      </div>
      <EmptySampleNote />
    </div>
  );
}

function SettingsSection({ section }) {
  const descriptions = {
    "User & Roles": "Champion Arena contains two account categories only: Student and Admin. Role permissions are shown here as a frontend preview.",
    "Exam Settings": "Configure default examination duration, attempt limits, access modes and result release preferences.",
    "Quiz Settings": "Configure default quiz duration, difficulty options and availability preferences.",
    "Achievement Settings": "Review XP and badge reward preferences. Award rules are not connected to a server in this preview.",
    "Notification Settings": "Choose which platform notifications should be enabled for this preview.",
    "Security & Access": "Review the current access-control areas. Authentication and password security are not modified from this frontend screen.",
    Appearance: "Choose the platform appearance and display preferences.",
    "Backup & Data": "Backup, restore and database export actions require a server-side implementation and are disabled in this frontend-only build.",
  };
  if (section === "User & Roles") return <div className="admin-settings-info-grid"><div><ShieldCheck size={26} /><strong>Admin</strong><p>Manage platform configuration, students, examinations, quizzes and reports.</p></div><div><GraduationCap size={26} /><strong>Student</strong><p>Attempt examinations and quizzes, view results and earn achievements.</p></div><div className="full-width"><CircleAlert size={17} /><p>No additional user roles are supported.</p></div></div>;
  return <div className="admin-settings-placeholder"><div className="settings-placeholder-icon"><Settings size={30} /></div><h3>{section}</h3><p>{descriptions[section]}</p><span>Settings controls are presented as frontend preview only.</span></div>;
}

function AdminTopbar({ onMenu, onLogout }) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="admin-topbar">
      <button type="button" className="admin-menu-toggle" onClick={onMenu} aria-label="Open navigation"><Menu size={24} /></button>
      <div className="admin-topbar-brand"><BrandLogo /><span className="admin-brand-divider" /><span className="admin-portal-pill"><ShieldCheck size={18} />Admin Portal</span></div>
      <div className="admin-topbar-spacer" />
      <div className="admin-topbar-actions">
        <div className="admin-popover-wrap"><button type="button" className={`admin-notification ${notificationOpen ? "open" : ""}`} onClick={() => { setNotificationOpen((v) => !v); setProfileOpen(false); }} aria-label="Notifications"><Bell size={24} /><span>5</span></button>{notificationOpen && <div className="admin-popover admin-notification-popover"><strong>Notifications <small>Sample</small></strong><p><i className="popover-dot purple" />New exam schedule added</p><p><i className="popover-dot green" />5 student accounts activated</p><p><i className="popover-dot yellow" />2 questions awaiting review</p><span>Preview notifications · not live</span></div>}</div>
        <span className="admin-profile-divider" />
        <div className="admin-popover-wrap"><button type="button" className="admin-profile" onClick={() => { setProfileOpen((v) => !v); setNotificationOpen(false); }}><span className="admin-avatar">A</span><span className="admin-profile-copy"><strong>Admin</strong><small>System Administrator</small></span><ChevronDown size={17} className={profileOpen ? "rotated" : ""} /></button>{profileOpen && <div className="admin-popover admin-profile-popover"><strong>Administrator</strong><span>Admin Portal · Preview session</span><button type="button" onClick={onLogout}><LogOut size={16} /> Logout</button></div>}</div>
      </div>
    </header>
  );
}

function AdminModal({ dialog, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    const item = dialog?.item || {};
    return {
      ...item,
      ...(item.options ? {
        optionA: item.options.A || "",
        optionB: item.options.B || "",
        optionC: item.options.C || "",
        optionD: item.options.D || "",
      } : {}),
    };
  });
  const [selectedCorrect, setSelectedCorrect] = useState(dialog?.item?.correctOption || "A");
  if (!dialog) return null;
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const type = dialog.type;
  const view = type.startsWith("view-");
  const importMode = type.startsWith("import-");
  const config = {
    student: { title: dialog.item ? "Edit Student" : "Add Student", fields: [{ key: "name", label: "Full Name", required: true }, { key: "email", label: "Email", required: true }, { key: "roll", label: "Roll Number", required: true }, { key: "department", label: "Department", options: ["Computer Science", "Information Tech", "Electronics", "Mechanical"] }, { key: "year", label: "Year / Semester", options: ["I / I", "II / III", "III / V", "IV / VII"] }, { key: "status", label: "Status", options: ["Active", "Inactive"] }] },
    exam: { title: dialog.item ? "Edit Examination" : "Create Examination", fields: [{ key: "title", label: "Exam Title", required: true }, { key: "subject", label: "Subject", options: ["DBMS", "OS", "Aptitude", "CN", "DSA"] }, { key: "type", label: "Type", options: ["Exam", "Quiz"] }, { key: "date", label: "Date & Time", required: true }, { key: "duration", label: "Duration", placeholder: "90 min" }, { key: "questions", label: "Question Count", type: "number" }, { key: "status", label: "Status", options: ["Draft", "Upcoming", "Ongoing", "Completed"] }, { key: "accessMode", label: "Access Type", options: ["Public", "Institution Code", "Assigned"] }, { key: "questionSource", label: "Question Source", options: ["Question Bank", "Exam Specific", "Mixed"] }, { key: "attemptLimit", label: "Attempt Limit", type: "number" }, { key: "instructions", label: "Instructions", type: "textarea" }] },
    question: { title: dialog.item ? "Edit Question" : "Add Single-Correct MCQ", fields: [{ key: "question", label: "Question Text", type: "textarea", required: true }, { key: "subject", label: "Subject", options: ["DBMS", "DSA", "OS", "CN", "Aptitude"] }, { key: "topic", label: "Topic" }, { key: "difficulty", label: "Difficulty", options: ["Easy", "Medium", "Hard"] }, { key: "source", label: "Question Source", options: ["Question Bank", "Exam Specific"] }] },
    quiz: { title: dialog.item ? "Edit Quiz" : "Create Quiz", fields: [{ key: "title", label: "Quiz Title", required: true }, { key: "subject", label: "Subject", options: ["DBMS", "OS", "Aptitude", "CN", "DSA"] }, { key: "questions", label: "Number of Questions", type: "number" }, { key: "duration", label: "Duration", placeholder: "20 min" }, { key: "difficulty", label: "Difficulty", options: ["Easy", "Medium", "Hard"] }, { key: "status", label: "Status", options: ["Draft", "Active", "Scheduled", "Completed"] }] },
    achievement: { title: dialog.item ? "Edit Achievement" : "Create Achievement", fields: [{ key: "title", label: "Achievement Title", required: true }, { key: "category", label: "Category", options: ["Exam Based", "Quiz Based", "Performance", "Special"] }, { key: "criteria", label: "Unlock Criteria", type: "textarea", required: true }, { key: "reward", label: "XP Reward", type: "number" }, { key: "status", label: "Status", options: ["Active", "Inactive"] }] },
    resource: { title: dialog.item ? "Edit Resource" : "Upload Resource", fields: [{ key: "title", label: "Resource Title", required: true }, { key: "subject", label: "Subject", options: ["DBMS", "OS", "Aptitude", "CN", "DSA"] }, { key: "type", label: "Resource Type", options: ["Study Notes", "Question Paper", "Video Lecture", "E-Book", "Reference Link"] }, { key: "size", label: "File Size", placeholder: "e.g. 4.2 MB" }, { key: "status", label: "Status", options: ["Active", "Pending"] }] },
  }[type];
  const importTitle = type === "import-students" ? "Import Students CSV" : "Import Questions CSV";
  const title = view ? "Record Details" : importMode ? importTitle : config?.title || "Details";
  const readOnly = view;
  const renderField = (field) => {
    const value = form[field.key] ?? "";
    return <label className={`admin-form-field ${field.type === "textarea" ? "full-width" : ""}`} key={field.key}>{field.label}{field.options ? <select disabled={readOnly} value={value || field.options[0]} onChange={(e) => update(field.key, e.target.value)}>{field.options.map((option) => <option key={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea rows={3} required={field.required} readOnly={readOnly} value={value} onChange={(e) => update(field.key, e.target.value)} /> : <input type={field.type || "text"} required={field.required} readOnly={readOnly} placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`} value={value} onChange={(e) => update(field.key, e.target.value)} />}</label>;
  };
  return (
    <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <div className="admin-modal-header"><div><span className="admin-modal-eyebrow">CHAMPION ARENA · ADMIN</span><h2 id="admin-dialog-title">{title}</h2></div><button type="button" onClick={onClose} aria-label="Close dialog"><X size={21} /></button></div>
        {importMode ? <div className="admin-modal-body"><div className="admin-import-drop"><Upload size={34} /><strong>Select a CSV file</strong><span>Choose a file from your device to preview the import workflow.</span><input type="file" accept=".csv,text/csv" /></div><p className="admin-form-help">Frontend-only preview: the selected file is not uploaded or imported into a database.</p></div> : type === "question" ? <div className="admin-modal-body"><div className="admin-form-grid">{config.fields.map(renderField)}</div><div className="admin-options-editor"><strong>Answer Options <small>Exactly four options · choose one correct answer</small></strong>{["A", "B", "C", "D"].map((option) => <label key={option}><input type="radio" name="correct-option" checked={selectedCorrect === option} onChange={() => setSelectedCorrect(option)} /><b>{option}</b><input placeholder={`Enter option ${option}`} readOnly={readOnly} value={form[`option${option}`] ?? ""} onChange={(e) => update(`option${option}`, e.target.value)} /></label>)}</div><p className="admin-form-help">This form demonstrates the single-correct MCQ rules in the frontend. Save only updates the local preview list.</p></div> : <div className="admin-modal-body"><div className="admin-form-grid">{config?.fields?.map(renderField)}{view && Object.entries(dialog.item || {}).filter(([key]) => !config?.fields?.some((field) => field.key === key)).map(([key, value]) => <label className="admin-form-field" key={key}>{key}<input readOnly value={String(value)} /></label>)}</div>{type === "resource" && <p className="admin-form-help">File storage is not connected. This only adds resource metadata to the current browser session.</p>}</div>}
        <div className="admin-modal-footer"><SecondaryButton onClick={onClose}>{view || importMode ? "Close" : "Cancel"}</SecondaryButton>{!view && !importMode && <PrimaryButton icon={Save} onClick={() => onSave({ ...form, correctOption: selectedCorrect })}>Save Preview</PrimaryButton>}</div>
      </section>
    </div>
  );
}

function ConfirmDialog({ confirm, onClose }) {
  if (!confirm) return null;
  return <div className="admin-modal-backdrop"><section className="admin-confirm-modal" role="alertdialog" aria-modal="true"><span className="admin-confirm-icon"><Trash2 size={27} /></span><h2>Delete {confirm.kind}?</h2><p>Are you sure you want to remove <strong>{confirm.row?.title || confirm.row?.name || confirm.row?.question || "this record"}</strong> from this local preview?</p><div className="admin-modal-footer"><SecondaryButton onClick={onClose}>Cancel</SecondaryButton><button type="button" className="admin-danger-button" onClick={() => { confirm.action(); onClose(); }}>Delete</button></div></section></div>;
}

function LogoutModal({ onCancel, onConfirm }) {
  return <div className="admin-modal-backdrop logout-backdrop"><section className="admin-logout-modal" role="alertdialog" aria-modal="true" aria-labelledby="logout-title"><button type="button" className="admin-logout-close" onClick={onCancel} aria-label="Close"><X size={22} /></button><div className="admin-logout-art"><div className="logout-door"><LogOut size={55} /></div><span className="logout-laurel left">❧</span><span className="logout-laurel right">❧</span><span className="logout-rays">✦</span></div><h2 id="logout-title">Logout from <em>Admin Portal?</em></h2><p>Are you sure you want to sign out from Champion Arena?<br />You can log in again anytime.</p><div className="admin-logout-actions"><button type="button" className="admin-secondary-button" onClick={onCancel}>Cancel</button><button type="button" className="admin-primary-button" onClick={onConfirm}><LogOut size={20} />Logout</button></div><small>Frontend preview · no server session will be changed</small></section></div>;
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [keys.map(escape).join(","), ...rows.map((row) => keys.map((key) => escape(row[key])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const page = routeKey(location.pathname);
  const activeLabel = adminNavigation.find((item) => item.path.endsWith(page))?.label || "Dashboard";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [exams, setExams] = useState(initialExams);
  const [questions, setQuestions] = useState(initialQuestions);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [resources, setResources] = useState(initialResources);

  const showToast = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const openConfirm = (kind, row, action) => setConfirm({ kind, row, action });
  const saveDialog = (payload) => {
    const type = dialog.type;
    const id = dialog.item?.id || Date.now();
    if (type === "student") {
      const item = { id, name: payload.name || "New Student", email: payload.email || "student@example.edu", roll: payload.roll || "—", department: payload.department || "Computer Science", year: payload.year || "I / I", exams: payload.exams || 0, score: Number(payload.score || 0), status: payload.status || "Active" };
      setStudents((items) => dialog.item ? items.map((row) => row.id === id ? item : row) : [...items, item]);
    }
    if (type === "exam") {
      const item = { id, title: payload.title || "New Examination", subject: payload.subject || "DBMS", type: payload.type || "Exam", date: payload.date || "To be scheduled", duration: payload.duration || "60 min", questions: Number(payload.questions || 0), status: payload.status || "Draft", accessMode: payload.accessMode || "Public", questionSource: payload.questionSource || "Question Bank", attemptLimit: Number(payload.attemptLimit || 1), instructions: payload.instructions || "" };
      setExams((items) => dialog.item ? items.map((row) => row.id === id ? item : row) : [...items, item]);
    }
    if (type === "question") {
      const options = [payload.optionA, payload.optionB, payload.optionC, payload.optionD];
      if (!payload.question?.trim() || options.some((option) => !option?.trim())) { showToast("Enter the question and all four options."); return; }
      const item = { id, question: payload.question, options: { A: payload.optionA, B: payload.optionB, C: payload.optionC, D: payload.optionD }, correctOption: payload.correctOption || "A", subject: payload.subject || "DBMS", topic: payload.topic || "General", difficulty: payload.difficulty || "Medium", status: "Under Review", source: payload.source || "Question Bank" };
      setQuestions((items) => dialog.item ? items.map((row) => row.id === id ? item : row) : [...items, item]);
    }
    if (type === "quiz") {
      const item = { id, title: payload.title || "New Quiz", subject: payload.subject || "DBMS", questions: Number(payload.questions || 0), duration: payload.duration || "20 min", difficulty: payload.difficulty || "Medium", status: payload.status || "Draft", attempts: 0, average: 0 };
      setQuizzes((items) => dialog.item ? items.map((row) => row.id === id ? item : row) : [...items, item]);
    }
    if (type === "achievement") {
      const item = { id, title: payload.title || "New Achievement", category: payload.category || "Special", criteria: payload.criteria || "Complete the criteria", reward: Number(payload.reward || 0), earned: 0, status: payload.status || "Active", icon: "medal" };
      setAchievements((items) => dialog.item ? items.map((row) => row.id === id ? item : row) : [...items, item]);
    }
    if (type === "resource") {
      const item = { id, title: payload.title || "New Resource", subject: payload.subject || "DBMS", type: payload.type || "Study Notes", size: payload.size || "—", date: "Preview", downloads: 0, status: payload.status || "Pending" };
      setResources((items) => dialog.item ? items.map((row) => row.id === id ? item : row) : [...items, item]);
    }
    setDialog(null);
    showToast("Saved to the current frontend preview session.");
  };

  const selectPage = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };
  const logout = () => {
    setLogoutOpen(false);
    showToast("Preview logout completed. Connect the authentication flow before production.");
    navigate("/");
  };

  return (
    <div className="admin-app-shell">
      <AdminTopbar onMenu={() => setMobileMenuOpen(true)} onLogout={() => setLogoutOpen(true)} />
      <div className="admin-workspace">
        <AdminSidebar active={logoutOpen ? "Logout" : activeLabel} onSelect={selectPage} open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} onLogout={() => setLogoutOpen(true)} />
        <main className="admin-main-content">
          <div className="admin-content-inner">
            {page === "dashboard" && <DashboardPage navigate={navigate} />}
            {page === "students" && <StudentsPage students={students} setStudents={setStudents} openDialog={(type, item) => setDialog({ type, item })} openConfirm={openConfirm} />}
            {page === "exams" && <ExamsPage exams={exams} setExams={setExams} openDialog={(type, item) => setDialog({ type, item })} openConfirm={openConfirm} />}
            {page === "question-bank" && <QuestionBankPage questions={questions} setQuestions={setQuestions} openDialog={(type, item) => setDialog({ type, item })} openConfirm={openConfirm} />}
            {page === "quizzes" && <QuizzesPage quizzes={quizzes} setQuizzes={setQuizzes} openDialog={(type, item) => setDialog({ type, item })} openConfirm={openConfirm} />}
            {page === "results" && <ResultsPage openDialog={(type, item) => setDialog({ type, item })} />}
            {page === "achievements" && <AchievementsPage achievements={achievements} setAchievements={setAchievements} openDialog={(type, item) => setDialog({ type, item })} openConfirm={openConfirm} />}
            {page === "resources" && <ResourcesPage resources={resources} setResources={setResources} openDialog={(type, item) => setDialog({ type, item })} openConfirm={openConfirm} />}
            {page === "settings" && <SettingsPage />}
            <footer className="admin-page-foot"><span>Champion Arena · Admin Portal</span><DemoTag /></footer>
          </div>
        </main>
      </div>
      {dialog && <AdminModal key={`${dialog.type}-${dialog.item?.id || "new"}`} dialog={dialog} onClose={() => setDialog(null)} onSave={saveDialog} />}
      <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />
      {logoutOpen && <LogoutModal onCancel={() => setLogoutOpen(false)} onConfirm={logout} />}
      {toast && <div className="admin-toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  ClipboardList,
  CalendarDays,
  CircleCheck,
  Hourglass,
  CircleAlert,
  ChartNoAxesColumnIncreasing,
  Search,
  FileText,
  Clock3,
  X,
  GraduationCap,
  Info,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { PageBanner, StatCard, GlassPanel, PortalTabs, EmptyState } from "../../components/student/PortalUI";

// Representative UI data only. This frontend archive contains no exam-list API client.
const exams = [
  { id: "EX-001", title: "DBMS Internal Test", subject: "DBMS", date: "Nov 15, 2026", time: "10:00 AM", duration: 60, status: "Upcoming" },
  { id: "EX-002", title: "Operating Systems Quiz", subject: "Operating Systems", date: "Nov 17, 2026", time: "02:00 PM", duration: 45, status: "Upcoming" },
  { id: "EX-003", title: "Aptitude Test", subject: "Aptitude", date: "Nov 20, 2026", time: "11:00 AM", duration: 60, status: "Upcoming" },
  { id: "EX-004", title: "Computer Networks Exam", subject: "Computer Networks", date: "Nov 10, 2026", time: "10:00 AM", duration: 60, status: "Completed", score: "49 / 60", percentage: 82 },
  { id: "EX-005", title: "Data Structures Test", subject: "Data Structures", date: "Nov 05, 2026", time: "02:00 PM", duration: 60, status: "Completed", score: "54 / 60", percentage: 90 },
  { id: "EX-006", title: "Python Fundamentals", subject: "Python", date: "Nov 03, 2026", time: "10:00 AM", duration: 45, status: "Completed", score: "44 / 50", percentage: 88 },
  { id: "EX-007", title: "Computer Basics Assessment", subject: "Computer Basics", date: "Nov 01, 2026", time: "11:00 AM", duration: 45, status: "Missed" },
  { id: "EX-008", title: "Java Programming Test", subject: "Java", date: "Oct 28, 2026", time: "01:00 PM", duration: 60, status: "Completed", score: "46 / 50", percentage: 92 },
  { id: "EX-009", title: "Logical Reasoning Test", subject: "Reasoning", date: "Oct 25, 2026", time: "09:00 AM", duration: 40, status: "Completed", score: "36 / 40", percentage: 90 },
  { id: "EX-010", title: "DBMS Unit Test II", subject: "DBMS", date: "Oct 22, 2026", time: "10:00 AM", duration: 60, status: "Completed", score: "51 / 60", percentage: 85 },
  { id: "EX-011", title: "Operating Systems Test", subject: "Operating Systems", date: "Oct 18, 2026", time: "02:00 PM", duration: 50, status: "Completed", score: "42 / 50", percentage: 84 },
  { id: "EX-012", title: "Aptitude Practice Exam", subject: "Aptitude", date: "Oct 14, 2026", time: "11:00 AM", duration: 45, status: "Completed", score: "40 / 45", percentage: 89 },
];

const filterTabs = ["All Exams", "Upcoming", "Completed", "Missed"];
const statusClass = {
  Upcoming: "status-upcoming",
  Completed: "status-completed",
  Missed: "status-missed",
};

function ExamDetailsModal({ exam, onClose }) {
  if (!exam) return null;
  const isUpcoming = exam.status === "Upcoming";
  const isCompleted = exam.status === "Completed";
  return (
    <div className="portal-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="portal-modal" role="dialog" aria-modal="true" aria-labelledby="exam-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="portal-modal-close" onClick={onClose} type="button" aria-label="Close"><X size={19} /></button>
        <div className="portal-modal-icon"><GraduationCap size={31} /></div>
        <span className={`portal-status ${statusClass[exam.status]}`}>{exam.status}</span>
        <h2 id="exam-modal-title">{exam.title}</h2>
        <p>{exam.subject} · {exam.id}</p>
        <div className="portal-modal-detail-grid">
          <div><CalendarDays /><span><small>Date</small><strong>{exam.date}</strong></span></div>
          <div><Clock3 /><span><small>Start time</small><strong>{exam.time}</strong></span></div>
          <div><Hourglass /><span><small>Duration</small><strong>{exam.duration} minutes</strong></span></div>
          {isCompleted && <div><Trophy /><span><small>Demo result</small><strong>{exam.score} · {exam.percentage}%</strong></span></div>}
        </div>
        {isUpcoming && <div className="portal-info-callout"><Info size={17} /> This examination is scheduled for a future date. You can review its schedule now; starting will be enabled only during the examination window.</div>}
        {isCompleted && <div className="portal-info-callout success"><CircleCheck size={17} /> This sample examination is marked as completed. Its result is illustrative demo data.</div>}
        {exam.status === "Missed" && <div className="portal-info-callout danger"><CircleAlert size={17} /> This examination is marked as missed. Starting it is not available.</div>}
        <div className="portal-modal-actions"><button className="portal-button secondary" type="button" onClick={onClose}>Close</button>{isUpcoming && <button className="portal-button primary" type="button" onClick={onClose}>View Schedule <ArrowRight size={16} /></button>}</div>
      </section>
    </div>
  );
}

export default function ExamsPage() {
  const [activeTab, setActiveTab] = useState("All Exams");
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState(null);

  const filtered = useMemo(() => exams.filter((exam) => {
    const matchesTab = activeTab === "All Exams" || exam.status === activeTab;
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || `${exam.title} ${exam.subject} ${exam.id}`.toLowerCase().includes(needle);
    return matchesTab && matchesSearch;
  }), [activeTab, search]);

  return (
    <div className="portal-page exams-page">
      <PageBanner
        icon={ClipboardList}
        eyebrow="PLAN • PREPARE • PERFORM"
        title="My"
        accent="Exams"
        description="Take your scheduled examinations and track your performance."
        art={() => <div className="banner-exam-art"><GraduationCap className="banner-cap" size={90} /><div className="banner-paper"><FileText size={54} /><i /><i /><i /></div><div className="banner-book-stack"><b /><b /><b /></div></div>}
      />

      <div className="portal-stat-grid five-columns">
        <StatCard icon={CalendarDays} value="12" label="Total Exams" tone="purple" />
        <StatCard icon={CircleCheck} value="8" label="Completed" tone="green" />
        <StatCard icon={Hourglass} value="3" label="Upcoming" tone="gold" />
        <StatCard icon={CircleAlert} value="1" label="Missed" tone="red" />
        <StatCard icon={ChartNoAxesColumnIncreasing} value="86%" label="Avg. Score" tone="cyan" />
      </div>

      <div className="portal-toolbar exams-toolbar">
        <PortalTabs items={filterTabs} value={activeTab} onChange={setActiveTab} />
        <label className="portal-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exams..." aria-label="Search exams" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}</label>
      </div>

      <GlassPanel className="exam-table-panel">
        <div className="portal-table-wrap">
          <table className="portal-table exams-table">
            <thead><tr><th>#</th><th>Exam Title</th><th>Subject</th><th>Date &amp; Time</th><th>Duration</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((exam, index) => (
                <tr key={exam.id}>
                  <td>{index + 1}</td>
                  <td><div className="table-title-cell"><span className="table-file-icon"><FileText size={18} /></span><div><strong>{exam.title}</strong><small>{exam.id}</small></div></div></td>
                  <td><span className="subject-chip">{exam.subject}</span></td>
                  <td><span className="table-date"><CalendarDays size={15} /> {exam.date}</span><small className="table-time"><Clock3 size={14} /> {exam.time}</small></td>
                  <td><span className="table-duration"><Clock3 size={15} /> {exam.duration} min</span></td>
                  <td><span className={`portal-status ${statusClass[exam.status]}`}>{exam.status}</span></td>
                  <td><button type="button" className={`portal-row-action ${exam.status === "Completed" ? "view-result" : "view-details"}`} onClick={() => setSelectedExam(exam)}>{exam.status === "Completed" ? "View Result" : exam.status === "Missed" ? "View Status" : "View Details"}</button></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="7"><EmptyState title="No exams found" description="Try another search term or choose a different filter." /></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="portal-table-foot"><span>Showing {filtered.length} of {exams.length} sample examinations</span><span className="demo-data-tag">Demo data</span></div>
      </GlassPanel>

      <ExamDetailsModal exam={selectedExam} onClose={() => setSelectedExam(null)} />
    </div>
  );
}

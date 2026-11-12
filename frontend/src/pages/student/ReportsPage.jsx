import { useState } from "react";
import {
  ChartNoAxesCombined, TrendingUp, TrendingDown, Target,
  Clock, ClipboardCheck, Download, CalendarDays,
  CheckCircle2, XCircle, ArrowUpRight, FileText, BarChart3
} from "lucide-react";

const reportData = {
  "7 Days": {
    exams: 3, accuracy: 89, score: "420", study: "4h 20m",
    trend: [48, 56, 52, 67, 62, 78, 89],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  "30 Days": {
    exams: 12, accuracy: 86, score: "1,250", study: "18h 35m",
    trend: [54, 59, 56, 64, 61, 70, 66, 76, 72, 86],
    labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "30"],
  },
  "90 Days": {
    exams: 28, accuracy: 82, score: "3,480", study: "56h 10m",
    trend: [42, 48, 46, 55, 53, 61, 58, 68, 72, 82],
    labels: ["Aug", "Sep", "Oct", "Nov"],
  },
};

const subjects = [
  { name: "Aptitude", accuracy: 80, exams: 4, color: "green" },
  { name: "Logical Reasoning", accuracy: 70, exams: 3, color: "yellow" },
  { name: "General Knowledge", accuracy: 75, exams: 2, color: "blue" },
  { name: "Computer Basics", accuracy: 60, exams: 3, color: "purple" },
];

const examHistory = [
  { name: "DBMS Internal Test", date: "Nov 10, 2026", score: "88%", result: "Passed" },
  { name: "Aptitude Practice Test", date: "Nov 08, 2026", score: "92%", result: "Passed" },
  { name: "Computer Basics Quiz", date: "Nov 06, 2026", score: "76%", result: "Passed" },
  { name: "Logical Reasoning Test", date: "Nov 04, 2026", score: "48%", result: "Failed" },
  { name: "General Knowledge Quiz", date: "Nov 02, 2026", score: "85%", result: "Passed" },
];

export default function ReportsPage() {
  const [range, setRange] = useState("30 Days");
  const current = reportData[range];
  const points = current.trend.map((value, index) => {
    const x = 35 + index * (690 / (current.trend.length - 1));
    const y = 165 - value * 1.35;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `35,165 ${points} 725,165`;

  const exportCSV = () => {
    const rows = [
      ["Exam Name", "Date", "Score", "Result"],
      ...examHistory.map((exam) => [exam.name, exam.date, exam.score, exam.result]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "champion-arena-exam-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="feature-page reports-page">
      <div className="feature-page-header">
        <div>
          <span className="feature-eyebrow">MEASURE • LEARN • IMPROVE</span>
          <h1><ChartNoAxesCombined /> My Reports</h1>
          <p>Understand your performance and track your learning progress.</p>
        </div>
        <button className="feature-export-button" onClick={exportCSV}><Download size={17} /> Export CSV</button>
      </div>

      <section className="report-period-bar">
        <div><CalendarDays /><span>Performance overview</span></div>
        <div className="report-period-options">
          {Object.keys(reportData).map((item) => (
            <button key={item} className={range === item ? "selected" : ""} onClick={() => setRange(item)}>{item}</button>
          ))}
        </div>
      </section>

      <section className="report-stat-grid">
        <article className="report-stat-card"><div className="report-stat-icon blue-summary"><ClipboardCheck /></div><div><span>Exams Attempted</span><strong>{current.exams}</strong><small>In selected period</small></div></article>
        <article className="report-stat-card"><div className="report-stat-icon green-summary"><Target /></div><div><span>Average Accuracy</span><strong>{current.accuracy}%</strong><small><TrendingUp size={13} /> Performance indicator</small></div></article>
        <article className="report-stat-card"><div className="report-stat-icon purple-summary"><BarChart3 /></div><div><span>Total Score</span><strong>{current.score}</strong><small>Points earned</small></div></article>
        <article className="report-stat-card"><div className="report-stat-icon orange-summary"><Clock /></div><div><span>Study Time</span><strong>{current.study}</strong><small>Time spent learning</small></div></article>
      </section>

      <section className="report-chart-grid">
        <article className="feature-panel accuracy-chart-panel">
          <div className="feature-panel-heading">
            <div><h2><TrendingUp /> Accuracy Trend</h2><p>Your average accuracy over time</p></div>
            <span className="chart-positive"><TrendingUp size={14} /> {current.accuracy}%</span>
          </div>
          <div className="line-chart-wrap">
            <div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
            <svg className="accuracy-line-chart" viewBox="0 0 760 190" preserveAspectRatio="none" role="img" aria-label="Accuracy trend chart">
              {[30, 64, 98, 132, 165].map((y) => <line key={y} x1="35" y1={y} x2="725" y2={y} className="chart-grid-line" />)}
              <polygon points={areaPoints} className="chart-area" />
              <polyline points={points} className="chart-line" />
              {current.trend.map((value, index) => {
                const x = 35 + index * (690 / (current.trend.length - 1));
                const y = 165 - value * 1.35;
                return <circle key={index} cx={x} cy={y} r="4.5" className="chart-point" />;
              })}
            </svg>
            <div className="chart-x-labels">{current.labels.map((label) => <span key={label}>{label}</span>)}</div>
          </div>
        </article>

        <article className="feature-panel subject-report-panel">
          <div className="feature-panel-heading"><div><h2><Target /> Subject Analysis</h2><p>Accuracy by subject</p></div></div>
          <div className="subject-report-list">
            {subjects.map((subject) => (
              <div className="subject-report-item" key={subject.name}>
                <div className="subject-report-label"><strong>{subject.name}</strong><span>{subject.accuracy}%</span></div>
                <div className="subject-report-track"><span className={subject.color} style={{ width: `${subject.accuracy}%` }} /></div>
                <small>{subject.exams} exams attempted</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="feature-panel report-history-panel">
        <div className="feature-panel-heading">
          <div><h2><FileText /> Recent Exam History</h2><p>Your latest exam results and scores.</p></div>
          <button className="report-view-all" onClick={exportCSV}>Download report <ArrowUpRight size={16} /></button>
        </div>
        <div className="ranking-table-wrap">
          <table className="ranking-table report-history-table">
            <thead><tr><th>Exam</th><th>Date</th><th>Score</th><th>Result</th></tr></thead>
            <tbody>
              {examHistory.map((exam) => (
                <tr key={exam.name}>
                  <td><div className="report-exam-name"><span><FileText size={17} /></span><strong>{exam.name}</strong></div></td>
                  <td>{exam.date}</td>
                  <td><strong>{exam.score}</strong></td>
                  <td>{exam.result === "Passed" ? <span className="result-passed"><CheckCircle2 size={15} /> Passed</span> : <span className="result-failed"><XCircle size={15} /> Failed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

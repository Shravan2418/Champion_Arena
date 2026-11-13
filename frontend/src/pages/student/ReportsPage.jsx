import {
  ChartNoAxesCombined,
  Target,
  Trophy,
  ClipboardCheck,
  Flame,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Clock3,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageBanner, StatCard, GlassPanel, ProgressBar } from "../../components/student/PortalUI";

const performanceTrend = [
  { month: "Jun", value: 20 },
  { month: "Jul", value: 46 },
  { month: "Aug", value: 48 },
  { month: "Sep", value: 68 },
  { month: "Oct", value: 63 },
  { month: "Nov", value: 86 },
];

const subjects = [
  { name: "DBMS", value: 92 },
  { name: "Operating Systems", value: 88 },
  { name: "Computer Networks", value: 84 },
  { name: "Data Structures", value: 80 },
  { name: "Aptitude", value: 86 },
];

const recentAttempts = [
  { type: "Exam", title: "DBMS Internal Test", accuracy: 90, score: "54 / 60" },
  { type: "Quiz", title: "Operating Systems Quiz", accuracy: 88, score: "44 / 50" },
  { type: "Quiz", title: "Aptitude Practice Quiz", accuracy: 84, score: "42 / 50" },
  { type: "Exam", title: "Computer Networks Exam", accuracy: 82, score: "49 / 60" },
];

function TrendChart() {
  const width = 650;
  const height = 190;
  const xStart = 24;
  const xEnd = 625;
  const yBottom = 160;
  const yTop = 15;
  const points = performanceTrend.map((point, index) => {
    const x = xStart + (xEnd - xStart) * (index / (performanceTrend.length - 1));
    const y = yBottom - (point.value / 100) * (yBottom - yTop);
    return { ...point, x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${xStart},${yBottom} ${polyline} ${xEnd},${yBottom}`;

  return (
    <div className="performance-chart-wrap">
      <div className="performance-y-labels"><span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span></div>
      <svg className="performance-line-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Sample accuracy trend from June to November">
        <defs><linearGradient id="performanceAreaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d43cff" stopOpacity=".42" /><stop offset="1" stopColor="#7a20ef" stopOpacity=".02" /></linearGradient></defs>
        {[15, 44, 73, 102, 131, 160].map((y) => <line key={y} x1={xStart} x2={xEnd} y1={y} y2={y} className="performance-grid-line" />)}
        <polygon points={area} fill="url(#performanceAreaFill)" />
        <polyline points={polyline} className="performance-trend-line" />
        {points.map((point) => <circle key={point.month} cx={point.x} cy={point.y} r="5" className="performance-trend-point" />)}
        <g className="performance-last-value"><rect x={points.at(-1).x - 28} y={points.at(-1).y - 33} width="56" height="24" rx="9" /><text x={points.at(-1).x} y={points.at(-1).y - 17}>86%</text></g>
      </svg>
      <div className="performance-x-labels">{performanceTrend.map((point) => <span key={point.month}>{point.month}</span>)}</div>
    </div>
  );
}

export default function ReportsPage({ onNavigate }) {
  return (
    <div className="portal-page performance-page">
      <PageBanner
        icon={ChartNoAxesCombined}
        eyebrow="ANALYZE • UNDERSTAND • IMPROVE"
        title="My"
        accent="Performance"
        description="Analyze your progress, identify strengths, and improve further!"
        art={() => <div className="banner-performance-art"><div className="performance-target"><Target size={84} /><span /></div><div className="performance-book-stack"><i /><i /><i /></div></div>}
      />

      <div className="portal-stat-grid five-columns">
        <StatCard icon={Target} value="86%" label="Overall Accuracy" tone="purple" />
        <StatCard icon={ChartNoAxesCombined} value="1,250" label="Total Score" tone="green" />
        <StatCard icon={Trophy} value="12" label="Exams Taken" tone="gold" />
        <StatCard icon={ClipboardCheck} value="20" label="Quizzes Taken" tone="cyan" />
        <StatCard icon={Flame} value="7 Days" label="Current Streak" tone="red" />
      </div>

      <div className="performance-main-grid">
        <GlassPanel title="Performance Overview" icon={ChartNoAxesCombined} className="performance-overview-panel">
          <TrendChart />
        </GlassPanel>
        <GlassPanel title="Subject-wise Performance" icon={BookOpen} className="subject-performance-panel">
          <div className="subject-performance-list">
            {subjects.map((subject) => <div className="subject-performance-row" key={subject.name}><div><strong>{subject.name}</strong><b>{subject.value}%</b></div><ProgressBar value={subject.value} tone="purple" /></div>)}
          </div>
        </GlassPanel>
        <GlassPanel title="Performance Breakdown" icon={BookOpen} className="performance-breakdown-panel">
          <div className="performance-breakdown-content"><div className="performance-donut"><div><strong>86%</strong><span>Overall</span></div></div><div className="performance-legend"><span><i className="legend-dot correct" />Correct <b>86%</b></span><span><i className="legend-dot incorrect" />Incorrect <b>14%</b></span></div></div>
          <small className="performance-disclaimer">Illustrative breakdown for the sample dashboard.</small>
        </GlassPanel>
      </div>

      <div className="performance-bottom-grid">
        <GlassPanel title="Recent Attempts" icon={Clock3} className="recent-attempts-panel" action={<button type="button" className="portal-text-action" onClick={() => onNavigate?.("Exams")}>View All <ArrowRight size={15} /></button>}>
          <div className="portal-table-wrap"><table className="portal-table attempts-table"><thead><tr><th>Type</th><th>Title</th><th>Accuracy</th><th>Score</th></tr></thead><tbody>{recentAttempts.map((attempt) => <tr key={attempt.title}><td><span className={`attempt-type ${attempt.type.toLowerCase()}`}>{attempt.type === "Exam" ? <FileText size={14} /> : <ClipboardCheck size={14} />}{attempt.type}</span></td><td><strong>{attempt.title}</strong></td><td><span className="attempt-accuracy">{attempt.accuracy}%</span></td><td><strong>{attempt.score}</strong></td></tr>)}</tbody></table></div>
          <span className="portal-panel-foot-note">Sample attempt history · Not connected to stored results</span>
        </GlassPanel>

        <GlassPanel title="Improvement Insights" icon={Lightbulb} className="improvement-insights-panel">
          <div className="insight-item positive"><span><TrendingUp size={23} /></span><div><strong>Great Progress!</strong><p>Your sample accuracy trend rises to 86% in November.</p></div></div>
          <div className="insight-item focus"><span><Target size={23} /></span><div><strong>Focus on Data Structures</strong><p>It is the lowest-scoring subject in this sample set at 80%.</p></div></div>
          <div className="insight-item consistency"><span><Flame size={23} /></span><div><strong>Keep the Streak Going!</strong><p>Continue a regular practice routine to build consistency.</p></div></div>
          <small className="performance-disclaimer"><Sparkles size={13} /> Rule-based sample insights, not AI-generated or personalized.</small>
        </GlassPanel>
      </div>
    </div>
  );
}

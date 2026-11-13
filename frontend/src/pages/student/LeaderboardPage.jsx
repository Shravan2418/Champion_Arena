import { useMemo, useState } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Target,
  ChartNoAxesColumnIncreasing,
  Star,
  Flame,
  BookOpen,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { PageBanner, StatCard, GlassPanel, PortalTabs } from "../../components/student/PortalUI";

const students = [
  { id: "st-01", name: "Ananya R.", xp: 3820, exams: 940, quizzes: 1620, practice: 1260, accuracy: 94, level: "Platinum", avatar: "A" },
  { id: "st-02", name: "Karthik M.", xp: 3650, exams: 910, quizzes: 1530, practice: 1210, accuracy: 92, level: "Gold", avatar: "K" },
  { id: "st-03", name: "Vishnu S.", xp: 3510, exams: 890, quizzes: 1480, practice: 1140, accuracy: 90, level: "Gold", avatar: "V" },
  { id: "st-04", name: "Priya D.", xp: 3420, exams: 880, quizzes: 1420, practice: 1120, accuracy: 89, level: "Silver", avatar: "P" },
  { id: "st-05", name: "Rohit K.", xp: 3360, exams: 860, quizzes: 1400, practice: 1100, accuracy: 88, level: "Silver", avatar: "R" },
  { id: "st-06", name: "Sneha P.", xp: 3350, exams: 850, quizzes: 1390, practice: 1110, accuracy: 88, level: "Silver", avatar: "S" },
  { id: "st-07", name: "Megha T.", xp: 3320, exams: 840, quizzes: 1380, practice: 1100, accuracy: 87, level: "Gold", avatar: "M" },
  { id: "st-08", name: "Shravan", xp: 3300, exams: 820, quizzes: 1370, practice: 1110, accuracy: 86, level: "Gold", avatar: "S", isYou: true },
];

const rankTabs = [
  { label: "Overall", icon: Trophy },
  { label: "Exams", icon: FileText },
  { label: "Quizzes", icon: ClipboardCheck },
  { label: "Practice", icon: BookOpen },
];
const scoreKeyByTab = { Overall: "xp", Exams: "exams", Quizzes: "quizzes", Practice: "practice" };
const formatXP = (score) => `${Number(score).toLocaleString("en-IN")} XP`;

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("Overall");
  const scoreKey = scoreKeyByTab[activeTab];
  const fullRankings = useMemo(
    () => students
      .map((student) => ({ ...student, score: student[scoreKey] }))
      .sort((a, b) => b.score - a.score)
      .map((student, index) => ({ ...student, rank: index + 1 })),
    [scoreKey],
  );
  const currentRank = fullRankings.find((student) => student.isYou)?.rank ?? 0;
  const podium = fullRankings.slice(0, 3);
  const topFive = fullRankings.filter((student) => student.rank <= 5 && !student.isYou);
  const ownRow = fullRankings.find((student) => student.isYou);

  return (
    <div className="portal-page leaderboard-page">
      <PageBanner
        icon={Trophy}
        eyebrow="COMPETE • EARN • CLIMB"
        title="Leaderboard"
        description="Compete, earn points, and climb to the top!"
        art={() => <div className="banner-podium-art"><div className="podium-step second"><Medal size={36} /><b>2</b></div><div className="podium-step first"><Crown size={43} /><Trophy size={68} /><b>1</b></div><div className="podium-step third"><Medal size={33} /><b>3</b></div></div>}
      />

      <div className="portal-stat-grid four-columns">
        <StatCard icon={Crown} value={`#${currentRank}`} label="Your Rank" tone="gold" />
        <StatCard icon={ChartNoAxesColumnIncreasing} value="3,300 XP" label="Your Score" tone="cyan" />
        <StatCard icon={Target} value="256" label="Total Participants" tone="purple" />
        <StatCard icon={Medal} value="Gold · Level 4" label="Your Level" tone="green" />
      </div>

      <div className="leaderboard-layout">
        <GlassPanel className="leaderboard-table-panel">
          <PortalTabs items={rankTabs} value={activeTab} onChange={setActiveTab} className="leaderboard-category-tabs" />
          <div className="portal-table-wrap">
            <table className="portal-table leaderboard-table">
              <thead><tr><th>Rank</th><th>Student</th><th>Level</th><th>Total XP</th></tr></thead>
              <tbody>
                {topFive.map((student) => <LeaderboardRow key={student.id} student={student} />)}
              </tbody>
            </table>
          </div>
          <div className="current-rank-separator"><span>Your current position</span></div>
          <div className="portal-table-wrap current-rank-table">
            <table className="portal-table leaderboard-table"><tbody><LeaderboardRow student={ownRow} current /></tbody></table>
          </div>
          <div className="portal-panel-foot"><span className="demo-data-tag">Illustrative leaderboard</span><span>Showing top performers and your actual sample position</span></div>
        </GlassPanel>

        <div className="leaderboard-side-column">
          <GlassPanel title="Top 3 Champions" icon={Trophy} className="top-champions-panel">
            <div className="champion-podium-list">
              {[podium[1], podium[0], podium[2]].filter(Boolean).map((student) => <div className={`champion-podium-person place-${student.rank}`} key={student.id}>
                {student.rank === 1 && <Crown className="champion-crown" size={25} />}
                <div className={`champion-avatar place-avatar-${student.rank}`}>{student.avatar}</div>
                <strong>{student.name}</strong>
                <span>{formatXP(student.score)}</span>
                <div className={`champion-platform platform-${student.rank}`}><b>{student.rank}</b></div>
              </div>)}
            </div>
          </GlassPanel>
          <GlassPanel title="Leaderboard Stats" icon={Trophy} className="leaderboard-stats-panel">
            <div className="leaderboard-stat-mini-grid">
              <div><Target /><strong>256</strong><span>Participants</span></div>
              <div><ChartNoAxesColumnIncreasing /><strong>3,820 XP</strong><span>Highest Score</span></div>
              <div><Star /><strong>3,300 XP</strong><span>Your Score</span></div>
              <div><Flame /><strong>86%</strong><span>Avg. Accuracy</span></div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ student, current = false }) {
  if (!student) return null;
  const RankIcon = student.rank === 1 ? Trophy : Medal;
  return (
    <tr className={current || student.isYou ? "current-student-row" : ""}>
      <td><span className={`leaderboard-rank-mark rank-position-${student.rank}`}>{student.rank <= 3 ? <RankIcon size={20} /> : student.rank}</span></td>
      <td><div className="leaderboard-student-cell"><span className={`leaderboard-avatar ${student.isYou ? "you-avatar" : ""}`}>{student.avatar}</span><strong>{student.isYou ? "You (Shravan)" : student.name}</strong></div></td>
      <td><span className={`level-pill ${student.level.toLowerCase()}`}>{student.level}</span></td>
      <td><strong>{formatXP(student.score)}</strong></td>
    </tr>
  );
}

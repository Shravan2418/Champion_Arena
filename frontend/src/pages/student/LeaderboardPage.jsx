import { useMemo, useState } from "react";
import {
  Trophy, Crown, Medal, TrendingUp, Users, Search,
  Flame, Target, ArrowUpRight, ChevronRight, Star
} from "lucide-react";

const players = [
  { name: "Ananya R.", college: true, friend: false, points: 3820, monthly: 1120, weekly: 410, accuracy: 94, streak: 12, avatar: "A" },
  { name: "Karthik M.", college: true, friend: true, points: 3650, monthly: 1050, weekly: 390, accuracy: 92, streak: 9, avatar: "K" },
  { name: "Vishnu S.", college: true, friend: true, points: 3510, monthly: 990, weekly: 370, accuracy: 90, streak: 8, avatar: "V" },
  { name: "Shravan", college: true, friend: true, points: 3300, monthly: 930, weekly: 345, accuracy: 86, streak: 7, avatar: "S", isYou: true },
  { name: "Priya D.", college: true, friend: true, points: 3280, monthly: 910, weekly: 338, accuracy: 85, streak: 6, avatar: "P" },
  { name: "Rahul K.", college: true, friend: false, points: 3150, monthly: 880, weekly: 320, accuracy: 84, streak: 5, avatar: "R" },
  { name: "Meena P.", college: true, friend: false, points: 2980, monthly: 840, weekly: 305, accuracy: 82, streak: 4, avatar: "M" },
  { name: "Arjun V.", college: false, friend: false, points: 2890, monthly: 810, weekly: 290, accuracy: 80, streak: 3, avatar: "A" },
  { name: "Sneha R.", college: false, friend: false, points: 2740, monthly: 760, weekly: 275, accuracy: 78, streak: 4, avatar: "S" },
  { name: "Deepak N.", college: false, friend: false, points: 2650, monthly: 720, weekly: 260, accuracy: 76, streak: 2, avatar: "D" },
];

const formatPoints = (value) => value.toLocaleString("en-IN");

export default function LeaderboardPage() {
  const [scope, setScope] = useState("Global");
  const [period, setPeriod] = useState("All Time");
  const [search, setSearch] = useState("");

  const scoreKey = period === "Weekly"
    ? "weekly"
    : period === "Monthly"
      ? "monthly"
      : "points";

  const rankings = useMemo(() => {
    return players
      .filter((p) => {
        const scopeMatch =
          scope === "Global" ||
          (scope === "College" && p.college) ||
          (scope === "Friends" && (p.friend || p.isYou));

        return scopeMatch && p.name.toLowerCase().includes(search.toLowerCase());
      })
      .map((p) => ({ ...p, score: p[scoreKey] }))
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({ ...p, rank: index + 1 }));
  }, [scope, period, scoreKey, search]);

  const you = rankings.find((p) => p.isYou);
  const nextPlayer = you ? rankings.find((p) => p.rank === you.rank - 1) : null;
  const pointsNeeded = nextPlayer ? nextPlayer.score - you.score : 0;
  const podium = [rankings[1], rankings[0], rankings[2]].filter(Boolean);

  return (
    <div className="feature-page leaderboard-page">
      <div className="feature-page-header">
        <div>
          <span className="feature-eyebrow">COMPETE • IMPROVE • ACHIEVE</span>
          <h1><Trophy /> Leaderboard</h1>
          <p>See where you stand and challenge yourself to reach the top.</p>
        </div>
        <div className="feature-header-icon leaderboard-header-icon"><Trophy /></div>
      </div>

      <section className="rank-summary-grid">
        <article className="rank-summary-card primary-rank-card">
          <div className="summary-label">YOUR CURRENT RANK</div>
          <div className="rank-summary-value">#{you?.rank ?? "—"}</div>
          <div className="summary-foot"><TrendingUp size={16} /> Keep climbing the leaderboard</div>
        </article>
        <article className="rank-summary-card">
          <div className="summary-icon blue-summary"><Trophy /></div>
          <div><span className="summary-label">TOTAL POINTS</span><strong>{formatPoints(you?.score ?? 0)}</strong><small>Accumulated points</small></div>
        </article>
        <article className="rank-summary-card">
          <div className="summary-icon green-summary"><Target /></div>
          <div><span className="summary-label">YOUR ACCURACY</span><strong>{you?.accuracy ?? 0}%</strong><small>Across attempted exams</small></div>
        </article>
        <article className="rank-summary-card">
          <div className="summary-icon orange-summary"><Flame /></div>
          <div><span className="summary-label">CURRENT STREAK</span><strong>{you?.streak ?? 0} Days</strong><small>Keep your streak alive</small></div>
        </article>
      </section>

      <section className="feature-panel leaderboard-main-panel">
        <div className="feature-panel-heading leaderboard-controls">
          <div>
            <h2><Crown /> Top Performers</h2>
            <p>Celebrate the students leading the competition.</p>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Ranking period">
            <option>All Time</option>
            <option>Monthly</option>
            <option>Weekly</option>
          </select>
        </div>

        <div className="scope-tabs">
          {["Global", "College", "Friends"].map((item) => (
            <button key={item} className={scope === item ? "selected" : ""} onClick={() => setScope(item)}>
              {item === "Global" ? <Trophy size={16} /> : item === "College" ? <Medal size={16} /> : <Users size={16} />}
              {item}
            </button>
          ))}
        </div>

        <div className="leaderboard-podium">
          {podium.map((player) => (
            <div className={`podium-person podium-rank-${player.rank}`} key={player.name}>
              <div className={`podium-avatar podium-avatar-${player.rank}`}>{player.avatar}</div>
              {player.rank === 1 && <Crown className="podium-crown" size={25} />}
              <strong>{player.isYou ? "You" : player.name}</strong>
              <span>{formatPoints(player.score)} pts</span>
              <div className={`podium-block podium-block-${player.rank}`}>
                <b>{player.rank}</b>
                <small>{player.rank === 1 ? "CHAMPION" : player.rank === 2 ? "RUNNER UP" : "TOP 3"}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="leaderboard-table-heading">
          <h3>Rankings</h3>
          <label className="leader-search">
            <Search size={17} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." />
          </label>
        </div>

        <div className="ranking-table-wrap">
          <table className="ranking-table">
            <thead>
              <tr><th>Rank</th><th>Student</th><th>Points</th><th>Accuracy</th><th>Streak</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rankings.map((player) => (
                <tr key={player.name} className={player.isYou ? "you-ranking-row" : ""}>
                  <td><span className={`rank-number ${player.rank <= 3 ? `top-rank-${player.rank}` : ""}`}>{player.rank <= 3 ? <Medal size={19} /> : player.rank}</span></td>
                  <td><div className="ranking-student"><span className="ranking-avatar">{player.avatar}</span><strong>{player.isYou ? "You (Shravan)" : player.name}</strong></div></td>
                  <td><strong>{formatPoints(player.score)}</strong></td>
                  <td><span className="accuracy-pill">{player.accuracy}%</span></td>
                  <td><span className="streak-cell"><Flame size={15} /> {player.streak} days</span></td>
                  <td>{player.isYou ? <span className="you-label">YOU</span> : <span className="rank-status">Active</span>}</td>
                </tr>
              ))}
              {rankings.length === 0 && <tr><td colSpan="6" className="empty-table">No students match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="next-rank-card">
        <div className="next-rank-icon"><Star /></div>
        <div>
          <strong>{nextPlayer ? `${formatPoints(pointsNeeded)} more points to reach rank #${you.rank - 1}` : "You're at the top!"}</strong>
          <p>{nextPlayer ? `You're getting closer to ${nextPlayer.name}. Keep practicing and move up!` : "Keep up your excellent performance."}</p>
        </div>
        <ArrowUpRight className="next-rank-arrow" />
      </section>
    </div>
  );
}

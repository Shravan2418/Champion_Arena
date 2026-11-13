// DEMO PREVIEW DATA ONLY.
// The supplied backend currently exposes authentication but no student dashboard
// statistics, leaderboard, upcoming-exams or badge-summary endpoint. Keep this
// data visibly labelled as sample data until those endpoints are implemented.
export const studentDashboardDemo = {
  stats: [
    { value: "12", label: "Exams Taken", kind: "exams" },
    { value: "86%", label: "Avg. Accuracy", kind: "accuracy" },
    { value: "1,250", label: "Total Score", kind: "score" },
    { value: "7", label: "Day Streak", kind: "streak" },
  ],
  xp: { tier: "Gold", level: 4, earned: 2350, nextLevel: 3000 },
  progress: {
    accuracy: 86,
    rows: [
      { label: "Exams", value: "8 / 10", percent: 80, kind: "exam" },
      { label: "Quizzes", value: "14 / 16", percent: 87.5, kind: "quiz" },
      { label: "Practice", value: "45 / 50", percent: 90, kind: "practice" },
    ],
  },
  badges: [
    { name: "Silver", detail: "Accuracy", kind: "silver" },
    { name: "Gold", detail: "Performance", kind: "gold" },
    { name: "Streak", detail: "7 Days", kind: "streak" },
  ],
  leaders: [
    { rank: 1, name: "Ananya R.", points: 3820, initials: "A" },
    { rank: 2, name: "Karthik M.", points: 3650, initials: "K" },
    { rank: 3, name: "Vishnu S.", points: 3510, initials: "V" },
    { rank: 4, name: "Priya D.", points: 3420, initials: "P" },
    { rank: 5, name: "Rahul K.", points: 3380, initials: "R" },
  ],
  currentStudent: { rank: 6, points: 3300 },
  upcomingExams: [
    { id: "demo-dbms", name: "DBMS Internal Test", date: "Nov 15", time: "10:00 AM", duration: 45, subject: "Database Management Systems" },
    { id: "demo-os", name: "Operating Systems Quiz", date: "Nov 17", time: "2:00 PM", duration: 30, subject: "Operating Systems" },
    { id: "demo-aptitude", name: "Aptitude Test", date: "Nov 20", time: "11:00 AM", duration: 45, subject: "Aptitude" },
  ],
};

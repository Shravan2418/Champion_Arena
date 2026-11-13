import { useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  PlayCircle,
  CircleHelp,
  BookMarked,
  Search,
  Database,
  Monitor,
  Network,
  Code2,
  Brain,
  FileQuestion,
  Download,
  Play,
  Clock3,
  Eye,
  Layers,
  X,
} from "lucide-react";
import { PageBanner, StatCard, GlassPanel, PortalTabs, EmptyState } from "../../components/student/PortalUI";

const resourceSubjects = [
  { name: "DBMS", count: 18, icon: Database, color: "violet" },
  { name: "Operating Systems", count: 16, icon: Monitor, color: "cyan" },
  { name: "Computer Networks", count: 14, icon: Network, color: "blue" },
  { name: "Data Structures", count: 20, icon: Code2, color: "pink" },
  { name: "Aptitude", count: 12, icon: Brain, color: "purple" },
  { name: "Reasoning", count: 10, icon: Brain, color: "gold" },
  { name: "Python", count: 15, icon: Code2, color: "blue" },
  { name: "Java", count: 15, icon: Code2, color: "orange" },
];

const resourceItems = [
  { id: "r1", title: "DBMS Complete Notes (Unit-wise)", subject: "DBMS", type: "Notes", meta: "PDF · 5.2 MB", action: "Download", icon: FileText, color: "pdf" },
  { id: "r2", title: "Operating Systems - Full Lecture", subject: "Operating Systems", type: "Videos", meta: "Video · 42 min", action: "Watch", icon: PlayCircle, color: "video" },
  { id: "r3", title: "Aptitude Practice Set - 50 Questions", subject: "Aptitude", type: "Practice Sets", meta: "Practice Set · 1.1 MB", action: "Download", icon: FileQuestion, color: "doc" },
  { id: "r4", title: "Computer Networks Previous Paper", subject: "Computer Networks", type: "Question Papers", meta: "PDF · 2.8 MB", action: "Download", icon: FileText, color: "pdf" },
  { id: "r5", title: "Data Structures Quick Reference", subject: "Data Structures", type: "E-Books", meta: "E-Book · 3.4 MB", action: "Download", icon: BookMarked, color: "doc" },
  { id: "r6", title: "Java Programming Concepts", subject: "Java", type: "Videos", meta: "Video · 36 min", action: "Watch", icon: PlayCircle, color: "video" },
];

const tabs = ["All Resources", "Notes", "Videos", "Question Papers", "Practice Sets", "E-Books"];

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("All Resources");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");

  const filtered = useMemo(() => resourceItems.filter((item) => {
    const matchesType = activeTab === "All Resources" || item.type === activeTab;
    const matchesSubject = subject === "All Subjects" || item.subject === subject;
    const matchesSearch = `${item.title} ${item.subject} ${item.type}`.toLowerCase().includes(search.trim().toLowerCase());
    return matchesType && matchesSubject && matchesSearch;
  }), [activeTab, subject, search]);

  return (
    <div className="portal-page resources-page">
      <PageBanner
        icon={BookOpen}
        eyebrow="READ • WATCH • PRACTICE"
        title="Study"
        accent="Resources"
        description="Access study materials, notes, question papers and more to boost your preparation!"
        art={() => <div className="banner-resources-art"><div className="resource-book book-back" /><div className="resource-book book-front" /><div className="resource-open-book"><BookOpen size={74} /></div><span>✦</span></div>}
      />

      <div className="portal-stat-grid four-columns">
        <StatCard icon={FileText} value="120+" label="Study Materials" tone="purple" />
        <StatCard icon={PlayCircle} value="85+" label="Video Lectures" tone="green" />
        <StatCard icon={CircleHelp} value="50+" label="Practice Sets" tone="cyan" />
        <StatCard icon={BookMarked} value="30+" label="Previous Papers" tone="gold" />
      </div>

      <div className="portal-toolbar resources-toolbar">
        <PortalTabs items={tabs} value={activeTab} onChange={setActiveTab} />
        <label className="portal-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources..." aria-label="Search resources" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}</label>
      </div>

      <div className="resources-main-grid">
        <GlassPanel title="Subject Resources" icon={BookOpen} className="subject-resources-panel" action={<button type="button" className="portal-text-action" onClick={() => { setSubject("All Subjects"); setActiveTab("All Resources"); }}>View All →</button>}>
          <div className="subject-resource-grid">
            {resourceSubjects.map((item) => {
              const Icon = item.icon;
              return <button type="button" key={item.name} className={`subject-resource-card ${subject === item.name ? "selected" : ""}`} onClick={() => setSubject(subject === item.name ? "All Subjects" : item.name)}><span className={`subject-resource-icon ${item.color}`}><Icon size={31} /></span><strong>{item.name}</strong><small>{item.count} Resources</small></button>;
            })}
          </div>
        </GlassPanel>

        <GlassPanel title="Recommended for You" icon={Layers} className="recommended-resources-panel">
          <div className="recommended-resource-list">
            {filtered.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return <div className="recommended-resource-row" key={item.id}><span className={`resource-file-type ${item.color}`}><Icon size={27} /></span><div className="recommended-resource-copy"><strong>{item.title}</strong><small>{item.meta}</small></div><button type="button" className="resource-action-disabled" disabled title="No resource file is attached in the uploaded frontend"><Download size={15} /> {item.action}</button></div>;
            })}
            {filtered.length === 0 && <EmptyState title="No matching resources" description="Change the selected category or search term." />}
          </div>
          <small className="resource-unavailable-note">Download and watch actions will activate when real resource files or URLs are supplied.</small>
        </GlassPanel>
      </div>

      <div className="resources-bottom-grid">
        <GlassPanel title="Your Resource Usage" icon={Eye} className="resource-usage-panel">
          <div className="resource-usage-content"><div className="resource-usage-donut"><div><strong>72%</strong><span>Utilization</span></div></div><div className="resource-usage-legend"><span><i className="usage-dot notes" />Study Notes <b>45%</b></span><span><i className="usage-dot videos" />Video Lectures <b>25%</b></span><span><i className="usage-dot practice" />Practice Sets <b>20%</b></span><span><i className="usage-dot others" />Others <b>10%</b></span></div></div>
          <small className="resource-unavailable-note">Illustrative usage mix; no access analytics are available in this frontend package.</small>
        </GlassPanel>

        <GlassPanel title="Recently Accessed" icon={Clock3} className="recent-resources-panel" action={<span className="demo-data-tag">Sample history</span>}>
          <div className="recent-resource-list">
            <div><span className="resource-file-type pdf"><FileText size={26} /></span><section><strong>DBMS ER Diagrams.pdf</strong><small>Accessed 2 hours ago</small></section></div>
            <div><span className="resource-file-type video"><Play size={25} /></span><section><strong>OS Scheduling.mp4</strong><small>Accessed 5 hours ago</small></section></div>
            <div><span className="resource-file-type doc"><FileText size={26} /></span><section><strong>CN Practice Set.docx</strong><small>Accessed 1 day ago</small></section></div>
          </div>
        </GlassPanel>
      </div>
      <div className="portal-page-note"><span className="demo-data-tag">Sample resource catalogue</span><span>Counts, recommended materials and recent activity are illustrative until connected to real resource records.</span></div>
    </div>
  );
}


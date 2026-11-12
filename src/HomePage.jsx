import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import {
  Home, Target, FileText, Trophy, Star, Info, Menu, X, ArrowRight,
  BrainCircuit, ClipboardCheck, ChartNoAxesCombined, Award, UserRoundPlus,
  NotebookPen, Medal, Check, Zap, Flame, PlayCircle, ShieldCheck,
  ChevronRight, Sparkles, Youtube, Instagram, Github, Linkedin, GraduationCap
} from "lucide-react";
import "./home.css";

const logo = "/images/champion-arena-logo.png";

const navItems = [
  { label: "Home", href: "#home", icon: Home, active: true },
  { label: "Practice", href: "#features", icon: Target },
  { label: "Exams", href: "#journey", icon: FileText },
  { label: "Leaderboard", href: "#rewards", icon: Trophy },
  { label: "Achievements", href: "#achievements", icon: Star },
  { label: "About", href: "#about", icon: Info },
];

const features = [
  {
    title: "Practice Quizzes",
    description: "Improve your knowledge through interactive MCQ quizzes with instant feedback.",
    icon: BrainCircuit,
    tone: "violet",
  },
  {
    title: "University Exams",
    description: "Attempt scheduled and institution-based examinations with timed assessments.",
    icon: ClipboardCheck,
    tone: "gold",
  },
  {
    title: "Track Progress",
    description: "Monitor scores, accuracy, performance and improvement over time.",
    icon: ChartNoAxesCombined,
    tone: "mint",
  },
  {
    title: "Rewards & Achievements",
    description: "Earn XP, unlock badges and compete on student leaderboards.",
    icon: Trophy,
    tone: "amber",
  },
];

const journey = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Register as a student and enter your learning arena.",
    icon: UserRoundPlus,
  },
  {
    number: "02",
    title: "Practice & Attempt Exams",
    description: "Choose quizzes or examinations and test your knowledge.",
    icon: NotebookPen,
  },
  {
    number: "03",
    title: "Earn & Achieve",
    description: "Collect XP, unlock achievements and improve your rankings.",
    icon: Medal,
  },
];

const rise = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] } },
};

function SectionHeading({ eyebrow, title, highlight, subtitle }) {
  return (
    <motion.div
      className="home-section-heading"
      variants={rise}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2>{title} <em>{highlight}</em></h2>
      {subtitle && <p>{subtitle}</p>}
    </motion.div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="arena-navbar">
      <div className="arena-nav-inner">
        <Link to="/" className="arena-brand" aria-label="Champion Arena home" onClick={closeMenu}>
          <img src={logo} alt="Champion Arena" />
        </Link>

        <span className="nav-divider" aria-hidden="true" />

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={`arena-nav-links ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navItems.map(({ label, href, icon: Icon, active }) => (
            <a
              key={label}
              href={href}
              className={`arena-nav-link ${active ? "is-active" : ""}`}
              onClick={closeMenu}
            >
              <Icon size={17} strokeWidth={2.2} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="arena-nav-actions">
          <button className="arena-login-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="arena-join-btn" onClick={() => navigate("/register")}>
            Join the Arena
          </button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const artRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !artRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".home-hero-art",
        { opacity: 0, x: 34, scale: 0.97 },
        { opacity: 1, x: 0, scale: 1, duration: 1.05, ease: "power3.out", delay: 0.12 }
      );
      gsap.to(".hero-float-spark", {
        y: -9,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.35,
      });
    }, artRef);
    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section className="arena-hero" id="home">
      <div className="hero-starfield" aria-hidden="true" />
      <div className="hero-purple-glow" aria-hidden="true" />
      <div className="arena-hero-inner">
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.11 } } }}
        >
          <motion.p className="hero-kicker" variants={rise}>WELCOME TO YOUR LEARNING ARENA</motion.p>
          <motion.h1 variants={rise}>
            Practice. Compete.<br />
            Become a <span>Champion.</span>
          </motion.h1>
          <motion.p className="hero-description" variants={rise}>
            Prepare smarter, challenge yourself and celebrate<br className="wide-break" />
            every improvement with interactive quizzes and<br className="wide-break" />
            university examinations.
          </motion.p>

          <motion.ul className="hero-benefits" variants={rise}>
            <li><span><Check size={14} /></span>Take practice quizzes and examinations</li>
            <li><span><Check size={14} /></span>Track scores and learning progress</li>
            <li><span><Check size={14} /></span>Earn XP, levels and achievement badges</li>
            <li><span><Check size={14} /></span>Compete with students on leaderboards</li>
          </motion.ul>

          <motion.div className="hero-actions" variants={rise}>
            <button className="hero-primary-btn" onClick={() => navigate("/register")}>
              Get Started <ArrowRight size={19} />
            </button>
            <a className="hero-secondary-btn" href="#features">
              Explore Features
            </a>
          </motion.div>
        </motion.div>

        <div className="hero-art-wrap" ref={artRef} aria-label="Students celebrating learning achievements">
          <span className="hero-float-spark spark-one" aria-hidden="true">✦</span>
          <span className="hero-float-spark spark-two" aria-hidden="true">✧</span>
          <span className="hero-float-spark spark-three" aria-hidden="true">✦</span>
          <div className="hero-art-halo" aria-hidden="true" />
          <img className="home-hero-art" src="/images/home-hero-art.png" alt="Two students studying together with a laptop and a golden champion trophy" />
        </div>
      </div>

      <svg className="hero-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,42 C145,5 205,90 365,68 C535,45 585,30 745,55 C895,82 1000,74 1145,32 C1275,-4 1355,12 1440,28 L1440,90 L0,90 Z" fill="#0b0d31" />
        <path d="M0,42 C145,5 205,90 365,68 C535,45 585,30 745,55 C895,82 1000,74 1145,32 C1275,-4 1355,12 1440,28" fill="none" stroke="#8b48f3" strokeWidth="2.2" />
        <path d="M0,50 C145,15 205,96 365,75 C535,52 585,37 745,62 C895,88 1000,81 1145,39 C1275,3 1355,19 1440,35" fill="none" stroke="#c08aff" strokeOpacity=".35" strokeWidth="1" />
      </svg>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="home-section features-section" id="features">
      <SectionHeading
        title="Everything you need to reach your"
        highlight="next milestone."
        subtitle="A complete learning and assessment platform to practice, test and grow."
      />
      <div className="feature-grid">
        {features.map(({ title, description, icon: Icon, tone }, index) => (
          <motion.article
            className="home-feature-card"
            key={title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.52, delay: index * 0.08 }}
            whileHover={{ y: -7, scale: 1.015 }}
          >
            <div className={`feature-card-icon ${tone}`}><Icon size={31} strokeWidth={2.1} /></div>
            <h3>{title}</h3>
            <p>{description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="home-section journey-section" id="journey">
      <SectionHeading
        title="Your journey to becoming a"
        highlight="Champion"
        subtitle="A simple and rewarding process to boost your learning."
      />
      <div className="journey-track">
        {journey.map(({ number, title, description, icon: Icon }, index) => (
          <React.Fragment key={number}>
            <motion.article
              className="journey-card"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{ y: -5 }}
            >
              <span className="journey-number">{number}</span>
              <div className="journey-icon"><Icon size={36} /></div>
              <div className="journey-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </motion.article>
            {index < journey.length - 1 && (
              <div className="journey-arrow" aria-hidden="true"><ArrowRight size={23} /></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function FeedbackSection() {
  return (
    <section className="home-section feedback-section" id="rewards">
      <SectionHeading
        title="Every answer is an"
        highlight="opportunity to improve."
        subtitle="Stay motivated with instant feedback, explanations and rewards."
      />
      <div className="feedback-grid">
        <motion.article
          className="feedback-card correct-card"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <img src="/images/correct-answer-art.png" alt="Golden trophy celebration illustration" />
          <div className="feedback-copy">
            <h3>Celebrate Correct Answers!</h3>
            <p>Get instant confirmation, earn XP, build your streak and keep the momentum going.</p>
            <div className="reward-pills">
              <span><Zap size={16} fill="currentColor" /> +10 XP</span>
              <span><Flame size={16} fill="currentColor" /> Streak: 5 Days</span>
            </div>
          </div>
        </motion.article>

        <motion.article
          className="feedback-card mistake-card"
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <img src="/images/learn-from-mistake-art.png" alt="Friendly illustration representing learning from mistakes" />
          <div className="feedback-copy">
            <h3>Learn From Every Mistake!</h3>
            <p>Get the correct answer and a clear explanation so you can understand, learn and improve.</p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

function AchievementBanner() {
  const navigate = useNavigate();
  return (
    <motion.section
      className="achievement-banner"
      id="achievements"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65 }}
    >
      <div className="achievement-banner-copy">
        <h2>Your next <em>achievement</em> starts here.</h2>
        <p>Join Champion Arena, challenge yourself and turn every attempt into progress.</p>
        <div className="achievement-actions">
          <button className="hero-primary-btn" onClick={() => navigate("/register")}>
            <UserRoundPlus size={18} /> Create Your Account
          </button>
          <button className="hero-secondary-btn" onClick={() => navigate("/login")}>
            <LogInIcon /> Login to Continue
          </button>
        </div>
      </div>
      <img src="/images/achievement-trophy-art.png" alt="Golden trophy on a purple champion podium" />
      <span className="banner-spark banner-spark-a" aria-hidden="true">✦</span>
      <span className="banner-spark banner-spark-b" aria-hidden="true">✧</span>
    </motion.section>
  );
}

function LogInIcon() {
  return <ArrowRight size={18} />;
}

function Footer() {
  return (
    <footer className="arena-footer" id="about">
      <div className="footer-main">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            <img src={logo} alt="Champion Arena" />
          </Link>
          <p>Practice. Compete. Improve. Excel.</p>
          <div className="footer-socials">
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube"><Youtube size={17} /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={17} /></a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
          </div>
        </div>

        <div className="footer-link-group">
          <h4>Platform</h4>
          <a href="#home">Home</a>
          <a href="#features">Practice</a>
          <a href="#journey">Exams</a>
          <a href="#rewards">Leaderboard</a>
        </div>
        <div className="footer-link-group">
          <h4>Company</h4>
          <a href="#about">About Us</a>
          <a href="mailto:hello@championarena.example">Contact</a>
          <a href="mailto:support@championarena.example">Help / Support</a>
        </div>
        <div className="footer-link-group">
          <h4>Legal</h4>
          <a href="#terms">Terms &amp; Conditions</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
        <div className="footer-watermark" aria-hidden="true"><Trophy size={70} /></div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Champion Arena. All rights reserved.</span>
        <span className="footer-tagline"><GraduationCap size={22} /> An Interactive Examination &amp; Learning Platform</span>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="home-page">
      <Navbar />
      <HeroSection />
      <main className="home-content">
        <FeatureSection />
        <JourneySection />
        <FeedbackSection />
        <AchievementBanner />
      </main>
      <Footer />
      {!reduceMotion && <div className="home-scroll-glow" aria-hidden="true" />}
    </div>
  );
}

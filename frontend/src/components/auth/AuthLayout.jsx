import ArenaNavbar from "../common/ArenaNavbar.jsx";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  Award,
  BookOpenCheck,
  ChartNoAxesCombined,
  Gamepad2,
  Layers3,
  Settings,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import "./AuthLayout.css";

const NAV_ITEMS = [
  { label: "Home", to: "/", icon: BookOpenCheck },
  { label: "Practice", to: "/practice", icon: Gamepad2 },
  { label: "Exams", to: "/exams", icon: BookOpenCheck },
  { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
  { label: "Achievements", to: "/achievements", icon: Award },
  { label: "About", to: "/about", icon: Users },
];

const STUDENT_FEATURES = [
  {
    icon: Zap,
    title: "Take Quizzes",
    subtitle: "& Exams",
    description: "Test your knowledge",
    color: "violet",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Track Your",
    subtitle: "Progress",
    description: "Monitor and improve",
    color: "green",
  },
  {
    icon: Trophy,
    title: "Earn Badges",
    subtitle: "& Rewards",
    description: "Get recognized for your efforts",
    color: "gold",
  },
];

const ADMIN_FEATURES = [
  {
    icon: Layers3,
    title: "Manage Exams",
    subtitle: "",
    description: "Create and conduct exams",
    color: "violet",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Track Performance",
    subtitle: "",
    description: "Analyze results and insights",
    color: "green",
  },
  {
    icon: Settings,
    title: "Control Platform",
    subtitle: "",
    description: "Manage users and settings",
    color: "gold",
  },
];

export default function AuthLayout({
  children,
  role = "student",
  page = "login",
}) {
  // const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const isAdmin = role === "admin";
  const isRegistration = page === "register";
  const features = isAdmin ? ADMIN_FEATURES : STUDENT_FEATURES;

  const heading = isRegistration ? (
    <>
      <span className="ca-auth-heading-line">Create Your</span>
      <br />
      Champion <span className="ca-auth-heading-accent">Arena</span>
      <br />
      Account
    </>
  ) : (
    <>
      <span className="ca-auth-heading-line">Welcome Back to</span>
      <br />
      Champion <span className="ca-auth-heading-accent">Arena</span>
    </>
  );

  return (
    <div className={`ca-auth-shell ${isRegistration ? "ca-auth-shell-register" : ""}`}>
      
    <ArenaNavbar />
      <main className={`ca-auth-main ${isRegistration ? "ca-auth-main-register" : ""}`}>
        <section className="ca-auth-intro-stage" aria-label="Champion Arena introduction">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={`${page}-${role}`}
              className={`ca-auth-intro-content ${isAdmin ? "is-admin" : "is-student"}`}
              initial={{
                opacity: 0,
                x: reduceMotion ? 0 : 18,
                filter: reduceMotion ? "none" : "blur(2px)",
              }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{
                opacity: 0,
                x: reduceMotion ? 0 : -14,
                filter: reduceMotion ? "none" : "blur(2px)",
              }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.48,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className={`ca-auth-platform-badge ${isAdmin ? "admin-badge" : ""}`}>
                {isAdmin ? <Settings size={19} /> : <Gamepad2 size={19} />}
                <span>
                  {isAdmin
                    ? "Admin Portal"
                    : "Gamified Learning & Exam Platform"}
                </span>
              </div>

              <div className="ca-auth-hero-heading-wrap">
                <h1>{heading}</h1>
                <span className="ca-auth-heading-swoosh" aria-hidden="true" />
              </div>

              <p className="ca-auth-description">
                {isRegistration ? (
                  <>
                    Join Champion Arena and start your
                    <br className="ca-auth-desktop-break" />
                    gamified learning &amp; exam journey today!
                  </>
                ) : isAdmin ? (
                  <>
                    Manage exams, track performance,
                    <br className="ca-auth-desktop-break" />
                    and build a better learning ecosystem.
                  </>
                ) : (
                  <>
                    Log in to continue your learning journey,
                    <br className="ca-auth-desktop-break" />
                    track your progress, and achieve your goals!
                  </>
                )}
              </p>

              <div className="ca-auth-feature-list">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={`${role}-${page}-${feature.title}`}
                      className="ca-auth-feature-item"
                      initial={{ opacity: 0, x: reduceMotion ? 0 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: reduceMotion ? 0.01 : 0.4,
                        delay: reduceMotion ? 0 : 0.08 + index * 0.07,
                      }}
                    >
                      <span className={`ca-auth-feature-icon ${feature.color}`}>
                        <Icon size={29} strokeWidth={2.1} aria-hidden="true" />
                      </span>
                      <span className="ca-auth-feature-copy">
                        <strong>
                          {feature.title}
                          {feature.subtitle && <><br />{feature.subtitle}</>}
                        </strong>
                        <small>{feature.description}</small>
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="ca-auth-learning-ribbon">
                <span>Learn</span><i>•</i><span>Practice</span><i>•</i>
                <span>Compete</span><i>•</i><span>Excel</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className={`ca-auth-hero-art ${isAdmin ? "admin-art" : "student-art"}`}
            key={`art-${role}-${page}`}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 15, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span className="ca-auth-art-halo" />
            <img
              src={isAdmin ? "/images/champion-admin-hero.png" : "/images/champion-student-hero.png"}
              alt={isAdmin ? "Administrator managing exams and performance" : "Students learning together on a laptop"}
              draggable="false"
            />
            {!isAdmin && <span className="ca-auth-art-sparkle" aria-hidden="true">✦</span>}
          </motion.div>
        </section>

        <section className="ca-auth-form-stage" aria-label={isRegistration ? "Student registration" : "Account login"}>
          {children}
        </section>
      </main>
    </div>
  );
}

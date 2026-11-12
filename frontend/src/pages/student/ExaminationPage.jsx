import { useEffect, useMemo, useState } from "react";
import {
  Trophy, Bell, ChevronDown, Clock3, Upload, ClipboardList,
  CheckCircle2, Info, ArrowLeft, ArrowRight, BookOpen, X,
  AlertTriangle, Flame, Star, GraduationCap, Home, Volume2, VolumeX
} from "lucide-react";
import "../../styles/examination-page.css";

const STORAGE_KEY = "champion-arena-java-assessment-v1";
const EXAM_DURATION_SECONDS = 60 * 60;

// Demo Java MCQ bank: 30 questions. Replace this array with the exam API response later.
const QUESTIONS = [
  { id: 1, question: "Which method is the entry point of a standard Java application?", options: ["start()", "main()", "run()", "init()"], answer: 1, explanation: "The JVM starts a standard Java application by invoking the public static void main(String[] args) method." },
  { id: 2, question: "Which keyword is used to create a subclass in Java?", options: ["implements", "inherits", "extends", "instanceof"], answer: 2, explanation: "The extends keyword establishes class inheritance. A class uses implements to adopt an interface." },
  { id: 3, question: "Which of these is not a primitive data type in Java?", options: ["int", "boolean", "char", "String"], answer: 3, explanation: "String is a class in Java, not a primitive type. int, boolean and char are primitive types." },
  { id: 4, question: "What is the default value of an instance variable of type int?", options: ["null", "0", "1", "undefined"], answer: 1, explanation: "Instance variables of primitive int type are initialized to 0 when no explicit value is assigned." },
  { id: 5, question: "Which collection does not allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], answer: 2, explanation: "A Set stores unique elements. HashSet does not retain duplicate values." },
  { id: 6, question: "Which keyword prevents a class from being inherited?", options: ["static", "final", "private", "const"], answer: 1, explanation: "A class declared final cannot be extended by another class." },
  { id: 7, question: "Which operator compares two primitive values for equality?", options: ["=", "==", "equals", ":="], answer: 1, explanation: "The == operator compares primitive values. The equals() method is commonly used for object equality." },
  { id: 8, question: "Which package is imported automatically in every Java source file?", options: ["java.util", "java.io", "java.lang", "java.net"], answer: 2, explanation: "The java.lang package is implicitly imported, providing classes such as String, Math and Object." },
  { id: 9, question: "What is the size of the char type in Java?", options: ["8 bits", "16 bits", "32 bits", "64 bits"], answer: 1, explanation: "Java char is a 16-bit unsigned type that represents a UTF-16 code unit." },
  { id: 10, question: "Which loop always executes its body at least once?", options: ["for", "while", "do-while", "enhanced for"], answer: 2, explanation: "A do-while loop checks its condition after executing the body, so the body runs at least once." },
  { id: 11, question: "Which access modifier makes a member accessible only within its own class?", options: ["public", "protected", "default", "private"], answer: 3, explanation: "The private access modifier restricts access to the declaring class." },
  { id: 12, question: "Which statement about Java constructors is correct?", options: ["A constructor has a return type", "A constructor has the same name as its class", "A constructor must be static", "A constructor is inherited"], answer: 1, explanation: "A constructor has the same name as its class and has no declared return type." },
  { id: 13, question: "Which interface is the root of the Java class hierarchy?", options: ["Runnable", "Serializable", "Comparable", "Object is the root class"], answer: 3, explanation: "java.lang.Object is the root class from which every Java class directly or indirectly inherits." },
  { id: 14, question: "Which is the correct declaration of the main method in Java?", options: ["public static void main()", "public void main(String args[])", "public static void main(String[] args)", "static public main(String[] args)"], answer: 2, explanation: "The standard entry-point signature is public static void main(String[] args). The JVM passes command-line arguments through the String array." },
  { id: 15, question: "Which keyword is used to handle an exception?", options: ["throws", "catch", "final", "assert"], answer: 1, explanation: "A catch block handles an exception thrown from its associated try block. throws declares exceptions a method may pass to its caller." },
  { id: 16, question: "Which class is commonly used to read text input from the keyboard?", options: ["Scanner", "FileWriter", "PrintWriter", "Formatter"], answer: 0, explanation: "java.util.Scanner can read tokens and lines from System.in." },
  { id: 17, question: "What does JVM stand for?", options: ["Java Variable Method", "Java Virtual Machine", "Java Verified Module", "Joint Virtual Memory"], answer: 1, explanation: "JVM stands for Java Virtual Machine, which executes Java bytecode." },
  { id: 18, question: "Which keyword refers to the current object?", options: ["super", "this", "self", "current"], answer: 1, explanation: "The this keyword refers to the current object instance." },
  { id: 19, question: "Which method converts a String to an int?", options: ["Integer.valueOfInt()", "String.toInt()", "Integer.parseInt()", "int.convert()"], answer: 2, explanation: "Integer.parseInt(String) parses a valid integer representation and returns a primitive int." },
  { id: 20, question: "Which keyword is used to implement an interface?", options: ["extends", "implements", "interface", "inherits"], answer: 1, explanation: "A class uses implements followed by an interface name to provide its implementation." },
  { id: 21, question: "What is method overloading?", options: ["Same method name with different parameter lists", "Same method body in every subclass", "Changing only the return type", "Making a method private"], answer: 0, explanation: "Overloading declares methods with the same name but different parameter lists in the same applicable scope." },
  { id: 22, question: "Which class provides a growable array implementation?", options: ["String", "ArrayList", "Arrays", "Math"], answer: 1, explanation: "ArrayList is a resizable-array implementation of the List interface." },
  { id: 23, question: "Which block is generally used for code that must run whether an exception occurs or not?", options: ["try", "catch", "finally", "throw"], answer: 2, explanation: "A finally block is used for cleanup code and normally runs after try/catch processing, subject to JVM termination conditions." },
  { id: 24, question: "Which of the following is immutable in Java?", options: ["String", "StringBuilder", "ArrayList", "HashMap"], answer: 0, explanation: "String objects are immutable: their contents cannot be changed after creation." },
  { id: 25, question: "Which keyword calls a superclass constructor?", options: ["this", "parent", "base", "super"], answer: 3, explanation: "A constructor can use super(...) to invoke a constructor of its direct superclass." },
  { id: 26, question: "Which statement creates an object of class Student?", options: ["Student = new();", "new Student s;", "Student s = new Student();", "class Student = new Student;"], answer: 2, explanation: "The new operator invokes the constructor and returns a reference assigned here to variable s." },
  { id: 27, question: "Which functional interface represents an operation that takes no arguments and returns a result?", options: ["Consumer", "Supplier", "Predicate", "Runnable"], answer: 1, explanation: "Supplier<T> has a get() method that takes no arguments and returns a value of type T." },
  { id: 28, question: "What is the result of 10 / 3 when both operands are int?", options: ["3.33", "3", "4", "3.0"], answer: 1, explanation: "Integer division discards the fractional part, so 10 / 3 evaluates to 3." },
  { id: 29, question: "Which keyword is used to explicitly generate an exception?", options: ["throws", "try", "catch", "throw"], answer: 3, explanation: "The throw statement explicitly throws a Throwable object. throws appears in a method declaration." },
  { id: 30, question: "Which statement about an abstract class is correct?", options: ["It can be instantiated directly", "It cannot contain concrete methods", "It can contain both abstract and concrete methods", "It must contain only static methods"], answer: 2, explanation: "An abstract class may contain abstract methods as well as implemented concrete methods, fields and constructors." },
];

const LETTERS = ["A", "B", "C", "D"];
const MOTIVATION = [
  { quote: "It’s okay to get it wrong! Every mistake is a step closer to mastery.", sub: "Learn, improve and try the next question with more confidence!" },
  { quote: "Progress is built one question at a time.", sub: "Take a breath, learn from this moment and keep moving forward." },
  { quote: "A challenge is a chance to grow.", sub: "You are still in the game. Give the next question your best!" },
  { quote: "Your effort matters more than one answer.", sub: "Stay focused. Your next breakthrough could be one question away." },
];

function readSavedAttempt() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.submitted) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getQuestionStatus(index, answers, marked, currentIndex) {
  const id = QUESTIONS[index].id;
  if (index === currentIndex) return "current";
  if (answers[id] !== undefined) return "answered";
  if (marked.includes(id)) return "marked";
  return "unanswered";
}

export default function ExaminationPage({
  onExit,
  examTitle = "Java Programming Assessment",
  examCode = "JAVA-2026-014",
  subject = "Programming",
  durationMinutes = 60,
}) {
  const saved = useMemo(() => readSavedAttempt(), []);
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex ?? 0);
  const [answers, setAnswers] = useState(saved?.answers ?? {});
  const [marked, setMarked] = useState(saved?.marked ?? []);
  const [secondsLeft, setSecondsLeft] = useState(saved?.secondsLeft ?? durationMinutes * 60);
  const [streak, setStreak] = useState(saved?.streak ?? 0);
  const [bestStreak, setBestStreak] = useState(saved?.bestStreak ?? 0);
  const [points, setPoints] = useState(saved?.points ?? 0);
  const [xp, setXp] = useState(saved?.xp ?? 0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [feedbackOverlay, setFeedbackOverlay] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const question = QUESTIONS[currentIndex];
  const selectedAnswer = answers[question.id];
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && selectedAnswer === question.answer;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([id, value]) => {
    const item = QUESTIONS.find((q) => q.id === Number(id));
    return item && item.answer === value;
  }).length;
  const wrongCount = answeredCount - correctCount;
  const markedCount = marked.length;
  const percentage = Math.round((correctCount / QUESTIONS.length) * 100);
  const timeText = `${String(Math.floor(secondsLeft / 3600)).padStart(2, "0")}:${String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;

  useEffect(() => {
    const payload = { currentIndex, answers, marked, secondsLeft, streak, bestStreak, points, xp, submitted: false };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { /* storage may be unavailable */ }
  }, [currentIndex, answers, marked, secondsLeft, streak, bestStreak, points, xp]);

  useEffect(() => {
    if (submitted) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted]);

  useEffect(() => {
    if (secondsLeft === 0 && !submitted) submitExam();
  }, [secondsLeft, submitted]);

  useEffect(() => {
    setShowExplanation(false);
    setFeedbackOverlay(null);
  }, [currentIndex]);

  useEffect(() => {
    if (feedbackOverlay !== "correct") return undefined;
    const timeout = window.setTimeout(() => setFeedbackOverlay(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [feedbackOverlay, celebrationKey]);

  function playFeedbackSound(isCorrectAnswer) {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const now = context.currentTime;
      const notes = isCorrectAnswer
        ? [{ frequency: 660, start: 0, duration: 0.13 }, { frequency: 880, start: 0.12, duration: 0.16 }, { frequency: 1100, start: 0.27, duration: 0.22 }]
        : [{ frequency: 440, start: 0, duration: 0.16 }, { frequency: 349, start: 0.17, duration: 0.2 }];
      notes.forEach(({ frequency, start, duration }) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now + start);
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(isCorrectAnswer ? 0.12 : 0.07, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + start);
        oscillator.stop(now + start + duration + 0.02);
      });
      window.setTimeout(() => context.close(), 900);
    } catch {
      // Audio is optional; answer selection must always continue.
    }
  }

  function chooseAnswer(optionIndex) {
    if (isAnswered || submitted) return;
    setAnswers((previous) => ({ ...previous, [question.id]: optionIndex }));
    const answerIsCorrect = optionIndex === question.answer;
    playFeedbackSound(answerIsCorrect);
    setFeedbackOverlay(answerIsCorrect ? "correct" : "wrong");
    if (answerIsCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((previous) => Math.max(previous, nextStreak));
      setPoints((previous) => previous + 10);
      setXp((previous) => previous + 50);
      setCelebrationKey((previous) => previous + 1);
    } else {
      setStreak(0);
    }
  }

  function toggleReview() {
    setMarked((previous) => previous.includes(question.id)
      ? previous.filter((id) => id !== question.id)
      : [...previous, question.id]);
  }

  function goToQuestion(index) {
    if (index < 0 || index >= QUESTIONS.length) return;
    setCurrentIndex(index);
  }

  function submitExam() {
    setSubmitted(true);
    setShowSubmitConfirm(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  function exitExam() {
    setShowExitConfirm(false);
    if (onExit) onExit();
  }

  const palette = useMemo(() => QUESTIONS.map((_, index) => getQuestionStatus(index, answers, marked, currentIndex)), [answers, marked, currentIndex]);
  const motivation = MOTIVATION[(wrongCount + currentIndex) % MOTIVATION.length];

  if (submitted) {
    return (
      <main className="ca-exam-shell ca-submitted-screen">
        <div className="ca-exam-topbar">
          <div className="ca-exam-brand"><Trophy size={31} /><span>Champion<strong>Arena</strong></span></div>
          <div className="ca-exam-top-user"><span className="ca-user-avatar">S</span><span><b>Shravan K</b><small>Student</small></span></div>
        </div>
        <section className="ca-submitted-card">
          <div className="ca-submitted-icon"><CheckCircle2 size={54} /></div>
          <h1>Test Submitted!</h1>
          <p>Your responses have been saved successfully.</p>
          <div className="ca-submitted-stats">
            <div><strong>{answeredCount}/{QUESTIONS.length}</strong><span>Attempted</span></div>
            <div><strong>{correctCount}</strong><span>Correct</span></div>
            <div><strong>{wrongCount}</strong><span>Incorrect</span></div>
            <div><strong>{percentage}%</strong><span>Score</span></div>
          </div>
          <div className="ca-submitted-note">You earned <b>{points} points</b> and <b>{xp} XP</b>. Your score is calculated from correct and incorrect answers. Detailed results will be available in the Results section.</div>
          <button className="ca-exam-primary" onClick={exitExam}><Home size={18} /> Back to Dashboard</button>
        </section>
      </main>
    );
  }

  return (
    <main className="ca-exam-shell">
      <header className="ca-exam-topbar">
        <div className="ca-exam-brand"><Trophy size={31} /><span>Champion<strong>Arena</strong></span></div>
        <div className="ca-exam-top-actions">
          <button className="ca-exam-icon-button ca-sound-toggle" onClick={() => setSoundEnabled((enabled) => !enabled)}
            aria-label={soundEnabled ? "Mute feedback sounds" : "Enable feedback sounds"}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button className="ca-exam-icon-button" aria-label="Notifications"><Bell size={21} /><i /></button>
          <div className="ca-exam-user"><span className="ca-user-avatar">S</span><span><b>Shravan K</b><small>Student</small></span><ChevronDown size={17} /></div>
        </div>
      </header>

      <div className="ca-exam-content">
        <section className="ca-exam-titlebar">
          <div className="ca-exam-title-left">
            <div className="ca-exam-code-icon">&lt;/&gt;</div>
            <div><h1>{examTitle}</h1><p>{examCode} <span>•</span> {subject}</p></div>
          </div>
          <div className={`ca-exam-timer ${secondsLeft <= 300 ? "urgent" : ""}`}><Clock3 size={22} /><strong>{timeText}</strong></div>
          <button className="ca-exam-submit" onClick={() => setShowSubmitConfirm(true)}><Upload size={17} /> Submit Test</button>
        </section>

        <section className="ca-exam-workspace">
          <aside className="ca-question-sidebar">
            <div className="ca-palette-heading"><ClipboardList size={22} /><h2>Question Palette</h2></div>
            <div className="ca-palette-legend">
              <span><i className="legend-answered" /> Answered ({answeredCount})</span>
              <span><i className="legend-unanswered" /> Not Answered ({QUESTIONS.length - answeredCount})</span>
              <span><i className="legend-review" /> Marked for Review ({markedCount})</span>
            </div>
            <div className="ca-question-grid">
              {QUESTIONS.map((item, index) => (
                <button key={item.id} className={`ca-question-number ${palette[index]}`} onClick={() => goToQuestion(index)} aria-label={`Go to question ${index + 1}`}>
                  {index + 1}
                  {marked.includes(item.id) && <i />}
                </button>
              ))}
            </div>
            <div className="ca-palette-help"><Info size={15} /> Select a question number to navigate.</div>
            <button className="ca-exit-exam" onClick={() => setShowExitConfirm(true)}><ArrowLeft size={16} /> Exit Exam</button>
          </aside>

          <section className="ca-question-panel">
            <div className="ca-question-topline">
              <span className="ca-question-counter">Question {currentIndex + 1} of {QUESTIONS.length}</span>
              <button className={`ca-review-toggle ${marked.includes(question.id) ? "is-marked" : ""}`} onClick={toggleReview}>
                <span className="ca-review-checkbox">{marked.includes(question.id) ? "✓" : ""}</span>
                Mark for Review <Info size={16} />
              </button>
            </div>

            <div className="ca-question-body">
              <h2>{question.question}</h2>
              <div className="ca-answer-options">
                {question.options.map((option, index) => {
                  const selected = selectedAnswer === index;
                  const correctOption = index === question.answer;
                  let optionClass = "";
                  if (isAnswered && correctOption) optionClass = "correct";
                  else if (selected && !isCorrect) optionClass = "incorrect";
                  else if (selected) optionClass = "selected";
                  return (
                    <button key={option} className={`ca-answer-option ${optionClass}`} onClick={() => chooseAnswer(index)} disabled={isAnswered}>
                      <span className="ca-option-radio">{selected ? <i /> : null}</span>
                      <b>{LETTERS[index]})</b>
                      <span>{option}</span>
                      {isAnswered && correctOption && <CheckCircle2 className="ca-option-result-icon" size={19} />}
                      {selected && !isCorrect && <X className="ca-option-result-icon" size={19} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="ca-question-navigation">
              <button className="ca-exam-secondary" onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0}><ArrowLeft size={17} /> Previous</button>
              <div className="ca-navigation-hint">{isAnswered ? "Answer locked · You can continue" : "Choose one answer to continue"}</div>
              {currentIndex === QUESTIONS.length - 1 ? (
                <button className="ca-exam-primary" onClick={() => setShowSubmitConfirm(true)}>Submit Test <Upload size={16} /></button>
              ) : (
                <button className="ca-exam-primary" onClick={() => goToQuestion(currentIndex + 1)} disabled={!isAnswered}>Next <ArrowRight size={17} /></button>
              )}
            </div>
          </section>
        </section>
      </div>


      {feedbackOverlay && (
        <div className="ca-feedback-overlay" role="dialog" aria-live="assertive">
          {feedbackOverlay === "correct" ? (
            <div className="ca-correct-popup" key={celebrationKey}>
              <div className="ca-confetti-burst" aria-hidden="true">
                {Array.from({ length: 24 }, (_, index) => <i key={index} style={{ "--i": index, left: `${(index * 37) % 100}%`, top: `${24 + ((index * 19) % 38)}%` }} />)}
              </div>
              <div className="ca-correct-ribbon"><span className="ca-check-bubble">✓</span> Correct Answer!</div>
              <h2>Awesome!</h2>
              <p className="ca-correct-message">You’re on the right track!</p>
              <span className="ca-points-pop">+10 Points</span>
              <div className="ca-popup-rewards">
                <span>🔥 Streak: {streak}</span>
                <span>⭐ +50 XP</span>
              </div>
            </div>
          ) : (
            <div className="ca-wrong-popup">
              <div className="ca-wrong-visual">
                <MotivationLandscape />
                <div className="ca-wrong-visual-label"><span>✦</span> EVERY STEP MAKES YOU STRONGER</div>
              </div>
              <div className="ca-wrong-content">
                <div className="ca-wrong-quote-icon"><BookOpen size={21} /></div>
                <span className="ca-wrong-eyebrow">A MOMENT TO LEARN</span>
                <p className="ca-wrong-quote">“{motivation.quote}”</p>
                <p className="ca-wrong-sub">{motivation.sub}</p>
                {showExplanation && <p className="ca-wrong-explanation">{question.explanation}</p>}
                <div className="ca-wrong-actions">
                  <button className="ca-wrong-view" onClick={() => setShowExplanation((value) => !value)}>
                    <BookOpen size={16} /> {showExplanation ? "Hide Explanation" : "View Explanation"}
                  </button>
                  <button className="ca-wrong-next"
                    onClick={() => currentIndex === QUESTIONS.length - 1 ? setShowSubmitConfirm(true) : goToQuestion(currentIndex + 1)}>
                    Next Question <ArrowRight size={16} />
                  </button>
                </div>
                <div className="ca-wrong-footer"><span className="ca-footer-spark">✦</span> Don’t stop now — your next answer could be right!</div>
              </div>
            </div>
          )}
        </div>
      )}

      {showSubmitConfirm && (
        <div className="ca-exam-modal-backdrop" onClick={() => setShowSubmitConfirm(false)}>
          <div className="ca-exam-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ca-confirm-icon"><AlertTriangle size={27} /></div>
            <h2>Submit your test?</h2>
            <p>You have answered <b>{answeredCount} of {QUESTIONS.length}</b> questions. Unanswered questions will be counted as incorrect.</p>
            <div className="ca-confirm-summary"><span>Correct: <b>{correctCount}</b></span><span>Incorrect: <b>{wrongCount}</b></span><span>Remaining: <b>{QUESTIONS.length - answeredCount}</b></span></div>
            <div className="ca-confirm-actions"><button className="ca-exam-secondary" onClick={() => setShowSubmitConfirm(false)}>Continue Test</button><button className="ca-exam-primary" onClick={submitExam}>Submit Test</button></div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="ca-exam-modal-backdrop" onClick={() => setShowExitConfirm(false)}>
          <div className="ca-exam-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ca-confirm-icon"><Info size={27} /></div>
            <h2>Exit examination?</h2>
            <p>Your progress and remaining time will be saved on this device. You can resume this attempt later.</p>
            <div className="ca-confirm-actions"><button className="ca-exam-secondary" onClick={() => setShowExitConfirm(false)}>Stay Here</button><button className="ca-exam-primary" onClick={exitExam}>Save & Exit</button></div>
          </div>
        </div>
      )}
    </main>
  );
}


function MotivationLandscape() {
  return (
    <svg className="ca-motivation-landscape" viewBox="0 0 760 250" role="img" aria-label="A student climbing a mountain toward a flag at sunset">
      <defs>
        <linearGradient id="ca-sky" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#f6a6bd" />
          <stop offset="52%" stopColor="#ffc58e" />
          <stop offset="100%" stopColor="#f9dfb1" />
        </linearGradient>
        <linearGradient id="ca-mountain-back" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#858ac5" />
          <stop offset="100%" stopColor="#535f9d" />
        </linearGradient>
        <linearGradient id="ca-mountain-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#42558e" />
          <stop offset="100%" stopColor="#172e63" />
        </linearGradient>
      </defs>
      <rect width="760" height="250" fill="url(#ca-sky)" />
      <circle cx="565" cy="91" r="48" fill="#fff0b5" opacity=".95" />
      <circle cx="565" cy="91" r="66" fill="#fff0b5" opacity=".2" />
      <path d="M0 140 L92 93 L150 126 L245 55 L315 112 L400 67 L492 128 L590 72 L760 142 V250 H0Z" fill="url(#ca-mountain-back)" opacity=".78"/>
      <path d="M0 174 L105 117 L188 166 L300 91 L390 166 L502 106 L620 166 L760 113 V250 H0Z" fill="#6574ad"/>
      <path d="M0 215 L132 153 L218 194 L337 126 L426 194 L548 129 L645 190 L760 145 V250 H0Z" fill="url(#ca-mountain-front)"/>
      <path d="M0 235 L155 180 L245 219 L365 159 L457 216 L590 160 L760 210 V250 H0Z" fill="#142957"/>
      <path d="M352 250 Q405 213 442 190 T516 154 T590 125" fill="none" stroke="#f6c879" strokeWidth="5" strokeLinecap="round" opacity=".9"/>
      <path d="M590 125 L590 42" stroke="#172c59" strokeWidth="5" strokeLinecap="round"/>
      <path d="M592 44 L642 57 L592 72Z" fill="#172c59"/>
      <g transform="translate(432 125)" fill="#101f43">
        <circle cx="0" cy="0" r="9"/>
        <path d="M-8 10 Q-18 20 -16 38 L-7 47 L7 42 L12 21 L7 10Z"/>
        <path d="M-12 18 L-30 36 L-25 41 L-5 29 M8 18 L20 34 L25 30 L15 12" stroke="#101f43" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M-6 44 L-18 68 L-11 72 L3 52 L11 72 L19 69 L9 43" stroke="#101f43" strokeWidth="8" strokeLinecap="round" fill="none"/>
        <path d="M-8 13 L-24 34 L-12 41 L2 24Z" fill="#f3a34f"/>
        <path d="M-22 29 L-31 45" stroke="#101f43" strokeWidth="4" strokeLinecap="round"/>
      </g>
      <g fill="#fff5d7" opacity=".85">
        <circle cx="110" cy="55" r="3"/><circle cx="178" cy="34" r="2"/><circle cx="684" cy="42" r="3"/>
        <path d="M270 37 l5 10 10 5 -10 5 -5 10 -5 -10 -10 -5 10 -5Z"/>
      </g>
    </svg>
  );
}

function SparklesFallback() {
  return <span className="ca-sparkles-fallback">✦</span>;
}

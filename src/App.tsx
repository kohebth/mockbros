import { ArrowRight, BarChart3, Brain, CheckCircle2, Mic, Sparkles } from "lucide-react";

const interviews = [
  {
    title: "Software Engineer",
    description: "Practice technical depth, debugging, ownership, and tradeoff questions.",
    questions: 3
  },
  {
    title: "Product Manager",
    description: "Practice prioritization, user insight, metrics, and product judgment.",
    questions: 3
  },
  {
    title: "Sales",
    description: "Practice discovery, objection handling, negotiation, and closing stories.",
    questions: 3
  },
  {
    title: "General Behavioral",
    description: "Practice teamwork, conflict, leadership, and communication answers.",
    questions: 3
  }
];

const reportItems = [
  "Overall score and readiness level",
  "Strengths and weak points",
  "Per-question coaching",
  "Improved answer examples"
];

export function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Mockbros home">
          <span className="brand-mark">M</span>
          <span>Mockbros</span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#practice">Practice</a>
          <a href="#report">Report</a>
          <a href="#flow">Flow</a>
        </nav>
      </header>

      <section className="hero-section" id="practice">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            AI mock interview practice
          </div>
          <h1>Practice interviews before the real one.</h1>
          <p>
            Mockbros gives job seekers realistic interview questions and instant AI feedback,
            so they know what to improve before it matters.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#interviews">
              Start mock interview
              <ArrowRight size={18} />
            </a>
            <a className="button button-secondary" href="#report">
              View report format
            </a>
          </div>
        </div>

        <div className="interview-panel" aria-label="Demo interview panel">
          <div className="panel-header">
            <span>Live demo flow</span>
            <span className="status-pill">3 questions</span>
          </div>
          <div className="question-card">
            <span className="question-step">Question 1 of 3</span>
            <h2>Tell me about a project you are proud of. What tradeoffs did you make?</h2>
            <textarea
              aria-label="Interview answer"
              placeholder="Type your answer here..."
              defaultValue="I built a small dashboard for my team and chose a simpler data model so we could ship faster..."
            />
            <div className="question-actions">
              <button className="icon-button" aria-label="Record answer">
                <Mic size={18} />
              </button>
              <button className="button button-primary">Submit answer</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="interviews">
        <div className="section-heading">
          <span className="eyebrow">Choose a track</span>
          <h2>Interview templates</h2>
        </div>
        <div className="template-grid">
          {interviews.map((interview) => (
            <article className="template-card" key={interview.title}>
              <div className="template-icon">
                <Brain size={22} />
              </div>
              <h3>{interview.title}</h3>
              <p>{interview.description}</p>
              <div className="template-footer">
                <span>{interview.questions} questions</span>
                <button className="small-button">Select</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-section" id="report">
        <div className="report-summary">
          <span className="eyebrow">Feedback report</span>
          <h2>Your interview report is ready.</h2>
          <p>
            The report turns practice answers into concrete coaching: score, readiness,
            strengths, weak points, and better answer examples.
          </p>
          <ul className="report-list">
            {reportItems.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="score-card">
          <div className="score-header">
            <BarChart3 size={22} />
            <span>Overall score</span>
          </div>
          <strong>74</strong>
          <span className="readiness">Almost Ready</span>
          <p>
            Your answers are relevant and clear. Add stronger structure and measurable
            results to make them more convincing.
          </p>
        </div>
      </section>

      <section className="flow-section" id="flow">
        <span className="eyebrow">Demo flow</span>
        <div className="flow-steps">
          <span>Choose interview</span>
          <ArrowRight size={18} />
          <span>Answer questions</span>
          <ArrowRight size={18} />
          <span>Submit</span>
          <ArrowRight size={18} />
          <span>Review feedback</span>
        </div>
      </section>
    </main>
  );
}

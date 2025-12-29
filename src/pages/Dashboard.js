import { Link } from "react-router-dom";
import { useMemo } from "react";

import FeedbackBox from "../components/FeedbackBox";
import { getUserProgress } from "../adapters/progressAdapter";

/* ===== Small Progress Bar (UI only) ===== */
function ProgressBar({ completed, total }) {
  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div style={{ margin: "10px 0" }}>
      <div
        style={{
          height: "8px",
          backgroundColor: "#eee",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: "#4A90E2",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <small style={{ color: "#555" }}>
        {percent}% completed
      </small>
    </div>
  );
}

function Dashboard() {
  /* ===== Load progress via Adapter (Phase 5) ===== */
  const progress = useMemo(() => getUserProgress(), []);

  const listening = progress.skills.listening;
  const reading = progress.skills.reading;
  const speaking = progress.skills.speaking;
  const writing = progress.skills.writing;
  const grammar = progress.skills.grammar;

  /* ===== Totals ===== */
  const TOTALS = {
    listening: 16 + 12 + 14,
    reading: 5 + 6 + 6,
    speaking: 5 + 6 + 6,
    writing: 5 + 6 + 6,
    grammar: 5,
  };

  const totalCompleted =
    listening.length +
    reading.length +
    speaking.length +
    writing.length +
    grammar.length;

  const totalPossible =
    TOTALS.listening +
    TOTALS.reading +
    TOTALS.speaking +
    TOTALS.writing +
    TOTALS.grammar;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* ===== Header ===== */}
      <h2 style={{ marginBottom: "6px" }}>
        📊 Your Learning Dashboard
      </h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Track your real progress across all skills.
      </p>

      {/* ===== Overall ===== */}
      <div style={cardStyle}>
        <h3>🚀 Overall Progress</h3>
        <ProgressBar
          completed={totalCompleted}
          total={totalPossible}
        />
        <p style={{ fontWeight: "bold" }}>
          {totalCompleted} / {totalPossible} items completed
        </p>
      </div>

      {/* ===== Listening ===== */}
      <div style={cardStyle}>
        <h3>🎧 Listening</h3>
        <ProgressBar
          completed={listening.length}
          total={TOTALS.listening}
        />
        <p>Completed lessons: {listening.length}</p>
        <Link to="/listening">
          <button style={buttonStyle}>
            Continue Listening
          </button>
        </Link>
      </div>

      {/* ===== Reading ===== */}
      <div style={cardStyle}>
        <h3>📖 Reading</h3>
        <ProgressBar
          completed={reading.length}
          total={TOTALS.reading}
        />
        <p>Completed lessons: {reading.length}</p>
        <Link to="/reading">
          <button style={buttonStyle}>
            Continue Reading
          </button>
        </Link>
      </div>

      {/* ===== Speaking ===== */}
      <div style={cardStyle}>
        <h3>🎤 Speaking</h3>
        <ProgressBar
          completed={speaking.length}
          total={TOTALS.speaking}
        />
        <p>Completed lessons: {speaking.length}</p>
        <Link to="/speaking">
          <button style={buttonStyle}>
            Continue Speaking
          </button>
        </Link>
      </div>

      {/* ===== Writing ===== */}
      <div style={cardStyle}>
        <h3>✍️ Writing</h3>
        <ProgressBar
          completed={writing.length}
          total={TOTALS.writing}
        />
        <p>Completed lessons: {writing.length}</p>
        <Link to="/writing">
          <button style={buttonStyle}>
            Continue Writing
          </button>
        </Link>
      </div>

      {/* ===== Grammar ===== */}
      <div style={cardStyle}>
        <h3>📘 Grammar</h3>
        <ProgressBar
          completed={grammar.length}
          total={TOTALS.grammar}
        />
        <p>Completed units: {grammar.length}</p>
        <Link to="/grammar">
          <button style={buttonStyle}>
            Continue Grammar
          </button>
        </Link>
      </div>

      {/* ===== Global Feedback ===== */}
      <FeedbackBox />
    </div>
  );
}

/* ===== Styles ===== */
const cardStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  backgroundColor: "#4A90E2",
  color: "#fff",
};

export default Dashboard;

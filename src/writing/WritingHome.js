import { Link } from "react-router-dom";

import STORAGE_KEYS from "../utils/storageKeys";
import {
  countCompletedByLevel
} from "../utils/progressStorage";

/* ===== Small Progress Bar ===== */
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

function WritingHome() {
  /* ===== Totals ===== */
  const A1_TOTAL = 5;
  const A2_TOTAL = 6;
  const B1_TOTAL = 6;

  /* ===== Progress (via helpers) ===== */
  const completedA1 = countCompletedByLevel(
    STORAGE_KEYS.WRITING_COMPLETED,
    "A1"
  );

  const completedA2 = countCompletedByLevel(
    STORAGE_KEYS.WRITING_COMPLETED,
    "A2"
  );

  const completedB1 = countCompletedByLevel(
    STORAGE_KEYS.WRITING_COMPLETED,
    "B1"
  );

  /* ===== Locking Rules ===== */
  const isA2Unlocked = completedA1 === A1_TOTAL;
  const isB1Unlocked = completedA2 === A2_TOTAL;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>✍️ Writing Practice</h2>

      <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
        Practice writing short texts to organize your ideas,
        improve grammar, and express yourself more clearly.
      </p>

      <p style={{ marginTop: "10px", fontStyle: "italic" }}>
        Focus on clarity, not perfection.
      </p>

      {/* ===== A1 ===== */}
      <div style={cardStyle}>
        <h3>A1 – Beginner</h3>

        <ProgressBar
          completed={completedA1}
          total={A1_TOTAL}
        />

        <p style={progressText}>
          {completedA1} / {A1_TOTAL} lessons completed
        </p>

        <Link to="/writing/A1">
          <button style={btnStyle}>
            {completedA1 === 0
              ? "Start A1"
              : "Continue A1"}
          </button>
        </Link>
      </div>

      {/* ===== A2 ===== */}
      <div
        style={{
          ...cardStyle,
          opacity: isA2Unlocked ? 1 : 0.6,
        }}
      >
        <h3>A2 – Elementary</h3>

        <ProgressBar
          completed={completedA2}
          total={A2_TOTAL}
        />

        <p style={progressText}>
          {completedA2} / {A2_TOTAL} lessons completed
        </p>

        {isA2Unlocked ? (
          <Link to="/writing/A2">
            <button style={btnStyle}>
              {completedA2 === 0
                ? "Start A2"
                : "Continue A2"}
            </button>
          </Link>
        ) : (
          <p style={lockedText}>
            🔒 Complete all A1 lessons to unlock A2
          </p>
        )}
      </div>

      {/* ===== B1 ===== */}
      <div
        style={{
          ...cardStyle,
          opacity: isB1Unlocked ? 1 : 0.6,
        }}
      >
        <h3>B1 – Intermediate</h3>

        <ProgressBar
          completed={completedB1}
          total={B1_TOTAL}
        />

        <p style={progressText}>
          {completedB1} / {B1_TOTAL} lessons completed
        </p>

        {isB1Unlocked ? (
          <Link to="/writing/B1">
            <button style={btnStyle}>
              {completedB1 === 0
                ? "Start B1"
                : "Continue B1"}
            </button>
          </Link>
        ) : (
          <p style={lockedText}>
            🔒 Complete all A2 lessons to unlock B1
          </p>
        )}
      </div>
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

const progressText = {
  margin: "10px 0",
  fontWeight: "bold",
};

const lockedText = {
  marginTop: "10px",
  fontWeight: "bold",
  color: "#999",
};

const btnStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: "#e5e9ff",
};

export default WritingHome;

import { Link } from "react-router-dom";

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

function ListeningHome() {
  /* ===== Load progress ===== */
  const completedLessons =
    JSON.parse(localStorage.getItem("completedLessons")) ||
    [];

  /* ===== Totals ===== */
  const A1_TOTAL = 16;
  const A2_TOTAL = 12;
  const B1_TOTAL = 14;

  /* ===== Count per level ===== */
  const completedA1 = completedLessons.filter((id) =>
    id.startsWith("A1-")
  ).length;

  const completedA2 = completedLessons.filter((id) =>
    id.startsWith("A2-")
  ).length;

  const completedB1 = completedLessons.filter((id) =>
    id.startsWith("B1-")
  ).length;

  /* ===== Locking Rules ===== */
  const isA2Unlocked = completedA1 === A1_TOTAL;
  const isB1Unlocked = completedA2 === A2_TOTAL;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* ===== Header ===== */}
      <h2 style={{ marginBottom: "6px" }}>
        🎧 Listening Practice
      </h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Choose a level and improve your listening
        skills step by step.
      </p>

      {/* ===== A1 ===== */}
      <div style={cardStyle}>
        <h3>A1 – Beginner</h3>
        <p>Basic daily conversations.</p>

        <ProgressBar
          completed={completedA1}
          total={A1_TOTAL}
        />

        <p style={progressText}>
          {completedA1} / {A1_TOTAL} lessons
          completed
        </p>

        <Link to="/listening/A1">
          <button style={buttonStyle}>
            Continue A1
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
        <p>
          Longer conversations and real
          situations.
        </p>

        <ProgressBar
          completed={completedA2}
          total={A2_TOTAL}
        />

        <p style={progressText}>
          {completedA2} / {A2_TOTAL} lessons
          completed
        </p>

        {isA2Unlocked ? (
          <Link to="/listening/A2">
            <button style={buttonStyle}>
              Continue A2
            </button>
          </Link>
        ) : (
          <p style={lockedText}>
            🔒 Complete all A1 lessons to unlock
            A2
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
        <p>
          Real stories, opinions, and life
          experiences.
        </p>

        <ProgressBar
          completed={completedB1}
          total={B1_TOTAL}
        />

        <p style={progressText}>
          {completedB1} / {B1_TOTAL} lessons
          completed
        </p>

        {isB1Unlocked ? (
          <Link to="/listening/B1">
            <button style={buttonStyle}>
              Continue B1
            </button>
          </Link>
        ) : (
          <p style={lockedText}>
            🔒 Complete all A2 lessons to unlock
            B1
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
  boxShadow:
    "0 4px 12px rgba(0,0,0,0.08)",
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

const buttonStyle = {
  padding: "8px 14px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  backgroundColor: "#4A90E2",
  color: "white",
  fontWeight: "bold",
};

export default ListeningHome;

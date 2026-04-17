import { Link } from "react-router-dom";

import STORAGE_KEYS from "../utils/storageKeys";
import {
  countCompletedByLevel
} from "../utils/progressStorage";
import { WRITING_CURRICULUM, WRITING_LEVEL_ORDER } from "./writingCurriculum";

/* ===== Small Progress Bar ===== */
function ProgressBar({ completed, total }) {
  const rawPercent =
    total === 0 ? 0 : Math.round((completed / total) * 100);
  const percent = Math.min(100, Math.max(0, rawPercent));

  return (
    <div style={{ margin: "10px 0" }}>
      <div
        style={{
          height: "8px",
          backgroundColor: "#ede7ff",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6c4de6, #58cc6a)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <small style={{ color: "#5c6370" }}>
        {percent}% completed
      </small>
    </div>
  );
}

function WritingHome() {
  const progressByLevel = WRITING_LEVEL_ORDER.map((level) => {
    const total = Object.keys(WRITING_CURRICULUM[level] || {}).length;
    const completed = countCompletedByLevel(
      STORAGE_KEYS.WRITING_COMPLETED,
      level
    );
    return { level, total, completed };
  });

  const isUnlocked = (index) => {
    if (index === 0) return true;
    const prev = progressByLevel[index - 1];
    return prev.completed >= prev.total;
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <h2>✍️ Writing Practice</h2>

      <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
        Practice writing short texts to organize your ideas,
        improve grammar, and express yourself more clearly.
      </p>

      <p style={{ marginTop: "10px", fontStyle: "italic" }}>
        Focus on clarity, not perfection.
      </p>

      {progressByLevel.map((item, index) => {
        const unlocked = isUnlocked(index);
        const previous = progressByLevel[index - 1];
        const levelTitle = {
          A1: "Beginner",
          A2: "Elementary",
          B1: "Intermediate",
          B2: "Upper-Intermediate",
          C1: "Advanced",
        }[item.level];

        return (
          <div
            key={item.level}
            style={{
              ...cardStyle,
              opacity: unlocked ? 1 : 0.6,
            }}
          >
            <h3>{item.level} - {levelTitle}</h3>

            <ProgressBar
              completed={Math.min(item.completed, item.total)}
              total={item.total}
            />

            <p style={progressText}>
              {Math.min(item.completed, item.total)} / {item.total} lessons completed
            </p>

            {unlocked ? (
              <Link to={`/writing/${item.level}`}>
                <button style={btnStyle}>
                  {item.completed === 0
                    ? `Start ${item.level}`
                    : `Continue ${item.level}`}
                </button>
              </Link>
            ) : (
              <p style={lockedText}>
                🔒 Complete all {previous.level} lessons to unlock {item.level}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ===== Styles ===== */
const cardStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "14px",
  marginBottom: "14px",
  border: "1px solid #ece8fb",
  boxShadow: "0 6px 16px rgba(45,37,89,0.08)",
};

const progressText = {
  margin: "10px 0",
  fontWeight: "bold",
};

const lockedText = {
  marginTop: "10px",
  fontWeight: "bold",
  color: "#7b8190",
};

const btnStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "1px solid #583bc4",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: "#6c4de6",
  color: "#fff",
};

export default WritingHome;



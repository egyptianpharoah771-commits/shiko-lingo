import { Link, useParams } from "react-router-dom";
import FeedbackBox from "../components/FeedbackBox";

// 🔐 Feature Gating
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

import STORAGE_KEYS from "../utils/storageKeys";

/* ===== Progress Bar (shared UX) ===== */
function ProgressBar({ completed, total }) {
  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div style={{ margin: "12px 0 20px" }}>
      <div
        style={{
          height: "6px",
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

/* ===== Lessons Config ===== */
const READING_LESSONS_BY_LEVEL = {
  A1: [
    { id: "lesson1", title: "My Daily Routine" },
    { id: "lesson2", title: "My Family" },
    { id: "lesson3", title: "My Hobbies" },
    { id: "lesson4", title: "My Favorite Food" },
    { id: "lesson5", title: "My Job" },
  ],
  A2: [
    { id: "lesson1", title: "A Busy Day" },
    { id: "lesson2", title: "A Memorable Trip" },
    { id: "lesson3", title: "Healthy Habits" },
    { id: "lesson4", title: "Life in the City" },
    { id: "lesson5", title: "Technology Today" },
    { id: "lesson6", title: "Learning English" },
  ],
  B1: [
    { id: "lesson1", title: "Work and Life Balance" },
    { id: "lesson2", title: "Social Media Effects" },
    { id: "lesson3", title: "Education Today" },
    { id: "lesson4", title: "Living Abroad" },
    { id: "lesson5", title: "Future Plans" },
    { id: "lesson6", title: "Personal Opinions" },
  ],
};

function ReadingLevel() {
  const { level } = useParams();

  /* ===== Feature Gating ===== */
  const { canAccess } = useFeatureAccess({
    skill: "Reading",
    level,
  });

  if (!canAccess) {
    return (
      <LockedFeature title={`Reading Level ${level}`} />
    );
  }

  const lessons = READING_LESSONS_BY_LEVEL[level] || [];

  const completedLessons =
    JSON.parse(
      localStorage.getItem(
        STORAGE_KEYS.READING_COMPLETED
      )
    ) || [];

  /* ===== Progress ===== */
  const completedCount = lessons.filter((lesson) =>
    completedLessons.includes(`${level}-${lesson.id}`)
  ).length;

  const levelCompleted =
    lessons.length > 0 &&
    completedCount === lessons.length;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "6px" }}>
        📘 Reading – Level {level}
      </h2>
      <p style={{ color: "#666" }}>
        Complete lessons in order to unlock the next
        ones.
      </p>

      <ProgressBar
        completed={completedCount}
        total={lessons.length}
      />

      {levelCompleted && (
        <div
          style={{
            backgroundColor: "#e8f5e9",
            border: "1px solid #c8e6c9",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h3>🎉 Level Completed!</h3>
          <p>
            You’ve completed Reading – Level {level}.
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <Link to="/dashboard">
              <button style={buttonStyle}>
                Go to Dashboard
              </button>
            </Link>
            <Link to="/reading">
              <button
                style={{
                  ...buttonStyle,
                  backgroundColor: "#6c757d",
                }}
              >
                Choose Another Level
              </button>
            </Link>
          </div>
        </div>
      )}

      {lessons.map((lesson, index) => {
        const lessonKey = `${level}-${lesson.id}`;

        const isCompleted =
          completedLessons.includes(lessonKey);

        const isUnlocked =
          index === 0 ||
          completedLessons.includes(
            `${level}-${lessons[index - 1].id}`
          );

        return (
          <div key={lesson.id} style={cardStyle}>
            <h4>
              Lesson {index + 1}: {lesson.title}
            </h4>

            {isUnlocked ? (
              <Link
                to={`/reading/${level}/${lesson.id}`}
              >
                <button style={buttonStyle}>
                  {isCompleted
                    ? "Review Lesson"
                    : "Start Lesson"}
                </button>
              </Link>
            ) : (
              <p style={{ color: "#999" }}>
                🔒 Complete previous lesson to unlock
              </p>
            )}
          </div>
        );
      })}

      <FeedbackBox skill="Reading" level={level} />
    </div>
  );
}

/* ===== Styles ===== */
const cardStyle = {
  backgroundColor: "#fff",
  padding: "16px",
  borderRadius: "12px",
  marginBottom: "14px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
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

export default ReadingLevel;

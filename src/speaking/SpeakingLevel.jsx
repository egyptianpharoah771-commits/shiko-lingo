import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import FeedbackBox from "../components/FeedbackBox";

import STORAGE_KEYS from "../utils/storageKeys";

// 🔐 Feature Gating
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

/* ======================
   Progress Bar
====================== */
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

/* ======================
   Lessons count by level
====================== */
const LESSONS_BY_LEVEL = {
  A1: 5,
  A2: 6,
  B1: 6,
};

function SpeakingLevel() {
  const { level } = useParams();

  /* ===== Feature Access ===== */
  const { canAccess } = useFeatureAccess({
    skill: "Speaking",
    level,
  });

  /* ===== Completed lessons ===== */
  const completedLessons = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEYS.SPEAKING_COMPLETED
        )
      ) || []
    );
  }, []);

  /* ===== Guard: invalid level ===== */
  if (!LESSONS_BY_LEVEL[level]) {
    return <p>Invalid level.</p>;
  }

  /* 🔒 Lock AFTER hooks */
  if (!canAccess) {
    return (
      <LockedFeature
        title={`Speaking Level ${level}`}
      />
    );
  }

  const lessonCount = LESSONS_BY_LEVEL[level];

  const lessons = Array.from(
    { length: lessonCount },
    (_, i) => `lesson${i + 1}`
  );

  /* ===== Progress ===== */
  const completedCount = lessons.filter(
    (lesson) =>
      completedLessons.includes(`${level}-${lesson}`)
  ).length;

  const levelCompleted =
    lessonCount > 0 &&
    completedCount === lessonCount;

  const isLessonUnlocked = (index) => {
    if (index === 0) return true;
    return completedLessons.includes(
      `${level}-lesson${index}`
    );
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h3>🎤 Speaking – Level {level}</h3>

      <ProgressBar
        completed={completedCount}
        total={lessonCount}
      />

      {/* ===== Level Completed ===== */}
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
            You’ve completed Speaking – Level{" "}
            {level}. Great job!
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <Link to="/dashboard">
              <button className="primary-btn">
                Go to Dashboard
              </button>
            </Link>
            <Link to="/speaking">
              <button className="secondary-btn">
                Choose Another Level
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ===== Lessons Grid ===== */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {lessons.map((lesson, index) => {
          const lessonKey = `${level}-${lesson}`;
          const isCompleted =
            completedLessons.includes(lessonKey);
          const unlocked =
            isLessonUnlocked(index);

          const lessonLink =
            level === "B1"
              ? `/speaking/B1/${lesson}`
              : `/speaking/${level}/${lesson}`;

          return (
            <div
              key={lesson}
              style={{
                width: "180px",
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: isCompleted
                  ? "#d4edda"
                  : unlocked
                  ? "#e5e9ff"
                  : "#eee",
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <h4>Lesson {index + 1}</h4>

              {isCompleted && <p>✅ Completed</p>}
              {!isCompleted && unlocked && (
                <p>🟢 Active</p>
              )}
              {!unlocked && <p>🔒 Locked</p>}

              {unlocked && (
                <Link to={lessonLink}>
                  <button className="primary-btn">
                    Open
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <FeedbackBox
        skill="Speaking"
        level={level}
      />
    </div>
  );
}

export default SpeakingLevel;

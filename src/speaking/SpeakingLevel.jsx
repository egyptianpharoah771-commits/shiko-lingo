import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import FeedbackBox from "../components/FeedbackBox";

import STORAGE_KEYS from "../utils/storageKeys";

// 🔐 Feature Gating
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";
import { SPEAKING_CURRICULUM } from "./speakingCurriculum";

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

/* ======================
   Lessons count by level
====================== */
const LESSONS_BY_LEVEL = Object.fromEntries(
  Object.entries(SPEAKING_CURRICULUM).map(([level, lessons]) => [
    level,
    Object.keys(lessons || {}).length,
  ])
);

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
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      <h3>🎤 Speaking – Level {level}</h3>

      <ProgressBar
        completed={completedCount}
        total={lessonCount}
      />

      {/* ===== Level Completed ===== */}
      {levelCompleted && (
        <div
          style={{
            backgroundColor: "#f3fdf4",
            border: "1px solid #b9eec2",
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
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        {lessons.map((lesson, index) => {
          const lessonKey = `${level}-${lesson}`;
          const isCompleted =
            completedLessons.includes(lessonKey);
          const unlocked =
            isLessonUnlocked(index);

          const lessonLink = `/speaking/${level}/${lesson}`;

          return (
            <div
              key={lesson}
              style={{
                padding: "12px",
                borderRadius: "12px",
                backgroundColor: isCompleted
                  ? "#eefbf0"
                  : unlocked
                  ? "#f3efff"
                  : "#f1f3f6",
                border: isCompleted
                  ? "1px solid #b9eec2"
                  : unlocked
                  ? "1px solid #d8cbff"
                  : "1px solid #e1e5ea",
                boxShadow: "0 4px 12px rgba(45,37,89,0.06)",
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



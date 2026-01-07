import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import FeedbackBox from "../components/FeedbackBox";

import STORAGE_KEYS from "../utils/storageKeys";

// 🔐 Feature Gating
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

// 🤖 AI Client
import { askAITutor } from "../utils/aiClient";

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

function WritingLevel() {
  const { level } = useParams();

  /* ===== Hooks FIRST ===== */
  const {
    canAccess,
    userId,
    packageName,
  } = useFeatureAccess({
    skill: "Writing", // ✅ unified
    level,
  });

  const lessonCount =
    LESSONS_BY_LEVEL[level] || 0;

  const lessons = Array.from(
    { length: lessonCount },
    (_, i) => `lesson${i + 1}`
  );

  const completed = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEYS.WRITING_COMPLETED
        )
      ) || []
    );
  }, []);

  /* ===== Guards AFTER hooks ===== */
  if (!canAccess) {
    return (
      <LockedFeature
        title={`Writing Level ${level}`}
      />
    );
  }

  if (!LESSONS_BY_LEVEL[level]) {
    return <p>Invalid level.</p>;
  }

  /* ===== Progress ===== */
  const completedCount = lessons.filter(
    (lesson) =>
      completed.includes(`${level}-${lesson}`)
  ).length;

  const levelCompleted =
    lessonCount > 0 &&
    completedCount === lessonCount;

  /* ===== Lesson Unlock ===== */
  const isLessonUnlocked = (index) => {
    if (index === 0) return true;
    const prevKey = `${level}-lesson${index}`;
    return completed.includes(prevKey);
  };

  /* ===== AI Tutor (Level intro) ===== */
  const askAI = async () => {
    const res = await askAITutor({
      skill: "Writing",
      level,
      lessonTitle: `Writing Level ${level}`,
      prompt: `
You are an English writing tutor.
Explain what the student will learn in Writing level ${level}.
Use simple English suitable for ${level}.
Give 3 short writing tips.
Encourage the student to keep writing.
      `,
      userId,
      packageName,
    });

    if (res.status === "SUCCESS") {
      alert(res.message);
    } else if (res.status === "LIMIT") {
      alert(res.message);
    } else {
      alert("AI service unavailable.");
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h3>✍️ Writing – Level {level}</h3>

      {/* 🤖 AI Tutor */}
      <button
        onClick={askAI}
        style={{
          marginBottom: "18px",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          backgroundColor: "#000",
          color: "white",
          fontWeight: "bold",
        }}
      >
        🤖 Ask AI Tutor
      </button>

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
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          <h3>🎉 Level Completed!</h3>
          <p>
            You’ve completed Writing – Level{" "}
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
            <Link to="/writing">
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
            completed.includes(lessonKey);
          const unlocked =
            isLessonUnlocked(index);

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
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <h4>Lesson {index + 1}</h4>

              {isCompleted && <p>✅ Completed</p>}
              {!isCompleted && unlocked && (
                <p>🟢 Active</p>
              )}
              {!unlocked && <p>🔒 Locked</p>}

              {unlocked && (
                <Link
                  to={`/writing/${level}/${lesson}`}
                >
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
        skill="Writing"
        level={level}
      />
    </div>
  );
}

export default WritingLevel;

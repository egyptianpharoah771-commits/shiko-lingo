import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FeedbackBox from "./components/FeedbackBox";

import { useFeatureAccess } from "./hooks/useFeatureAccess";
import LockedFeature from "./components/LockedFeature";

import STORAGE_KEYS from "./utils/storageKeys";

/* =========================
   Reading Level Page
   ✅ Full File – Copy/Paste Ready
   ✅ Dynamic index.json (no hardcoded lessons)
   ✅ Supports array schema OR { lessons: [] }
   ✅ Same architecture as ListeningLevel
========================= */

/* ===== Progress Bar ===== */
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

function ReadingLevel() {
  const { level } = useParams();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const { canAccess } = useFeatureAccess({
    skill: "Reading",
    level,
  });

  /* ===== Load Lessons Dynamically ===== */
  useEffect(() => {
    let mounted = true;

    const loadLessons = async () => {
      try {
        const res = await fetch(
          `/reading/${level}/index.json`
        );

        if (!res.ok) {
          if (mounted) setLessons([]);
          return;
        }

        const data = await res.json();

        let structured = [];

        if (Array.isArray(data)) {
          structured = data;
        } else if (Array.isArray(data?.lessons)) {
          structured = data.lessons;
        }

        if (mounted) {
          setLessons(structured);
        }
      } catch (err) {
        console.error("Reading fetch error:", err);
        if (mounted) setLessons([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLessons();

    return () => {
      mounted = false;
    };
  }, [level]);

  /* ===== Guards ===== */
  if (!canAccess) {
    return (
      <LockedFeature
        title={`Reading Level ${level}`}
      />
    );
  }

  if (loading) {
    return <p>Loading lessons…</p>;
  }

  const completedLessons =
    JSON.parse(
      localStorage.getItem(
        STORAGE_KEYS.READING_COMPLETED
      )
    ) || [];

  /* ===== Progress ===== */
  const completedCount = lessons.filter(
    (lesson) =>
      completedLessons.includes(
        `${level}-${lesson.id}`
      )
  ).length;

  const levelCompleted =
    lessons.length > 0 &&
    completedCount === lessons.length;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "6px" }}>
        📘 Reading – Level {level}
      </h2>
      <p style={{ color: "#5c6370" }}>
        Complete lessons in order to unlock the next
        ones.
      </p>

      <ProgressBar
        completed={completedCount}
        total={lessons.length}
      />

      {lessons.length === 0 && (
        <p style={{ color: "red" }}>
          No lessons found for this level.
        </p>
      )}

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
            You’ve completed Reading – Level{" "}
            {level}.
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
                  backgroundColor: "#7b8190",
                  border: "1px solid #6a707e",
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

        const lessonNumber =
          lesson.lesson ??
          lesson.lessonNumber ??
          index + 1;

        const lessonTitle =
          lesson.title || "Untitled Lesson";

        return (
          <div key={lesson.id} style={cardStyle}>
            <h4>
              Lesson {lessonNumber}:{" "}
              {lessonTitle}
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

      <FeedbackBox
        skill="Reading"
        level={level}
      />
    </div>
  );
}

/* ===== Styles ===== */

const cardStyle = {
  backgroundColor: "#fff",
  padding: "16px",
  borderRadius: "14px",
  marginBottom: "12px",
  border: "1px solid #ece8fb",
  boxShadow: "0 6px 16px rgba(45,37,89,0.08)",
};

const buttonStyle = {
  padding: "10px 16px",
  border: "1px solid #583bc4",
  borderRadius: "10px",
  cursor: "pointer",
  backgroundColor: "#6c4de6",
  color: "white",
  fontWeight: "bold",
};

export default ReadingLevel;



import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FeedbackBox from "../components/FeedbackBox";

import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

import STORAGE_KEYS from "../utils/storageKeys";

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

function ListeningLevel() {
  const { level } = useParams();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const { canAccess } = useFeatureAccess({
    skill: "Listening",
    level,
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`/listening/${level}/index.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;

        let parsed = [];

        if (Array.isArray(data)) {
          parsed = data;
        } else if (Array.isArray(data?.lessons)) {
          parsed = data.lessons;
        }

        setLessons(parsed);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setLessons([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [level]);

  if (!canAccess) {
    return <LockedFeature title={`Listening Level ${level}`} />;
  }

  if (loading) return <p>Loading lessons…</p>;

  const completedLessons =
    JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTENING_COMPLETED)
    ) || [];

  const completedCount = lessons.filter((lesson) =>
    completedLessons.includes(`${level}-${lesson.id}`)
  ).length;

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>🎧 Listening – Level {level}</h2>

      <ProgressBar
        completed={completedCount}
        total={lessons.length}
      />

      {lessons.length === 0 && (
        <p style={{ color: "red" }}>
          No lessons found for this level.
        </p>
      )}

      {lessons.map((lesson, index) => {
        const lessonKey = `${level}-${lesson.id}`;
        const isCompleted =
          completedLessons.includes(lessonKey);

        const previousLesson =
          index > 0 ? lessons[index - 1] : null;

        const isUnlocked =
          index === 0 ||
          completedLessons.includes(
            `${level}-${previousLesson?.id}`
          );

        return (
          <div
            key={lesson.id}
            style={{
              backgroundColor: "#fff",
              padding: "16px",
              borderRadius: "12px",
              marginBottom: "14px",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.06)",
            }}
          >
            <h4>
              Lesson {lesson.lessonNumber ?? index + 1} –{" "}
              {lesson.title}
            </h4>

            {isUnlocked ? (
              <Link
                to={`/listening/${level}/${lesson.id}`}
              >
                <button
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    backgroundColor: "#4A90E2",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
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

      <FeedbackBox skill="Listening" level={level} />
    </div>
  );
}

export default ListeningLevel;
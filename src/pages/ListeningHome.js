import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import STORAGE_KEYS from "../utils/storageKeys";

/* =========================
   Config
========================= */

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

/* =========================
   Progress Bar
========================= */

function ProgressBar({ completed, total }) {
  const percent =
    total === 0 ? 0 : Math.round((completed / total) * 100);

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

/* =========================
   Listening Home
   ✅ Supports new scalable index schema
   ✅ Backward compatible
========================= */

function ListeningHome() {
  const [levelsData, setLevelsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadLevels = async () => {
      try {
        const results = await Promise.all(
          LEVELS.map(async (level) => {
            try {
              const res = await fetch(
                `/listening/${level}/index.json`
              );

              if (!res.ok) {
                return { level, lessons: [] };
              }

              const data = await res.json();

              let lessons = [];

              // ✅ New schema (array)
              if (Array.isArray(data)) {
                lessons = data;
              }

              // ✅ Old schema (object with lessons)
              else if (Array.isArray(data?.lessons)) {
                lessons = data.lessons;
              }

              return { level, lessons };
            } catch {
              return { level, lessons: [] };
            }
          })
        );

        if (!mounted) return;

        const structured = {};
        results.forEach((r) => {
          structured[r.level] = r.lessons;
        });

        setLevelsData(structured);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadLevels();

    return () => {
      mounted = false;
    };
  }, []);

  const completedLessons =
    JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LISTENING_COMPLETED)
    ) || [];

  const getCompletedCount = (level, lessons) => {
    const validLessonIds = lessons.map(
      (l) => `${level}-${l.id}`
    );

    return completedLessons.filter((id) =>
      validLessonIds.includes(id)
    ).length;
  };

  const isLevelUnlocked = (index) => {
    if (index === 0) return true;

    const previousLevel = LEVELS[index - 1];
    const previousLessons =
      levelsData[previousLevel] || [];

    const completedPrevious =
      getCompletedCount(previousLevel, previousLessons);

    return (
      previousLessons.length > 0 &&
      completedPrevious >= previousLessons.length
    );
  };

  if (loading) {
    return <p>Loading Listening levels…</p>;
  }

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "6px" }}>
        🎧 Listening Practice
      </h2>
      <p style={{ color: "#5c6370", marginBottom: "24px" }}>
        Choose a level and improve your listening
        skills step by step.
      </p>

      {LEVELS.map((level, index) => {
        const lessons = levelsData[level] || [];
        const total = lessons.length;
        const completed = getCompletedCount(
          level,
          lessons
        );
        const unlocked = isLevelUnlocked(index);

        return (
          <div
            key={level}
            style={{
              ...cardStyle,
              opacity: unlocked ? 1 : 0.6,
            }}
          >
            <h3>{level} – Listening</h3>

            <ProgressBar
              completed={completed}
              total={total}
            />

            <p style={progressText}>
              {completed} / {total} lessons completed
            </p>

            {unlocked ? (
              <Link to={`/listening/${level}`}>
                <button style={buttonStyle}>
                  Continue {level}
                </button>
              </Link>
            ) : (
              <p style={lockedText}>
                🔒 Complete previous level to unlock
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   Styles
========================= */

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

const buttonStyle = {
  padding: "10px 16px",
  border: "1px solid #583bc4",
  borderRadius: "10px",
  cursor: "pointer",
  backgroundColor: "#6c4de6",
  color: "white",
  fontWeight: "bold",
};

export default ListeningHome;



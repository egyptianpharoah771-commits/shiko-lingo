import { Link } from "react-router-dom";

/* ===== CONSTANT ===== */
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

function getSafePlacementLevel() {
  try {
    const value = localStorage.getItem("placementLevel");

    if (!value) return null;

    if (!LEVELS.includes(value)) return null;

    return value;
  } catch {
    return null;
  }
}

function GrammarLevels() {
  const placementLevel = getSafePlacementLevel();

  const isUnlocked = (level) => {
    if (!placementLevel) return true;

    const currentIndex = LEVELS.indexOf(level);
    const placementIndex = LEVELS.indexOf(placementLevel);

    if (currentIndex === -1 || placementIndex === -1) return true;

    return currentIndex <= placementIndex;
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <h2>📘 Grammar</h2>
      <p style={{ color: "#5c6370" }}>
        Select your grammar level
      </p>

      {LEVELS.map((level) => {
        const unlocked = isUnlocked(level);

        return (
          <div
            key={level}
            style={{
              marginBottom: "12px",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: unlocked
                ? "#f3efff"
                : "#f1f3f6",
              border: unlocked
                ? "1px solid #d8cbff"
                : "1px solid #e1e5ea",
              boxShadow: "0 4px 12px rgba(45,37,89,0.06)",
              opacity: unlocked ? 1 : 0.6,
            }}
          >
            <h4>Level {level}</h4>

            {unlocked ? (
              <Link to={`/grammar/${level}`}>
                <button className="primary-btn">
                  Open
                </button>
              </Link>
            ) : (
              <button disabled>
                🔒 Locked
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default GrammarLevels;
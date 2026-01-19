import { Link } from "react-router-dom";

function GrammarLevels() {
  const placementLevel =
    localStorage.getItem("placementLevel");

  // ===== UPDATED LEVELS =====
  const levels = ["A1", "A2", "B1", "B2", "C1"];

  const isUnlocked = (level) => {
    if (!placementLevel) return true;

    return (
      levels.indexOf(level) <=
      levels.indexOf(placementLevel)
    );
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>📘 Grammar</h2>
      <p style={{ color: "#666" }}>
        Select your grammar level
      </p>

      {levels.map((level) => {
        const unlocked = isUnlocked(level);

        return (
          <div
            key={level}
            style={{
              marginBottom: "14px",
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: unlocked
                ? "#e5e9ff"
                : "#eee",
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

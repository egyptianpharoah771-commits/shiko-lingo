import { Link } from "react-router-dom";

function GrammarLevels() {
  const placementLevel =
    localStorage.getItem("placementLevel");

  const levels = ["A1", "A2", "B1"];

  const isUnlocked = (level) => {
    if (!placementLevel) return true;
    return levels.indexOf(level) <=
      levels.indexOf(placementLevel);
  };

  return (
    <div>
      <h2>📘 Grammar</h2>
      <p>Select your level</p>

      {levels.map(level => {
        const unlocked = isUnlocked(level);

        return (
          <div key={level} style={{ marginBottom: "10px" }}>
            {unlocked ? (
              <Link to={`/grammar/${level}`}>
                <button>{level}</button>
              </Link>
            ) : (
              <button disabled>
                🔒 {level}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default GrammarLevels;

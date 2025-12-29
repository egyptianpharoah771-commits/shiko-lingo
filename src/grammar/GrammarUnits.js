import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

// ===== Constants =====
const LEVELS_ORDER = ["A1", "A2", "B1"];

const UNITS_BY_LEVEL = {
  A1: [
    { id: "unit1", title: "Present Simple" },
    { id: "unit2", title: "Present Continuous" },
  ],
  A2: [
    { id: "unit1", title: "Past Simple" },
    { id: "unit2", title: "Past Continuous" },
  ],
  B1: [
    { id: "unit1", title: "Present Perfect" },
    { id: "unit2", title: "Present Perfect vs Past Simple" },
    { id: "unit3", title: "Future Forms (will / going to)" },
  ],
};

function GrammarUnits() {
  const { level } = useParams();
  const navigate = useNavigate();

  // ===== Placement =====
  const placementLevel = localStorage.getItem("placementLevel");

  // ===== Completed Units (memoized) =====
  const completed = useMemo(() => {
    return (
      JSON.parse(localStorage.getItem("completedGrammarUnits")) ||
      []
    );
  }, []);

  // ===== Units for current level =====
  const units = useMemo(() => {
    return UNITS_BY_LEVEL[level] || [];
  }, [level]);

  // ===== Level Lock =====
  const levelUnlocked =
    !placementLevel ||
    LEVELS_ORDER.indexOf(level) <=
      LEVELS_ORDER.indexOf(placementLevel);

  // ===== Unit Locking (sequential) =====
  const isUnitUnlocked = (index) => {
    if (index === 0) return true;
    const prevUnitKey = `${level}-${units[index - 1].id}`;
    return completed.includes(prevUnitKey);
  };

  // ===== Auto-open first unit (placement smart) =====
  useEffect(() => {
    if (!placementLevel) return;
    if (placementLevel !== level) return;
    if (units.length === 0) return;

    const firstUnitKey = `${level}-${units[0].id}`;
    if (completed.includes(firstUnitKey)) return;

    navigate(`/grammar/${level}/${units[0].id}`);
  }, [placementLevel, level, units, completed, navigate]);

  // ===== Guard =====
  if (!levelUnlocked) {
    return (
      <p>
        🔒 This level is locked based on your placement test.
      </p>
    );
  }

  return (
    <div>
      <h2>{level} Grammar</h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {units.map((unit, index) => {
          const unitKey = `${level}-${unit.id}`;
          const completedUnit = completed.includes(unitKey);
          const unlocked = isUnitUnlocked(index);

          return (
            <div
              key={unit.id}
              style={{
                width: "220px",
                padding: "15px",
                borderRadius: "12px",
                backgroundColor: completedUnit
                  ? "#d4edda"
                  : unlocked
                  ? "#e5e9ff"
                  : "#eee",
                opacity: unlocked ? 1 : 0.6,
                boxShadow:
                  "0 4px 10px rgba(0,0,0,0.08)",
              }}
            >
              <h4>{unit.title}</h4>

              {completedUnit && <p>✅ Completed</p>}
              {!completedUnit && unlocked && <p>🟢 Active</p>}
              {!unlocked && <p>🔒 Locked</p>}

              {unlocked && (
                <Link to={`/grammar/${level}/${unit.id}`}>
                  <button
                    style={{
                      marginTop: "10px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Open
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GrammarUnits;

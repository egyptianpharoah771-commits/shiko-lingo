import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";

import STORAGE_KEYS from "../utils/storageKeys";

/* ===== Units by level ===== */
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
  B2: [
    { id: "unit1", title: "Passive Voice (All Tenses)" },
    { id: "unit2", title: "Conditionals (Zero, First, Second, Third)" },
    { id: "unit3", title: "Reported Speech" },
    { id: "unit4", title: "Modal Verbs (Obligation, Deduction)" },
  ],
  C1: [
    { id: "unit1", title: "Advanced Sentence Structures" },
    { id: "unit2", title: "Inversion & Emphasis" },
    { id: "unit3", title: "Advanced Linking & Cohesion" },
    { id: "unit4", title: "Nuance, Tone & Formality" },
  ],
};

function GrammarUnits() {
  const { level } = useParams();

  const completedUnits = useMemo(() => {
    return (
      JSON.parse(
        localStorage.getItem(STORAGE_KEYS.GRAMMAR_COMPLETED)
      ) || []
    );
  }, []);

  const units = useMemo(() => {
    return UNITS_BY_LEVEL[level] || [];
  }, [level]);

  if (!UNITS_BY_LEVEL[level]) {
    return <p>Invalid level.</p>;
  }

  const isUnitUnlocked = (index) => {
    if (index === 0) return true;
    const prevKey = `${level}-${units[index - 1].id}`;
    return completedUnits.includes(prevKey);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2>📘 Grammar – Level {level}</h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        {units.map((unit, index) => {
          const unitKey = `${level}-${unit.id}`;
          const completed = completedUnits.includes(unitKey);
          const unlocked = isUnitUnlocked(index);

          return (
            <div
              key={unitKey}
              style={{
                width: "220px",
                padding: "15px",
                borderRadius: "12px",
                backgroundColor: completed
                  ? "#d4edda"
                  : unlocked
                  ? "#e5e9ff"
                  : "#eee",
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <h4>{unit.title}</h4>

              {completed && <p>✅ Completed</p>}
              {!completed && unlocked && <p>🟢 Active</p>}
              {!unlocked && <p>🔒 Locked</p>}

              {unlocked && (
                <Link to={`/grammar/${level}/${unit.id}`}>
                  <button type="button">Open</button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "20px" }}>
        <Link to="/grammar">← Back to Grammar</Link>
      </div>
    </div>
  );
}

export default GrammarUnits;

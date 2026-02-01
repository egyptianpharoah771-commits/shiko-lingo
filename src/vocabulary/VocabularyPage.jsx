import { Link } from "react-router-dom";
import VOCABULARY_INDEX from "./vocabularyIndex";
import "./Vocabulary.css";

const LEVEL_COLORS = {
  A1: "#4A90E2",
  A2: "#43A047",
  B1: "#F9A825",
  B2: "#FB8C00",
  C1: "#D81B60",
};

function getProgress(level) {
  const key = `vocabularyProgress_${level}`;
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    return data.completedUnits || [];
  } catch {
    return [];
  }
}

function VocabularyPage() {
  return (
    <div className="vocab-page">
      <h1>📘 Vocabulary</h1>

      {Object.keys(VOCABULARY_INDEX).map((level) => {
        const completed = getProgress(level);
        const total = VOCABULARY_INDEX[level].length;
        const percent = Math.round(
          (completed.length / total) * 100
        );

        return (
          <div
            key={level}
            className={`vocab-level level-${level}`}
          >
            {/* ===== Header ===== */}
            <div className="vocab-level-header">
              <div>
                <div className="vocab-level-title">
                  {level} Vocabulary
                </div>
                <div className="vocab-level-subtitle">
                  {completed.length} / {total} units completed
                </div>
              </div>
            </div>

            {/* ===== Progress ===== */}
            <div className="vocab-progress">
              <div
                className="vocab-progress-fill"
                style={{
                  width: `${percent}%`,
                  background: LEVEL_COLORS[level],
                }}
              />
            </div>

            {/* ===== Units ===== */}
            <div className="vocab-units">
              {VOCABULARY_INDEX[level].map((unit) => {
                const isUnlocked =
                  unit.id === 1 ||
                  completed.includes(unit.id - 1);

                return isUnlocked ? (
                  <Link
                    key={unit.id}
                    to={`/vocabulary/${level}/${unit.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="vocab-card">
                      <div className="vocab-card-icon">📗</div>
                      <div className="vocab-card-title">
                        Unit {unit.id}
                      </div>
                      <div className="vocab-card-desc">
                        <strong>{unit.title}</strong>
                        <br />
                        {unit.description}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={unit.id}
                    className="vocab-card locked"
                  >
                    <div className="vocab-card-icon">🔒</div>
                    <div className="vocab-card-title">
                      Unit {unit.id}
                    </div>
                    <div className="vocab-card-desc">
                      Complete previous unit
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VocabularyPage;

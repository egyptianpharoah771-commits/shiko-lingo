import { Link } from "react-router-dom";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

const LEVEL_COLORS = {
  A1: "#4A90E2",
  A2: "#43A047",
  B1: "#F9A825",
  B2: "#FB8C00",
  C1: "#D81B60",
};

function getProgress(level) {
  const key = `vocabularyProgress_${level}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).completedUnits || [] : [];
  } catch {
    return [];
  }
}

function VocabularyPage() {
  const levels = Object.keys(VOCABULARY_DATA || {});

  return (
    <div className="vocab-page">
      <h1>📘 Vocabulary</h1>

      {levels.map((level) => {
        const units = Object.values(VOCABULARY_DATA[level] || {});
        const completed = getProgress(level);

        return (
          <div key={level} className={`vocab-level level-${level}`}>
            <div className="vocab-level-header">
              <div>
                <div className="vocab-level-title">{level} Vocabulary</div>
                <div className="vocab-level-subtitle">
                  {completed.length} / {units.length} units completed
                </div>
              </div>
            </div>

            <div className="vocab-progress">
              <div
                className="vocab-progress-fill"
                style={{
                  width: `${Math.round((completed.length / units.length) * 100) || 0}%`,
                  background: LEVEL_COLORS[level],
                }}
              />
            </div>

            <div className="vocab-units">
              {units.map((unit, index) => {
                const unitNumber = index + 1;
                const unlocked =
                  unitNumber === 1 ||
                  completed.includes(unitNumber - 1);

                return unlocked ? (
                  <Link
                    key={unitNumber}
                    to={`/vocabulary/${level}/${unitNumber}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="vocab-card">
                      <div className="vocab-card-icon">📗</div>
                      <div className="vocab-card-title">
                        Unit {unitNumber}
                      </div>
                      <div className="vocab-card-desc">
                        <strong>{unit.content?.title}</strong>
                        <br />
                        {unit.content?.description}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div key={unitNumber} className="vocab-card locked">
                    <div className="vocab-card-icon">🔒</div>
                    <div className="vocab-card-title">
                      Unit {unitNumber}
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

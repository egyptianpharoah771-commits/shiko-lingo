import { Link, useParams } from "react-router-dom";
import VOCABULARY_INDEX from "./vocabularyIndex";
import "./Vocabulary.css";

function VocabularyLevelPage() {
  const { level } = useParams(); // A1 / A2 / B1 / B2 / C1
  const normalizedLevel = level?.toUpperCase();

  const units = VOCABULARY_INDEX[normalizedLevel];

  // 🔑 Progress key per level
  const STORAGE_KEY = `vocabularyProgress_${normalizedLevel}`;
  const raw = localStorage.getItem(STORAGE_KEY);
  const progress = raw ? JSON.parse(raw) : { completedUnits: [] };

  const isUnlocked = (unitId) => {
    if (unitId === 1) return true;
    return progress.completedUnits.includes(unitId - 1);
  };

  if (!units) {
    return <p style={{ padding: 20 }}>Invalid vocabulary level</p>;
  }

  const completedCount = progress.completedUnits.length;
  const totalUnits = units.length;
  const progressPercent = Math.min(
    Math.round((completedCount / totalUnits) * 100),
    100
  );

  return (
    <div className="vocab-page">
      <div className={`vocab-level level-${normalizedLevel}`}>
        {/* ===== Header ===== */}
        <div className="vocab-level-header">
          <div>
            <div className="vocab-level-title">
              {normalizedLevel} Vocabulary
            </div>
            <div className="vocab-level-subtitle">
              {completedCount} of {totalUnits} units completed
            </div>
          </div>
        </div>

        {/* ===== Progress ===== */}
        <div className="vocab-progress">
          <div
            className="vocab-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* ===== Units ===== */}
        <div className="vocab-units">
          {units.map((unit) => {
            const unlocked = isUnlocked(unit.id);

            return unlocked ? (
              <Link
                key={unit.id}
                to={`/vocabulary/${normalizedLevel}/${unit.id}`}
                style={{ textDecoration: "none" }}
              >
                <div className="vocab-card">
                  <div className="vocab-card-icon">📘</div>
                  <div className="vocab-card-title">
                    Unit {unit.id}: {unit.title}
                  </div>
                  <div className="vocab-card-desc">
                    {unit.description}
                  </div>
                </div>
              </Link>
            ) : (
              <div key={unit.id} className="vocab-card locked">
                <div className="vocab-card-icon">🔒</div>
                <div className="vocab-card-title">
                  Unit {unit.id}: {unit.title}
                </div>
                <div className="vocab-card-desc">
                  Complete previous unit to unlock
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VocabularyLevelPage;

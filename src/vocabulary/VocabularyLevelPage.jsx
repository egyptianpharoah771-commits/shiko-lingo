import { Link, useParams } from "react-router-dom";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

/* ======================
   Key System (Unified)
====================== */
function normalizeLevel(level) {
  return String(level || "").toUpperCase().trim();
}

function buildKey(level, unitNumber) {
  return `vocab_${normalizeLevel(level)}_unit${unitNumber}_done`;
}

function VocabularyLevelPage() {
  const { level } = useParams();

  const normalizedLevel =
    typeof level === "string"
      ? level.trim().toUpperCase()
      : null;

  const unitsObject =
    normalizedLevel &&
    VOCABULARY_DATA?.[normalizedLevel];

  if (!normalizedLevel || !unitsObject) {
    return <p style={{ padding: 20 }}>Invalid vocabulary level</p>;
  }

  const units = Object.values(unitsObject);

  /* ======================
     Unlock Logic (NEW)
  ====================== */
  const isUnlocked = (unitNumber) => {
    if (unitNumber === 1) return true;

    const prevKey = buildKey(normalizedLevel, unitNumber - 1);
    return localStorage.getItem(prevKey) === "true";
  };

  /* ======================
     Progress (NEW)
  ====================== */
  const totalUnits = units.length;

  const completedCount = units.filter((_, index) => {
    const unitNumber = index + 1;
    const key = buildKey(normalizedLevel, unitNumber);
    return localStorage.getItem(key) === "true";
  }).length;

  const progressPercent =
    totalUnits > 0
      ? Math.min(
          Math.round((completedCount / totalUnits) * 100),
          100
        )
      : 0;

  /* ======================
     Render
  ====================== */
  return (
    <div className="vocab-page">
      <div className={`vocab-level level-${normalizedLevel}`}>
        {/* Header */}
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

        {/* Progress */}
        <div className="vocab-progress">
          <div
            className="vocab-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Units */}
        <div className="vocab-units">
          {units.map((unit, index) => {
            const unitNumber = index + 1;
            const unlocked = isUnlocked(unitNumber);

            return unlocked ? (
              <Link
                key={unitNumber}
                to={`/vocabulary/${normalizedLevel}/${unitNumber}`}
                style={{ textDecoration: "none" }}
              >
                <div className="vocab-card">
                  <div className="vocab-card-icon">📘</div>
                  <div className="vocab-card-title">
                    Unit {unitNumber}: {unit.content?.title}
                  </div>
                  <div className="vocab-card-desc">
                    {unit.content?.description}
                  </div>
                </div>
              </Link>
            ) : (
              <div key={unitNumber} className="vocab-card locked">
                <div className="vocab-card-icon">🔒</div>
                <div className="vocab-card-title">
                  Unit {unitNumber}: {unit.content?.title}
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
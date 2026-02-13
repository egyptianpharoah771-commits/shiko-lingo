import { Link, useParams } from "react-router-dom";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

function VocabularyLevelPage() {
  const { level } = useParams(); // A1 / A2 / B1 / B2 / C1

  /* ======================
     Normalize level
  ====================== */
  const normalizedLevel =
    typeof level === "string"
      ? level.trim().toUpperCase()
      : null;

  const unitsObject =
    normalizedLevel &&
    VOCABULARY_DATA?.[normalizedLevel];

  /* ======================
     Guards
  ====================== */
  if (!normalizedLevel || !unitsObject) {
    return (
      <p style={{ padding: 20 }}>
        Invalid vocabulary level
      </p>
    );
  }

  // 🔑 IMPORTANT: always an array
  const units = Object.values(unitsObject);

  /* ======================
     Progress (per level)
  ====================== */
  const STORAGE_KEY = `vocabularyProgress_${normalizedLevel}`;

  let progress = { completedUnits: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    progress = raw
      ? JSON.parse(raw)
      : { completedUnits: [] };
  } catch {
    progress = { completedUnits: [] };
  }

  const isUnlocked = (unitNumber) => {
    if (unitNumber === 1) return true;
    return progress.completedUnits.includes(
      unitNumber - 1
    );
  };

  const completedCount =
    progress.completedUnits.length;
  const totalUnits = units.length;
  const progressPercent =
    totalUnits > 0
      ? Math.min(
          Math.round(
            (completedCount / totalUnits) * 100
          ),
          100
        )
      : 0;

  /* ======================
     Render
  ====================== */
  return (
    <div className="vocab-page">
      <div
        className={`vocab-level level-${normalizedLevel}`}
      >
        {/* ===== Header ===== */}
        <div className="vocab-level-header">
          <div>
            <div className="vocab-level-title">
              {normalizedLevel} Vocabulary
            </div>
            <div className="vocab-level-subtitle">
              {completedCount} of {totalUnits} units
              completed
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
          {units.map((unit, index) => {
            // ✅ SAFE unit number
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
                    Unit {unitNumber}:{" "}
                    {unit.content?.title}
                  </div>
                  <div className="vocab-card-desc">
                    {unit.content?.description}
                  </div>
                </div>
              </Link>
            ) : (
              <div
                key={unitNumber}
                className="vocab-card locked"
              >
                <div className="vocab-card-icon">🔒</div>
                <div className="vocab-card-title">
                  Unit {unitNumber}:{" "}
                  {unit.content?.title}
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

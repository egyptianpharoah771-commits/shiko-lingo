// src/vocabulary/VocabularyLevelPage.jsx

import { Link, useParams } from "react-router-dom";
import VOCABULARY_INDEX from "./vocabularyIndex";

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
    return <p>Invalid vocabulary level</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Vocabulary – Level {normalizedLevel}</h1>

      <ul style={{ padding: 0 }}>
        {units.map((unit) => (
          <li
            key={unit.id}
            style={{
              listStyle: "none",
              marginBottom: 10,
            }}
          >
            {isUnlocked(unit.id) ? (
              <Link
                to={`/vocabulary/${normalizedLevel}/${unit.id}`}
                style={{ textDecoration: "none", fontWeight: "bold" }}
              >
                Unit {unit.id}: {unit.title}
              </Link>
            ) : (
              <span style={{ color: "#999" }}>
                🔒 Unit {unit.id}: {unit.title}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VocabularyLevelPage;
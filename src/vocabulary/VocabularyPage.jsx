import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

/* ===== Unified Keys ===== */
function normalizeLevel(level) {
  return String(level || "").toUpperCase().trim();
}
function buildKey(level, unitNumber) {
  return `vocab_${normalizeLevel(level)}_unit${unitNumber}_done`;
}
function isUnlocked(level, unitNumber) {
  if (unitNumber === 1) return true;
  const key = buildKey(level, unitNumber - 1);
  return localStorage.getItem(key) === "true";
}

export default function VocabularyPage() {
  const levels = Object.keys(VOCABULARY_DATA || {});
  const [view, setView] = useState("main");

  /* ===== One-time migration (fix old keys) ===== */
  useEffect(() => {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k.startsWith("vocab_") && k.endsWith("_done")) {
        const parts = k.split("_"); // vocab, level, unitX, done
        if (parts.length === 4) {
          const oldLevel = parts[1];
          const unit = parts[2]; // unit3
          const normalized = `vocab_${normalizeLevel(oldLevel)}_${unit}_done`;
          if (normalized !== k) {
            const val = localStorage.getItem(k);
            localStorage.setItem(normalized, val || "true");
            localStorage.removeItem(k);
          }
        }
      }
    });
  }, []);

  return (
    <div className="vocab-page">
      <h1>📘 Vocabulary</h1>

      {view === "main" && (
        <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
          <div onClick={() => setView("menu")} className="main-card">
            <h2>📘 Vocabulary</h2>
            <p>Open vocabulary tools</p>
          </div>
        </div>
      )}

      {view === "menu" && (
        <div className="vocab-menu-grid">
          <div onClick={() => setView("search")} className="menu-card">
            <h2>🔎 Search</h2>
          </div>
          <div onClick={() => setView("saved")} className="menu-card">
            <h2>⭐ Saved</h2>
          </div>
          <div onClick={() => setView("units")} className="menu-card">
            <h2>📚 Units</h2>
          </div>
        </div>
      )}

      {view === "units" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>

          {levels.map((level) => {
            const levelData = VOCABULARY_DATA[level] || {};

            // stable order
            const unitKeys = Object.keys(levelData).sort(
              (a, b) =>
                Number(a.replace("unit", "")) - Number(b.replace("unit", ""))
            );

            return (
              <div key={level} className={`vocab-level level-${level}`}>
                <div className="vocab-level-header">
                  {normalizeLevel(level)} Vocabulary
                </div>

                <div className="vocab-units">
                  {unitKeys.map((unitKey, index) => {
                    const unitNumber = index + 1;
                    const unit = levelData[unitKey];
                    const unlocked = isUnlocked(level, unitNumber);

                    return unlocked ? (
                      <Link
                        key={unitKey}
                        to={`/vocabulary/${normalizeLevel(level)}/${unitNumber}`}
                        style={{ textDecoration: "none" }}
                      >
                        <div className="vocab-card">
                          Unit {unitNumber}: {unit?.content?.title}
                        </div>
                      </Link>
                    ) : (
                      <div key={unitKey} className="vocab-card locked">
                        🔒 Unit {unitNumber}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

/* ======================
   Key System
====================== */
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
  const navigate = useNavigate();
  const levels = Object.keys(VOCABULARY_DATA || {});
  const [view, setView] = useState("main");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [savedSet, setSavedSet] = useState(() => {
    const raw = JSON.parse(localStorage.getItem("VOCAB_SAVED") || "[]");
    const safe = Array.isArray(raw) ? raw : [];
    return new Set(safe.map((w) => String(w).toLowerCase()));
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const allWords = useMemo(() => {
    return Object.entries(VOCABULARY_DATA || {}).flatMap(([level, levelData]) =>
      Object.entries(levelData || {}).flatMap(([unitKey, unit]) =>
        (unit?.content?.items || []).map((item) => ({
          id: `${level}-${unitKey}-${item.word}`,
          level: normalizeLevel(level),
          unit: unit.id,
          word: item.word,
          meaning: item.meaning || "",
          phonetic: item.phonetic || "",
        }))
      )
    );
  }, []);

  const searchResults = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return allWords
      .filter(
        (item) =>
          item.word.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [allWords, debouncedQuery]);

  const savedWords = useMemo(() => {
    const safe = Array.from(savedSet);
    return safe
      .map((savedWordLc) =>
        allWords.find(
          (item) => item.word.toLowerCase() === savedWordLc
        ) || {
          id: `saved-${savedWordLc}`,
          level: "N/A",
          unit: "-",
          word: savedWordLc,
          meaning: "No local definition found",
          phonetic: "",
        }
      )
      .slice(0, 30);
  }, [allWords, savedSet]);

  function toggleSaveWord(word) {
    const normalized = String(word || "").toLowerCase().trim();
    if (!normalized) return;

    const next = new Set(savedSet);
    if (next.has(normalized)) next.delete(normalized);
    else next.add(normalized);

    setSavedSet(next);
    localStorage.setItem("VOCAB_SAVED", JSON.stringify(Array.from(next)));
  }

  function renderHighlightedText(text) {
    const src = String(text || "");
    const q = debouncedQuery.trim();
    if (!q) return src;

    const lowerSrc = src.toLowerCase();
    const lowerQ = q.toLowerCase();
    const idx = lowerSrc.indexOf(lowerQ);
    if (idx === -1) return src;

    const before = src.slice(0, idx);
    const match = src.slice(idx, idx + q.length);
    const after = src.slice(idx + q.length);

    return (
      <>
        {before}
        <mark className="vocab-mark">{match}</mark>
        {after}
      </>
    );
  }

  return (
    <div className="vocab-page">
      <h1>Vocabulary Hub</h1>
      <p className="vocab-subtitle">
        Learn, search, and review words in one clean place.
      </p>

      {/* ===== MAIN ===== */}
      {view === "main" && (
        <div className="vocab-hero">
          <div onClick={() => setView("menu")} className="main-card" role="button" tabIndex={0}>
            <h2>Open Vocabulary Tools</h2>
            <p>Search words, continue units, and review your saved list.</p>
          </div>
        </div>
      )}

      {/* ===== MENU ===== */}
      {view === "menu" && (
        <>
          <div className="vocab-menu-grid">
            <div onClick={() => setView("search")} className="menu-card" role="button" tabIndex={0}>
              <h2>Search</h2>
              <p>Find any vocabulary word quickly.</p>
            </div>

            <div onClick={() => setView("saved")} className="menu-card" role="button" tabIndex={0}>
              <h2>Saved</h2>
              <p>Open your saved words and review session.</p>
            </div>

            <div onClick={() => setView("units")} className="menu-card" role="button" tabIndex={0}>
              <h2>Units</h2>
              <p>Continue your level roadmap.</p>
            </div>

            <div onClick={() => navigate("/review")} className="menu-card" role="button" tabIndex={0}>
              <h2>Quick Review</h2>
              <p>Practice mixed review now.</p>
            </div>
          </div>
          <button className="vocab-back-btn" onClick={() => setView("main")}>Back</button>
        </>
      )}

      {/* ===== SEARCH ===== */}
      {view === "search" && (
        <div className="vocab-panel">
          <div className="vocab-panel-header">
            <h2>Search Vocabulary</h2>
            <button className="vocab-back-btn" onClick={() => setView("menu")}>Back</button>
          </div>

          <input
            className="vocab-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a word or meaning..."
          />

          {!debouncedQuery.trim() ? (
            <p className="vocab-empty">Start typing to search vocabulary.</p>
          ) : searchResults.length === 0 ? (
            <p className="vocab-empty">No results found for "{debouncedQuery}".</p>
          ) : (
            <div className="vocab-result-list">
              {searchResults.map((item) => (
                <div key={item.id} className="vocab-result-card">
                  <div>
                    <strong>{renderHighlightedText(item.word)}</strong>
                    <p>{renderHighlightedText(item.meaning)}</p>
                  </div>
                  <div className="vocab-result-actions">
                    <span>{item.level} / Unit {item.unit}</span>
                    <button
                      className="vocab-save-btn"
                      onClick={() => toggleSaveWord(item.word)}
                    >
                      {savedSet.has(item.word.toLowerCase()) ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SAVED ===== */}
      {view === "saved" && (
        <div className="vocab-panel">
          <div className="vocab-panel-header">
            <h2>Saved Words</h2>
            <button className="vocab-back-btn" onClick={() => setView("menu")}>Back</button>
          </div>

          <div className="vocab-saved-actions">
            <button className="vocab-btn primary" onClick={() => navigate("/vocabulary/review")}>
              Start Saved Review
            </button>
          </div>

          {savedWords.length === 0 ? (
            <p className="vocab-empty">No saved words yet. Save words from units first.</p>
          ) : (
            <div className="vocab-result-list">
              {savedWords.map((item) => (
                <div key={item.id} className="vocab-result-card">
                  <div>
                    <strong>{item.word}</strong>
                    <p>{item.meaning}</p>
                  </div>
                  <span>{item.level} / Unit {item.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== UNITS ===== */}
      {view === "units" && (
        <>
          <button className="vocab-back-btn" onClick={() => setView("menu")}>Back</button>

          {levels.map((level) => {
            const levelData = VOCABULARY_DATA[level] || {};

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
                  {unitKeys.map((unitKey) => {
                    const unit = levelData[unitKey];

                    // 🔥 FIX الحقيقي هنا
                    const unitNumber = unit.id;

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
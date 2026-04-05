import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

const LEVEL_COLORS = {
  A1: "#4A90E2",
  A2: "#43A047",
  B1: "#F9A825",
  B2: "#FB8C00",
  C1: "#D81B60",
};

// --- Helpers ---
function isUnlocked(level, unitNumber) {
  if (unitNumber === 1) return true;
  const prevKey = `vocab_${level}_unit${unitNumber - 1}_done`;
  return localStorage.getItem(prevKey) === "true";
}

function VocabularyPage() {
  const levels = Object.keys(VOCABULARY_DATA || {});

  const [view, setView] = useState("main");
  const [savedWords, setSavedWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [searchSaved, setSearchSaved] = useState("");
  const [wordDetails, setWordDetails] = useState({});
  const [loadingWords, setLoadingWords] = useState(true);

  const [searchWord, setSearchWord] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const speakWord = (word) => {
    try {
      if (!word) return;
      console.warn("TTS disabled.");
    } catch (err) {
      console.error("speakWord error:", err);
    }
  };

  const removeWord = (word) => {
    const updated = savedWords.filter((w) => w !== word);
    localStorage.setItem("VOCAB_SAVED", JSON.stringify(updated));
    setSavedWords(updated);
    setFilteredWords(updated);

    const copy = { ...wordDetails };
    delete copy[word];
    setWordDetails(copy);
  };

  const saveWord = (word) => {
    if (!word || savedWords.includes(word)) return;
    const updated = [...savedWords, word];
    localStorage.setItem("VOCAB_SAVED", JSON.stringify(updated));
    setSavedWords(updated);
    setFilteredWords(updated);
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("VOCAB_SAVED") || "[]");
    setSavedWords(saved);
    setFilteredWords(saved);
  }, []);

  useEffect(() => {
    const q = searchSaved.trim().toLowerCase();
    if (!q) {
      setFilteredWords(savedWords);
      return;
    }
    const filtered = savedWords.filter((w) => w.toLowerCase().includes(q));
    setFilteredWords(filtered);
  }, [searchSaved, savedWords]);

  useEffect(() => {
    if (!savedWords.length) {
      setLoadingWords(false);
      return;
    }
    const loadDefinitions = async () => {
      const results = {};
      for (const word of savedWords) {
        try {
          const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
          let definition = "";
          let example = "";
          if (dictRes.ok) {
            const data = await dictRes.json();
            definition = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";
            example = data?.[0]?.meanings?.[0]?.definitions?.[0]?.example || "";
          }
          results[word] = { definition, example };
        } catch (err) {
          results[word] = { definition: "Definition not available", example: "" };
        }
      }
      setWordDetails(results);
      setLoadingWords(false);
    };
    loadDefinitions();
  }, [savedWords]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchWord || searchWord.length < 2) {
        setSearchResult(null);
        return;
      }
      setSearchLoading(true);
      try {
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`);
        if (!dictRes.ok) {
          setSearchResult(null);
          setSearchLoading(false);
          return;
        }
        const data = await dictRes.json();
        const definition = data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";
        const example = data?.[0]?.meanings?.[0]?.definitions?.[0]?.example || "";
        setSearchResult({ word: searchWord, definition, example });
      } catch (err) {
        setSearchResult(null);
      }
      setSearchLoading(false);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchWord]);

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
          <div onClick={() => setView("search")} className="menu-card"><h2>🔎 Search</h2></div>
          <div onClick={() => setView("saved")} className="menu-card"><h2>⭐ Saved</h2></div>
          <div onClick={() => setView("units")} className="menu-card"><h2>📚 Units</h2></div>
        </div>
      )}

      {view === "search" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>
          <h2>🔎 Search Vocabulary</h2>
          <input type="text" placeholder="Word..." value={searchWord} onChange={(e) => setSearchWord(e.target.value)} />
          {searchLoading && <p>Searching...</p>}
          {searchResult && (
            <div className="word-result-card">
              <h3>{searchResult.word}</h3>
              <p><strong>Def:</strong> {searchResult.definition}</p>
              <button onClick={() => saveWord(searchResult.word)}>⭐ Save</button>
            </div>
          )}
        </>
      )}

      {view === "saved" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>
          <h2>⭐ My Saved Words</h2>
          <div className="saved-words-grid">
            {filteredWords.map((word) => (
              <div key={word} className="word-result-card">
                <h3>{word}</h3>
                <p>{wordDetails[word]?.definition}</p>
                <button onClick={() => removeWord(word)}>❌ Remove</button>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "units" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>
          {levels.map((level) => {
            const units = Object.values(VOCABULARY_DATA[level] || {});
            return (
              <div key={level} className={`vocab-level level-${level}`}>
                <div className="vocab-level-header">{level} Vocabulary</div>
                <div className="vocab-units">
                  {units.map((unit, index) => {
                    const unitNumber = index + 1;
                    const unlocked = isUnlocked(level, unitNumber);
                    return unlocked ? (
                      <Link key={unitNumber} to={`/vocabulary/${level}/${unitNumber}`} style={{ textDecoration: "none" }}>
                        <div className="vocab-card">
                          Unit {unitNumber}: {unit.content?.title}
                        </div>
                      </Link>
                    ) : (
                      <div key={unitNumber} className="vocab-card locked">🔒 Unit {unitNumber}</div>
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

export default VocabularyPage;
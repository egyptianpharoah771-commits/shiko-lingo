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

  const [view, setView] = useState("main");

  const [savedWords, setSavedWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [searchSaved, setSearchSaved] = useState("");

  const [wordDetails, setWordDetails] = useState({});
  const [loadingWords, setLoadingWords] = useState(true);

  const [searchWord, setSearchWord] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const speakWord = (word, example = "") => {
    if (!word) return;

    const text = example ? `${word}. ${example}` : word;

    if (window.location.hostname === "localhost") {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      speechSynthesis.speak(utter);
      return;
    }

    const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
    audio.play().catch(() => {});
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
    if (!word) return;

    if (savedWords.includes(word)) return;

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

    const filtered = savedWords.filter((w) =>
      w.toLowerCase().includes(q)
    );

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
          const dictRes = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          let definition = "";
          let example = "";
          let arabic = "";

          if (dictRes.ok) {
            const data = await dictRes.json();

            definition =
              data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";

            example =
              data?.[0]?.meanings?.[0]?.definitions?.[0]?.example || "";
          }

          if (definition) {
            const transRes = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
                definition
              )}&langpair=en|ar`
            );

            if (transRes.ok) {
              const t = await transRes.json();
              arabic = t?.responseData?.translatedText || "";
            }
          }

          results[word] = { definition, example, arabic };
        } catch {
          results[word] = {
            definition: "Definition not available",
            example: "",
            arabic: "",
          };
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
        const dictRes = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord}`
        );

        if (!dictRes.ok) {
          setSearchResult(null);
          setSearchLoading(false);
          return;
        }

        const data = await dictRes.json();

        const definition =
          data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";

        const example =
          data?.[0]?.meanings?.[0]?.definitions?.[0]?.example || "";

        let arabic = "";

        if (definition) {
          const transRes = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
              definition
            )}&langpair=en|ar`
          );

          if (transRes.ok) {
            const t = await transRes.json();
            arabic = t?.responseData?.translatedText || "";
          }
        }

        setSearchResult({
          word: searchWord,
          definition,
          example,
          arabic,
        });
      } catch {
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
        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            onClick={() => setView("menu")}
            style={{
              padding: 40,
              borderRadius: 18,
              background: "#ffffff",
              boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <h2>📘 Vocabulary</h2>
            <p>Open vocabulary tools</p>
          </div>
        </div>
      )}

      {view === "menu" && (
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 20,
          }}
        >
          <div
            onClick={() => setView("search")}
            style={{
              padding: 28,
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
          >
            <h2>🔎 Search Word</h2>
          </div>

          <div
            onClick={() => setView("saved")}
            style={{
              padding: 28,
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
          >
            <h2>⭐ Saved Words</h2>
          </div>

          <div
            onClick={() => setView("units")}
            style={{
              padding: 28,
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              cursor: "pointer",
            }}
          >
            <h2>📚 Vocabulary Units</h2>
          </div>
        </div>
      )}

      {view === "search" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>

          <h2>🔎 Search Vocabulary</h2>

          <input
            type="text"
            placeholder="Type a word..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 20,
            }}
          />

          {searchLoading && <p>Searching...</p>}

          {searchResult && (
            <div
              style={{
                border: "1px solid #eee",
                padding: 20,
                borderRadius: 14,
                background: "#ffffff",
                boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              }}
            >
              <h3>{searchResult.word}</h3>

              <button
                onClick={() =>
                  speakWord(searchResult.word, searchResult.example)
                }
              >
                🔊 Pronounce
              </button>

              {searchResult.arabic && (
                <p>
                  <strong>🇸🇦 Arabic:</strong> {searchResult.arabic}
                </p>
              )}

              {searchResult.definition && (
                <p>
                  <strong>Definition:</strong> {searchResult.definition}
                </p>
              )}

              {searchResult.example && (
                <p>
                  <strong>Example:</strong> {searchResult.example}
                </p>
              )}

              <button onClick={() => saveWord(searchResult.word)}>
                ⭐ Save Word
              </button>
            </div>
          )}
        </>
      )}

      {view === "saved" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>

          <h2>⭐ My Saved Words</h2>

          <input
            type="text"
            placeholder="Search saved words..."
            value={searchSaved}
            onChange={(e) => setSearchSaved(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              marginBottom: 20,
              borderRadius: 8,
              border: "1px solid #ddd",
            }}
          />

          {loadingWords && <p>Loading...</p>}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
              gap: 18,
            }}
          >
            {filteredWords.map((word) => {
              const data = wordDetails[word];

              return (
                <div
                  key={word}
                  style={{
                    border: "1px solid #eee",
                    padding: 20,
                    borderRadius: 14,
                    background: "#ffffff",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  }}
                >
                  <h3>{word}</h3>

                  <button onClick={() => speakWord(word, data?.example)}>
                    🔊 Pronounce
                  </button>

                  {data?.arabic && (
                    <p>
                      <strong>🇸🇦 Arabic:</strong> {data.arabic}
                    </p>
                  )}

                  {data?.definition && (
                    <p>
                      <strong>Definition:</strong> {data.definition}
                    </p>
                  )}

                  {data?.example && (
                    <p>
                      <strong>Example:</strong> {data.example}
                    </p>
                  )}

                  <button onClick={() => removeWord(word)}>
                    ❌ Remove Word
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "units" && (
        <>
          <button onClick={() => setView("menu")}>← Back</button>

          {levels.map((level) => {
            const units = Object.values(VOCABULARY_DATA[level] || {});
            const completed = getProgress(level);

            return (
              <div key={level} className={`vocab-level level-${level}`}>
                <div className="vocab-level-header">
                  <div>
                    <div className="vocab-level-title">
                      {level} Vocabulary
                    </div>

                    <div className="vocab-level-subtitle">
                      {completed.length} / {units.length} units completed
                    </div>
                  </div>
                </div>

                <div className="vocab-progress">
                  <div
                    className="vocab-progress-fill"
                    style={{
                      width: `${
                        Math.round((completed.length / units.length) * 100) ||
                        0
                      }%`,
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
        </>
      )}
    </div>
  );
}

export default VocabularyPage;
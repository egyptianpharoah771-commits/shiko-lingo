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

  const [savedWords, setSavedWords] = useState([]);
  const [wordDetails, setWordDetails] = useState({});
  const [loadingWords, setLoadingWords] = useState(true);

  /* =========================
     Pronunciation (Unified TTS)
     Uses /api/tts like Reading
  ========================= */
  const speakWord = (word, example = "") => {
    const text = example ? `${word}. ${example}` : word;

    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(text)}`
    );

    audio.play().catch((err) => {
      console.warn("TTS playback failed:", err);
    });
  };

  const removeWord = (word) => {
    const updated = savedWords.filter((w) => w !== word);
    localStorage.setItem("VOCAB_SAVED", JSON.stringify(updated));
    setSavedWords(updated);

    const copy = { ...wordDetails };
    delete copy[word];
    setWordDetails(copy);
  };

  /* =========================
     Load Saved Words
  ========================= */
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );
    setSavedWords(saved);
  }, []);

  /* =========================
     Load Definitions
  ========================= */
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

  return (
    <div className="vocab-page">
      <h1>📘 Vocabulary</h1>

      {/* =========================
          Saved Words Section
      ========================= */}

      <div style={{ marginBottom: 40 }}>
        <h2>⭐ My Saved Words</h2>

        {loadingWords && <p>Loading saved words...</p>}

        {!loadingWords && savedWords.length === 0 && (
          <p>No saved words yet. Click a word in Reading to save it.</p>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {savedWords.map((word) => {
            const data = wordDetails[word];

            return (
              <div
                key={word}
                style={{
                  border: "1px solid #eee",
                  padding: 18,
                  borderRadius: 12,
                  background: "#fafafa",
                }}
              >
                <h3>{word}</h3>

                <button
                  onClick={() =>
                    speakWord(word, data?.example)
                  }
                >
                  🔊 Pronounce
                </button>

                {data?.arabic && (
                  <p>
                    <strong>🇸🇦 Arabic:</strong> {data.arabic}
                  </p>
                )}

                {data?.definition && (
                  <p>
                    <strong>📖 Definition:</strong> {data.definition}
                  </p>
                )}

                {data?.example && (
                  <p>
                    <strong>💡 Example:</strong> {data.example}
                  </p>
                )}

                <button onClick={() => removeWord(word)}>
                  ❌ Remove Word
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================
          Vocabulary Units
      ========================= */}

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
                    Math.round((completed.length / units.length) * 100) || 0
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
    </div>
  );
}

export default VocabularyPage;
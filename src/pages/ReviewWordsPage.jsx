import { useEffect, useState, useMemo, useRef } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

const TOTAL = 60;

// ---------- utils ----------
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function normalize(word) {
  return word?.toLowerCase().trim();
}

function playSelect() {
  try {
    new Audio("/sounds/select.mp3").play();
  } catch {}
}

export default function ReviewWordsPage() {
  const queueRef = useRef([]);

  const [allWords, setAllWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);

  const [cursor, setCursor] = useState(0);
  const [progress, setProgress] = useState(0);

  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  // ---------- init ----------
  useEffect(() => {
    try {
      setLoading(true);

      const words = Object.entries(VOCABULARY_DATA || {})
        .flatMap(([level, units]) =>
          Object.entries(units).flatMap(([unitId, unit]) =>
            (unit?.content?.items || []).map((w, i) => ({
              id: `${level}_${unitId}_${i}_${normalize(w.word)}`,
              word: w.word,
              definition:
                w.definition_hard ||
                w.definition_medium ||
                w.definition ||
                "",
            }))
          )
        )
        .filter((w) => w.word && w.definition);

      const shuffled = shuffleArray(words);
      const initial = shuffled.slice(0, TOTAL);

      queueRef.current = [...initial];

      setAllWords(words);
      setCurrentWord(initial[0]);
      setCursor(0);
      setProgress(0);
    } catch {
      setAllWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- options ----------
  const options = useMemo(() => {
    if (!currentWord) return [];

    const pool = allWords.filter((w) => w.id !== currentWord.id);
    const picked = shuffleArray(pool).slice(0, 3);

    return shuffleArray([currentWord, ...picked]);
  }, [currentWord, allWords]);

  // ---------- check ----------
  const handleCheck = () => {
    if (!selected || showResult || !currentWord) return;

    const isCorrect = selected.id === currentWord.id;

    setShowResult(true);

    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
      queueRef.current.push(currentWord); // 🔥 append safely
    }
  };

  // ---------- next ----------
  const handleNext = () => {
    const nextProgress = progress + 1;

    if (nextProgress >= TOTAL) {
      setFinished(true);
      return;
    }

    const nextCursor = cursor + 1;
    const nextWord = queueRef.current[nextCursor];

    if (!nextWord) {
      setFinished(true);
      return;
    }

    setCursor(nextCursor);
    setCurrentWord(nextWord);
    setProgress(nextProgress);

    setSelected(null);
    setShowResult(false);
  };

  // ---------- UI ----------
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!currentWord) return <div style={{ padding: 20 }}>Loading...</div>;

  if (finished) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Review Complete</h2>
        <p>Score: {score} / {TOTAL}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Review</h2>

      <p>{progress + 1} / {TOTAL}</p>

      <div style={{ marginBottom: 20 }}>
        <strong>{currentWord.definition}</strong>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => {
          let background = "white";
          let border = "1px solid #ccc";

          if (showResult) {
            if (opt.id === currentWord.id) {
              background = "#d4edda";
              border = "2px solid #28a745";
            } else if (selected?.id === opt.id) {
              background = "#f8d7da";
              border = "2px solid #dc3545";
            }
          } else if (selected?.id === opt.id) {
            background = "#e7f1ff";
            border = "2px solid #007bff";
          }

          return (
            <button
              key={opt.id}
              onClick={() => {
                if (!showResult) {
                  setSelected(opt);
                  playSelect();
                }
              }}
              style={{
                padding: 12,
                borderRadius: 8,
                border,
                background,
                cursor: "pointer",
              }}
            >
              {opt.word}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        {!showResult ? (
          <button onClick={handleCheck} disabled={!selected}>
            Check
          </button>
        ) : (
          <button onClick={handleNext}>Next</button>
        )}
      </div>

      <p style={{ marginTop: 10 }}>Score: {score}</p>
    </div>
  );
}
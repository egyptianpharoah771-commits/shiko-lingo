import { useEffect, useState, useMemo } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

const TOTAL = 60;

// ---------- utils ----------
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalize(word) {
  return word?.toLowerCase().trim();
}

function removeDuplicates(words = []) {
  const seen = new Set();
  return words.filter((w) => {
    const key = normalize(w.word);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function playSelect() {
  try {
    const audio = new Audio("/sounds/select.mp3");
    audio.play();
  } catch {}
}

export default function ReviewWordsPage() {
  const [allWords, setAllWords] = useState([]);
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  // ---------- build data ----------
  useEffect(() => {
    try {
      setLoading(true);

      const allWordsRaw = Object.entries(VOCABULARY_DATA || {})
        .flatMap(([level, levelData]) =>
          Object.entries(levelData).flatMap(([unitId, unit]) =>
            (unit?.content?.items || []).map((w) => ({
              id: `${level}_${unitId}_${normalize(w.word)}`,
              word: w.word,
              definition:
                w.definition_hard ||
                w.definition_medium ||
                w.definition ||
                "",
            }))
          )
        );

      const cleaned = removeDuplicates(allWordsRaw).filter(
        (w) => w.definition && w.word
      );

      const shuffled = shuffleArray(cleaned);

      setAllWords(cleaned);
      setSessionWords(shuffled.slice(0, TOTAL));
      setCurrentIndex(0);
    } catch {
      setAllWords([]);
      setSessionWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentWord = sessionWords[currentIndex];

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
      setSessionWords((prev) => [...prev, currentWord]);
    }
  };

  // ---------- next ----------
  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    // ✅ FIX الحقيقي
    if (nextIndex >= sessionWords.length || nextIndex >= TOTAL) {
      setFinished(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setSelected(null);
    setShowResult(false);
  };

  // ---------- UI ----------
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!sessionWords.length)
    return <div style={{ padding: 20 }}>No words</div>;

  if (finished) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Review Complete</h2>
        <p>Score: {score} / {TOTAL}</p>
      </div>
    );
  }

  if (!currentWord) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Review</h2>

      <p>{currentIndex + 1} / {TOTAL}</p>

      <div style={{ marginBottom: 20 }}>
        <strong>{currentWord.definition}</strong>
      </div>

      {/* ✅ UI FIX */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => (
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
              border:
                selected?.id === opt.id
                  ? "2px solid #007bff"
                  : "1px solid #ccc",
              background:
                selected?.id === opt.id ? "#e7f1ff" : "white",
              cursor: "pointer",
            }}
          >
            {opt.word}
          </button>
        ))}
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
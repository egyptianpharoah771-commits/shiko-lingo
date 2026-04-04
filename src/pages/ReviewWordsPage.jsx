import { useEffect, useState, useRef, useCallback } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function removeDuplicates(words = []) {
  const seen = new Set();

  return words.filter((w) => {
    const key = w.word?.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ✅ FIX: no duplicate options + same-level trap
function generateOptions(correctWord, allWords) {
  if (!correctWord) return [];

  const sameLevel = allWords.filter(
    (w) => w.level === correctWord.level && w.id !== correctWord.id
  );

  let pool =
    sameLevel.length >= 3
      ? sameLevel
      : allWords.filter((w) => w.id !== correctWord.id);

  const uniquePool = [];
  const seen = new Set();

  for (const w of pool) {
    const key = w.word.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniquePool.push(w);
    }
  }

  const picked = shuffleArray(uniquePool).slice(0, 3);

  return shuffleArray([correctWord, ...picked]);
}

export default function ReviewWordsPage() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const TOTAL = 60;
  const [finished, setFinished] = useState(false);

  const [reviewQueue, setReviewQueue] = useState([]);
  const [lastWordId, setLastWordId] = useState(null); // 🔥 anti-repeat

  const LEVEL_DISTRIBUTION = {
    A1: 0.1,
    A2: 0.15,
    B1: 0.25,
    B2: 0.25,
    C1: 0.25,
  };

  const fetchWords = useCallback(() => {
    try {
      setLoading(true);

      const result = [];

      Object.entries(LEVEL_DISTRIBUTION).forEach(([level, ratio]) => {
        const levelData = VOCABULARY_DATA?.[level];
        if (!levelData) return;

        const words = Object.values(levelData)
          .flatMap((unit) => unit?.content?.items || [])
          .map((w, index) => ({
            id: `${level}_${w.word}_${index}`,
            word: w.word,
            definition:
              w.definition_hard ||
              w.definition_medium ||
              w.definition ||
              "",
            level,
          }));

        const cleaned = removeDuplicates(words).filter(
          (w) => w.definition && w.definition.length > 10
        );

        const count = Math.floor(TOTAL * ratio);
        const picked = shuffleArray(cleaned).slice(0, count);

        result.push(...picked);
      });

      let finalWords = shuffleArray(result);

      if (finalWords.length === 0) {
        setWords([]);
        return;
      }

      while (finalWords.length < TOTAL) {
        finalWords.push(
          finalWords[Math.floor(Math.random() * finalWords.length)]
        );
      }

      setWords(finalWords);
      setCurrentIndex(0);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const safeIndex = Math.min(currentIndex, words.length - 1);
  const currentWord = words[safeIndex];

  useEffect(() => {
    if (!currentWord) return;
    setOptions(generateOptions(currentWord, words));
  }, [currentWord, words]);

  const handleCheck = () => {
    if (!selected || showResult || !currentWord) return;

    const isCorrect = selected.id === currentWord.id;

    setShowResult(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev) => prev + 1);
      playCorrect();
    } else {
      playWrong();

      setReviewQueue((prev) => [
        ...prev,
        { word: currentWord, delay: 2 },
      ]);
    }
  };

  const handleNext = () => {
    if (!words.length) return;

    if (progress + 1 >= TOTAL) {
      setFinished(true);
      return;
    }

    setProgress((p) => p + 1);
    setSelected(null);
    setShowResult(false);
    setFeedback(null);

    setReviewQueue((prev) => {
      const updated = prev.map((i) => ({ ...i, delay: i.delay - 1 }));
      const ready = updated.find((i) => i.delay <= 0);

      if (ready) {
        const idx = words.findIndex((w) => w.id === ready.word.id);
        if (idx !== -1) {
          setLastWordId(currentWord?.id);
          setCurrentIndex(idx);
        }
        return updated.filter((i) => i.word.id !== ready.word.id);
      }

      // 🔥 anti-repeat logic
      let nextIndex;
      let attempts = 0;

      do {
        nextIndex = Math.floor(Math.random() * words.length);
        attempts++;
      } while (
        (words[nextIndex]?.id === lastWordId ||
          words[nextIndex]?.id === currentWord?.id) &&
        attempts < 10
      );

      setLastWordId(currentWord?.id);
      setCurrentIndex(nextIndex);

      return updated;
    });
  };

  if (finished) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Review Complete</h2>
        <p>
          Score: {score} / {TOTAL}
        </p>
        <button
          onClick={() => {
            setProgress(0);
            setScore(0);
            setFinished(false);
            setCurrentIndex(0);
          }}
        >
          Restart
        </button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!words.length) return <div style={{ padding: 20 }}>No words</div>;

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Mixed Review (A1–C1)</h2>

      <p>
        {Math.min(progress + 1, TOTAL)} / {TOTAL}
      </p>

      <div style={{ marginBottom: 20 }}>
        <p>{currentWord?.definition || "..."}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => {
          const isSelected = selected?.id === opt.id;
          const isCorrect = opt.id === currentWord?.id;

          let background = "#f1f1f1";

          if (showResult) {
            if (isCorrect) background = "#4caf50";
            else if (isSelected) background = "#f44336";
          } else if (isSelected) {
            background = "#ddd";
          }

          return (
            <button
              key={opt.id}
              onClick={() => !showResult && setSelected(opt)}
              style={{
                padding: 12,
                border: "none",
                cursor: "pointer",
                background,
                color: showResult ? "#fff" : "#000",
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

      <div style={{ marginTop: 20 }}>
        <strong>Score: {score}</strong>
      </div>

      {feedback === "correct" && <p>Correct</p>}
      {feedback === "wrong" && <p>Wrong</p>}
    </div>
  );
}
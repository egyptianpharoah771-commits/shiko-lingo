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
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
}

function generateOptions(correctWord, allWords) {
  const wrong = allWords.filter((w) => w.id !== correctWord.id);
  const shuffled = shuffleArray(wrong).slice(0, 3);
  return shuffleArray([correctWord, ...shuffled]);
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const TOTAL = 20;
  const [finished, setFinished] = useState(false);

  const [reviewQueue, setReviewQueue] = useState([]);

  // ✅ LOAD WORDS (DETERMINISTIC)
  const fetchWords = useCallback(() => {
    try {
      setLoading(true);

      const levelData = VOCABULARY_DATA?.A1;

      if (!levelData) {
        setWords([]);
        return;
      }

      const allWords = Object.values(levelData)
        .flatMap((unit) => unit?.content?.items || [])
        .map((w) => ({
          id: w.word,
          word: w.word,
          definition:
            w.definition_easy ||
            w.definition ||
            w.meaning ||
            "",
        }));

      const prepared = shuffleArray(removeDuplicates(allWords));

      setWords(prepared);
    } catch {
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const currentWord = words[currentIndex];

  // ✅ OPTIONS (ID BASED)
  useEffect(() => {
    if (!currentWord) return;
    setOptions(generateOptions(currentWord, words));
  }, [currentWord, words]);

  // ✅ CHECK
  const handleCheck = () => {
    if (!selected || showResult) return;

    const isCorrect = selected.id === currentWord.id;

    setShowResult(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setScore((prev) => prev + 1);
      playCorrect();
    } else {
      playWrong();

      // 🔥 enqueue for review
      setReviewQueue((prev) => [
        ...prev,
        { word: currentWord, delay: 2 },
      ]);
    }
  };

  // ✅ NEXT
  const handleNext = () => {
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
          setCurrentIndex(idx);
        }
        return updated.filter((i) => i.word.id !== ready.word.id);
      }

      setCurrentIndex((prevIndex) => prevIndex + 1);
      return updated;
    });
  };

  // CLEANUP
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // ✅ UI
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
      <h2>Review</h2>

      <p>
        {progress + 1} / {TOTAL}
      </p>

      <div style={{ marginBottom: 20 }}>
        <p>{currentWord.definition}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => {
          const isSelected = selected?.id === opt.id;
          const isCorrect = opt.id === currentWord.id;

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
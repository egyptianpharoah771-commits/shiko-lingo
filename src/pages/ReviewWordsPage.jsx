import { useEffect, useState, useCallback } from "react";
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

function generateOptions(correctWord, allWords) {
  if (!correctWord) return [];

  const pool = allWords.filter((w) => w.id !== correctWord.id);

  const unique = [];
  const seen = new Set();

  for (const w of pool) {
    const key = w.word.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(w);
    }
  }

  const picked = shuffleArray(unique).slice(0, 3);

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

  const fetchWords = useCallback(() => {
    try {
      setLoading(true);

      const allWordsRaw = Object.entries(VOCABULARY_DATA || {})
        .flatMap(([level, levelData]) =>
          Object.values(levelData).flatMap((unit) =>
            (unit?.content?.items || []).map((w, index) => ({
              id: `${level}_${w.word}_${index}`,
              word: w.word,
              definition:
                w.definition_hard ||
                w.definition_medium ||
                w.definition ||
                "",
              level,
            }))
          )
        );

      const cleaned = removeDuplicates(allWordsRaw).filter(
        (w) =>
          w.definition &&
          w.definition.length > 10 &&
          w.word.length > 2
      );

      const shuffled = shuffleArray(cleaned);
      const selected = shuffled.slice(0, TOTAL);

      setWords(selected);
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

  const currentWord = words[currentIndex];

  // 🔥 FIX: reset options properly
  useEffect(() => {
    if (!currentWord) {
      setOptions([]);
      return;
    }

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
          setCurrentIndex(idx);
        }
        return updated.filter((i) => i.word.id !== ready.word.id);
      }

      // 🔥 FIX: guard index
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= words.length ? words.length - 1 : next;
      });

      return updated;
    });
  };

  if (finished) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Review Complete</h2>
        <p>Score: {score} / {TOTAL}</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!words.length) return <div style={{ padding: 20 }}>No words</div>;

  // 🔥 FIX: block render لو مفيش currentWord
  if (!currentWord) {
    return <div style={{ padding: 20 }}>Loading next question...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Review</h2>

      <p>{Math.min(progress + 1, TOTAL)} / {TOTAL}</p>

      <p>{currentWord.definition}</p>

      <div>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !showResult && setSelected(opt)}
          >
            {opt.word}
          </button>
        ))}
      </div>

      {!showResult ? (
        <button onClick={handleCheck} disabled={!selected}>
          Check
        </button>
      ) : (
        <button onClick={handleNext}>Next</button>
      )}

      <p>Score: {score}</p>
    </div>
  );
}
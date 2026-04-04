import { useEffect, useState, useMemo, useCallback } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
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

export default function ReviewWordsPage() {
  const TOTAL = 60;

  const [allWords, setAllWords] = useState([]);
  const [testWords, setTestWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const loadWords = useCallback(() => {
    setLoading(true);

    let pool = [];

    Object.entries(VOCABULARY_DATA || {}).forEach(([level, levelData]) => {
      Object.values(levelData).forEach((unit, unitIndex) => {
        (unit?.content?.items || []).forEach((w) => {
          const def =
            w.definition_hard ||
            w.definition_medium ||
            w.definition ||
            "";

          if (w.word && def.length > 5) {
            pool.push({
              id: `${level}-${unitIndex}-${w.word}`,
              word: w.word,
              definition: def,
              level,
            });
          }
        });
      });
    });

    const unique = removeDuplicates(pool);
    const shuffled = shuffleArray(unique);

    setAllWords(shuffled);
    setTestWords(shuffled.slice(0, TOTAL));

    setCurrentIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const currentWord = testWords[currentIndex];

  const options = useMemo(() => {
    if (!currentWord || allWords.length < 4) return [];

    const wrong = allWords
      .filter((w) => w.word !== currentWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return shuffleArray([currentWord, ...wrong]);
  }, [currentWord, allWords]);

  const handleCheck = () => {
    if (!selected || showResult || !currentWord) return;

    const isCorrect = selected.word === currentWord.word;

    setShowResult(true);

    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
      setTestWords((prev) => [...prev, currentWord]);
    }
  };

  // 🔥 FIX: navigation بسيط وواضح
  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= TOTAL) {
      setFinished(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setSelected(null);
    setShowResult(false);
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  if (finished) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Review Complete</h2>
        <p>
          Score: {score} / {TOTAL}
        </p>
        <button onClick={() => window.location.reload()}>
          Restart
        </button>
      </div>
    );
  }

  if (!currentWord) {
    return <div style={{ padding: 40 }}>Preparing...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>Review</h2>

      <p>Question {currentIndex + 1}</p>

      <p style={{ marginBottom: 20 }}>
        {currentWord.definition}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((opt) => {
          const isSelected = selected?.id === opt.id;
          const isCorrect = opt.word === currentWord.word;

          let background = "#eee";

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
          <button onClick={handleNext}>
            Next
          </button>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Score: {score}</strong>
      </div>
    </div>
  );
}
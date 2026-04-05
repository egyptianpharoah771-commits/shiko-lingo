import { useEffect, useState, useRef, useCallback } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

function normalize(text) {
  return text?.toLowerCase().trim();
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

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(null);

  const [selected, setSelected] = useState(null);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);

  const [progress, setProgress] = useState(0);
  const TOTAL = 60;
  const [finished, setFinished] = useState(false);

  const [reviewQueue, setReviewQueue] = useState([]);
  const [usedWords, setUsedWords] = useState(new Set());

  const fetchWords = useCallback(() => {
    try {
      setLoading(true);

      const allWords = Object.entries(VOCABULARY_DATA || {})
        .flatMap(([level, levelData]) =>
          Object.values(levelData).flatMap((unit) =>
            (unit?.content?.items || []).map((w) => ({
              id: `${level}_${w.word}`,
              word: w.word,
              definition:
                w.definition_easy ||
                w.definition_medium ||
                w.definition ||
                w.meaning ||
                "",
              level,
            }))
          )
        );

      const clean = removeDuplicates(allWords);

      const groups = {
        A1: shuffle(clean.filter((w) => w.level === "A1")),
        A2: shuffle(clean.filter((w) => w.level === "A2")),
        B1: shuffle(clean.filter((w) => w.level === "B1")),
        B2: shuffle(clean.filter((w) => w.level === "B2")),
        C1: shuffle(clean.filter((w) => w.level === "C1")),
      };

      const session = [
        ...groups.A1.slice(0, 15),
        ...groups.A2.slice(0, 15),
        ...groups.B1.slice(0, 10),
        ...groups.B2.slice(0, 10),
        ...groups.C1.slice(0, 10),
      ];

      setWords(session);
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

  const generateOptions = useCallback(() => {
    if (!currentWord || words.length < 4) return [];

    const wrong = words
      .filter((w) => w.word !== currentWord.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [...wrong, currentWord]
      .sort(() => 0.5 - Math.random())
      .map((w) => w.word);
  }, [currentWord, words]);

  useEffect(() => {
    setOptions(generateOptions());
  }, [currentWord, generateOptions]);

  const handleSelect = (opt) => {
    if (checking) return;
    setSelected(opt);

    try {
      new Audio("/sounds/select.mp3").play();
    } catch {}
  };

  const goNext = () => {
    if (progress + 1 >= TOTAL) {
      setFinished(true);
      return;
    }

    setProgress((p) => p + 1);
    setSelected(null);
    setChecking(false);
    setFeedback(null);

    setReviewQueue((prev) => {
      const updated = prev.map((i) => ({ ...i, delay: i.delay - 1 }));
      const ready = updated.find((i) => i.delay <= 0);

      if (ready) {
        const idx = words.findIndex((w) => w.id === ready.word.id);
        if (idx !== -1) {
          setLastIndex(currentIndex);
          setCurrentIndex(idx);
        }
        return updated.filter((i) => i.word.id !== ready.word.id);
      }

      const available = words.filter((w) => !usedWords.has(w.id));

      if (available.length === 0) {
        setFinished(true);
        return updated;
      }

      const randomWord =
        available[Math.floor(Math.random() * available.length)];

      const idx = words.findIndex((w) => w.id === randomWord.id);

      setUsedWords((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.add(randomWord.id);
        return newSet;
      });

      setLastIndex(currentIndex);
      setCurrentIndex(idx);

      return updated;
    });
  };

  const handleAnswer = () => {
    if (!selected || checking || !currentWord) return;

    const isCorrect =
      normalize(selected) === normalize(currentWord.word);

    setChecking(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
      setReviewQueue((prev) => [
        ...prev,
        { word: currentWord, delay: 2 },
      ]);
    }

    timeoutRef.current = setTimeout(goNext, 1000);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // 🔥 نسبة التقدم
  const progressPercent = Math.round((progress / TOTAL) * 100);

  if (finished) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>✅ Session Complete</h2>
        <p>{progress} / {TOTAL}</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!words.length) return <div style={{ padding: 20 }}>No words</div>;

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto" }}>
      <h2>Review</h2>

      {/* 🔥 Progress Bar */}
      <div style={{ marginBottom: 15 }}>
        <div
          style={{
            height: 10,
            background: "#eee",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "#4caf50",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p style={{ fontSize: 12, marginTop: 5 }}>
          {progress} / {TOTAL}
        </p>
      </div>

      <h3 style={{ marginBottom: 15 }}>
        {currentWord.definition}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === currentWord.word;

          let bg = "#fff";

          if (checking) {
            if (isCorrect) bg = "#4caf50";
            else if (isSelected) bg = "#f44336";
          } else if (isSelected) {
            bg = "#e3f2fd";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={checking}
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid #ddd",
                cursor: "pointer",
                background: bg,
                color: checking ? "#fff" : "#000",
                fontSize: 16,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleAnswer}
        disabled={!selected || checking}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 14,
          borderRadius: 10,
          background: "#007bff",
          color: "#fff",
          border: "none",
        }}
      >
        Check
      </button>
    </div>
  );
}
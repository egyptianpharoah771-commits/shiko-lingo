import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

function normalize(text) {
  return text?.toLowerCase().trim();
}

// 🔥 A1 MAP
const A1_MAP = {
  strong: "very powerful",
  big: "large",
  small: "not big",
  eat: "to have food",
  drink: "to have water",
  go: "to move",
  come: "to move here",
  make: "to create",
  take: "to get",
  give: "to give something",
  see: "to look at",
  run: "to move fast",
  walk: "to move slowly",
  happy: "feeling good",
  sad: "feeling bad",
  fast: "quick",
  slow: "not fast",
  hot: "high temperature",
  cold: "low temperature",
  good: "nice",
  bad: "not good",
};

function isA1Word(w) {
  if (!w.word) return false;
  return !!A1_MAP[w.word.toLowerCase()];
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);

  // 🔊 AUDIO
  const correctRef = useRef(null);
  const wrongRef = useRef(null);

  const playSound = (type) => {
    try {
      const ref = type === "correct" ? correctRef.current : wrongRef.current;
      if (!ref) return;
      ref.currentTime = 0;
      ref.play().catch(() => {});
    } catch {}
  };

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("mcq");
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);

  // 🔥 NEW: review queue
  const [reviewQueue, setReviewQueue] = useState([]);

  // 🔥 FETCH
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("words")
        .select("id, word")
        .limit(200);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("EMPTY_DATA");

      const filtered = data.filter(isA1Word);

      const mapped = filtered.map((w) => ({
        id: w.id,
        word: w.word,
        definition: A1_MAP[w.word.toLowerCase()],
      }));

      if (mapped.length < 5) throw new Error("NO_A1_MATCHES");

      setWords(mapped);
    } catch (err) {
      console.error("❌ FETCH ERROR:", err.message);
      setError(err.message);
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const currentWord = words[currentIndex];

  // 🔥 MCQ
  const generateOptions = useCallback(() => {
    if (!currentWord || words.length < 4) return [];

    const correct = currentWord.definition;

    const wrong = words
      .filter((w) => w.definition !== correct)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [...wrong, currentWord]
      .sort(() => 0.5 - Math.random())
      .map((w) => w.definition);
  }, [currentWord, words]);

  useEffect(() => {
    if (mode === "mcq") {
      setOptions(generateOptions());
    }
  }, [currentWord, mode, generateOptions]);

  // 🔥 NEXT (WITH QUEUE)
  const goNext = () => {
    setSelected(null);
    setInput("");
    setChecking(false);
    setFeedback(null);

    // لو فيه كلمات غلط → ترجّع بعد شوية
    if (reviewQueue.length > 0) {
      const nextItem = reviewQueue[0];

      setReviewQueue((prev) => prev.slice(1));

      const index = words.findIndex((w) => w.id === nextItem.id);

      if (index !== -1) {
        setCurrentIndex(index);
      }
    } else {
      setCurrentIndex((prev) => {
        if (words.length <= 1) return prev;

        let next;
        do {
          next = Math.floor(Math.random() * words.length);
        } while (next === prev);

        return next;
      });
    }

    setMode((prev) => (prev === "mcq" ? "type" : "mcq"));
  };

  // 🔥 HANDLE
  const handleAnswer = (answer) => {
    if (!currentWord || checking) return;

    if (mode === "type" && !normalize(answer)) return;

    const correctAnswer =
      mode === "mcq"
        ? currentWord.definition
        : currentWord.word;

    const isCorrect =
      normalize(answer) === normalize(correctAnswer);

    setChecking(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    playSound(isCorrect ? "correct" : "wrong");

    if (!isCorrect) {
      // 🔥 add to queue (delay effect)
      setReviewQueue((prev) => [...prev, currentWord]);
    }

    if (mode === "mcq") setSelected(answer);

    timeoutRef.current = setTimeout(goNext, 1200);
  };

  // 🔥 CLEANUP
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 🔥 UI

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (error)
    return (
      <div style={{ padding: 20 }}>
        ❌ {error}
        <button onClick={fetchWords}>Retry</button>
      </div>
    );

  if (!words.length)
    return <div style={{ padding: 20 }}>No A1 words available</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Review</h2>

      {/* 🔊 AUDIO */}
      <audio ref={correctRef} src="/sounds/correct.mp3" preload="auto" />
      <audio ref={wrongRef} src="/sounds/wrong.mp3" preload="auto" />

      <p>
        {currentIndex + 1} / {words.length}
      </p>

      {mode === "type" && (
        <div>
          <p>{currentWord.definition}</p>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={checking}
          />

          <button onClick={() => handleAnswer(input)}>
            Submit
          </button>
        </div>
      )}

      {mode === "mcq" && (
        <div>
          <h3>{currentWord.word}</h3>

          {options.map((opt, i) => {
            let bg = "#fff";

            if (checking) {
              if (opt === currentWord.definition) bg = "#4CAF50";
              else if (opt === selected) bg = "#f44336";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                disabled={checking}
                style={{
                  display: "block",
                  margin: "8px 0",
                  background: bg,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {feedback === "correct" && (
        <p style={{ color: "green" }}>✅ Correct</p>
      )}

      {feedback === "wrong" && (
        <p style={{ color: "red" }}>
          ❌ Wrong — correct: {currentWord.word}
        </p>
      )}
    </div>
  );
}
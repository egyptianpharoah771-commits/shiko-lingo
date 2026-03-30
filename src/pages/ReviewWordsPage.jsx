import { useEffect, useState, useRef, useCallback } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";

function normalize(text) {
  return text?.toLowerCase().trim();
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(null);
  const [mode, setMode] = useState("mcq");
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);

  const [progress, setProgress] = useState(0);
  const TOTAL = 20;
  const [finished, setFinished] = useState(false);

  const [reviewQueue, setReviewQueue] = useState([]);

  // ✅ LOAD WORDS FROM LOCAL DATA
  const fetchWords = useCallback(() => {
    try {
      setLoading(true);

      const unit =
        VOCABULARY_DATA?.A1?.unit1?.content?.items || [];

      const prepared = unit.map((w) => ({
        id: w.word,
        word: w.word,
        definition:
          w.definition_easy ||
          w.definition ||
          w.meaning ||
          "",
        audio: w.audio || "",
      }));

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

  // 🔊 LOCAL AUDIO ONLY
  const playAudio = () => {
    if (!currentWord?.audio) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(currentWord.audio);
      audioRef.current = audio;

      audio.play().catch(() => {});
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // 🔥 MCQ
  const generateOptions = useCallback(() => {
    if (!currentWord || words.length < 4) return [];

    const wrong = words
      .filter((w) => w.definition !== currentWord.definition)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [...wrong, currentWord]
      .sort(() => 0.5 - Math.random())
      .map((w) => w.definition);
  }, [currentWord, words]);

  useEffect(() => {
    if (mode === "mcq" || mode === "listen") {
      setOptions(generateOptions());
    }
  }, [currentWord, mode, generateOptions]);

  // 🔥 NEXT
  const goNext = () => {
    if (progress + 1 >= TOTAL) {
      setFinished(true);
      return;
    }

    setProgress((p) => p + 1);

    setSelected(null);
    setInput("");
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

      let next;
      do {
        next = Math.floor(Math.random() * words.length);
      } while (next === currentIndex || next === lastIndex);

      setLastIndex(currentIndex);
      setCurrentIndex(next);

      return updated;
    });

    setMode((prev) =>
      prev === "mcq" ? "type" : prev === "type" ? "listen" : "mcq"
    );
  };

  // 🔥 HANDLE
  const handleAnswer = (answer) => {
    if (!currentWord || checking) return;

    if (mode === "type" && !normalize(answer)) return;

    const correctAnswer =
      mode === "mcq" || mode === "listen"
        ? currentWord.definition
        : currentWord.word;

    const isCorrect =
      normalize(answer) === normalize(correctAnswer);

    setChecking(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (!isCorrect) {
      setReviewQueue((prev) => [
        ...prev,
        { word: currentWord, delay: 2 },
      ]);
    }

    if (mode !== "type") setSelected(answer);

    timeoutRef.current = setTimeout(goNext, 1200);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // 🔥 FINISHED
  if (finished) {
    return (
      <div style={{ padding: 20 }}>
        <h2>✅ Session Complete</h2>
        <button
          onClick={() => {
            setProgress(0);
            setFinished(false);
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
    <div style={{ padding: 20 }}>
      <h2>Review</h2>

      <p>
        {progress} / {TOTAL}
      </p>

      {mode === "type" && (
        <div>
          <p>{currentWord.definition}</p>

          {currentWord.audio && (
            <button onClick={playAudio}>🔊</button>
          )}

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

          {currentWord.audio && (
            <button onClick={playAudio}>🔊</button>
          )}

          {options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {mode === "listen" && (
        <div>
          <button onClick={playAudio}>🔊 Play</button>

          {options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {feedback === "correct" && <p>✅ Correct</p>}
      {feedback === "wrong" && <p>❌ Wrong</p>}
    </div>
  );
}
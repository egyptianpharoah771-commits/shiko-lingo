import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

function normalize(text) {
  return text?.toLowerCase().trim();
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("mcq");
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null); // correct | wrong
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("words")
        .select("id, word, simple_definition")
        .limit(50);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("EMPTY_DATA");

      setWords(
        data.map((w) => ({
          id: w.id,
          word: w.word,
          definition: w.simple_definition,
        }))
      );
    } catch (err) {
      console.error(err);
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

  // 🔥 MCQ OPTIONS
  const generateOptions = useCallback(() => {
    if (!currentWord || words.length < 4) return [];

    const correct = currentWord.definition;

    const wrong = words
      .filter((w) => w.definition && w.definition !== correct)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [...wrong, currentWord]
      .sort(() => 0.5 - Math.random())
      .map((w) => w.definition);
  }, [currentWord, words]);

  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (mode === "mcq") setOptions(generateOptions());
  }, [currentWord, mode, generateOptions]);

  // 🔥 NEXT
  const goNext = () => {
    setSelected(null);
    setInput("");
    setChecking(false);
    setFeedback(null);

    setCurrentIndex((prev) =>
      prev + 1 >= words.length ? 0 : prev + 1
    );

    setMode((prev) => (prev === "mcq" ? "type" : "mcq"));
  };

  // 🔥 HANDLE
  const handleAnswer = (answer) => {
    if (!currentWord || checking) return;

    const correctAnswer =
      mode === "mcq"
        ? currentWord.definition
        : currentWord.word;

    const isCorrect =
      normalize(answer) === normalize(correctAnswer);

    setChecking(true);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (mode === "mcq") setSelected(answer);

    console.log({
      input: answer,
      expected: correctAnswer,
      isCorrect,
    });

    timeoutRef.current = setTimeout(goNext, 1200);
  };

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
    return <div style={{ padding: 20 }}>No words</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Review</h2>

      <p>
        {currentIndex + 1} / {words.length}
      </p>

      {/* 🔥 TYPE MODE */}
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

      {/* 🔥 MCQ */}
      {mode === "mcq" && (
        <div>
          <h3>{currentWord.word}</h3>

          {options.map((opt, i) => {
            let bg = "#fff";

            if (checking) {
              if (opt === currentWord.definition)
                bg = "#4CAF50"; // correct
              else if (opt === selected)
                bg = "#f44336"; // wrong
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

      {/* 🔥 FEEDBACK */}
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
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

function normalize(text) {
  return text?.toLowerCase().trim();
}

// 🔥 HARD SIMPLIFIER (CORE FIX)
function simplify(def) {
  if (!def) return "";

  let d = def.toLowerCase();

  const replacements = [
    ["a result that one is attempting to achieve", "something you want"],
    ["the act of", ""],
    ["the process of", ""],
    ["in order to", "to"],
    ["one is", "you are"],
    ["someone is", "you are"],
    ["something that", ""],
    ["used to", "to"],
  ];

  replacements.forEach(([from, to]) => {
    d = d.replace(from, to);
  });

  // remove complex separators
  d = d.split(";")[0];
  d = d.split(",")[0];

  // trim length aggressively
  if (d.length > 50) {
    d = d.slice(0, 50);
  }

  return d.trim();
}

// 🔥 STRICT A1 FILTER
function isValid(w) {
  if (!w.word || !w.simple_definition) return false;

  const word = w.word.trim();
  const def = w.simple_definition.trim();

  if (word.length > 6) return false;
  if (def.length > 120) return false;

  return true;
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("mcq");
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH + SIMPLIFY
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("words")
        .select("id, word, simple_definition")
        .limit(200);

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("EMPTY_DATA");

      const filtered = data.filter(isValid);

      const mapped = filtered
        .map((w) => ({
          id: w.id,
          word: w.word,
          definition: simplify(w.simple_definition),
        }))
        .filter((w) => w.definition.length > 2); // remove garbage

      if (mapped.length < 10) {
        throw new Error("DATA_NOT_USABLE");
      }

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

  // 🔥 SMART MCQ
  const generateOptions = useCallback(() => {
    if (!currentWord || words.length < 4) return [];

    const correct = currentWord.definition;

    const wrong = words
      .filter(
        (w) =>
          w.definition &&
          w.definition !== correct &&
          Math.abs(w.definition.length - correct.length) < 15
      )
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
    return <div style={{ padding: 20 }}>No usable words</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Review</h2>

      <p>
        {currentIndex + 1} / {words.length}
      </p>

      {/* TYPE */}
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

      {/* MCQ */}
      {mode === "mcq" && (
        <div>
          <h3>{currentWord.word}</h3>

          {options.map((opt, i) => {
            let bg = "#fff";

            if (checking) {
              if (opt === currentWord.definition)
                bg = "#4CAF50";
              else if (opt === selected)
                bg = "#f44336";
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

      {/* FEEDBACK */}
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
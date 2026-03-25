import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

function normalize(text) {
  return text?.toLowerCase().trim();
}

// 🔥 A1 DICTIONARY (CONTROLLED)
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

// 🔥 PICK A1 DEFINITION
function getDefinition(word, fallback) {
  const w = word?.toLowerCase();
  if (A1_MAP[w]) return A1_MAP[w];

  // fallback (shortened)
  if (!fallback) return "";

  let d = fallback.toLowerCase().split(";")[0].split(",")[0];

  if (d.length > 40) d = d.slice(0, 40);

  return d;
}

// 🔥 FILTER WORDS WE CAN CONTROL
function isUsable(w) {
  if (!w.word) return false;

  const word = w.word.toLowerCase();

  // فقط الكلمات اللي عندنا ليها تعريف مضمون
  return A1_MAP[word] || word.length <= 5;
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

  // 🔥 FETCH CONTROLLED DATA
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

      const filtered = data.filter(isUsable);

      const mapped = filtered.map((w) => ({
        id: w.id,
        word: w.word,
        definition: getDefinition(w.word, w.simple_definition),
      }));

      if (mapped.length < 5) throw new Error("NO_A1_DATA");

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
    return <div style={{ padding: 20 }}>No A1 words</div>;

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
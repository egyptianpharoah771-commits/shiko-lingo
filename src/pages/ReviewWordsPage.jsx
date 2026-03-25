import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

function normalize(word) {
  return word?.toLowerCase().trim();
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);

  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("mcq"); // mcq | type
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 SAFE FETCH (NO audio_url)
  const fetchWords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("words")
        .select("id, word, simple_definition")
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("EMPTY_DATA");
      }

      const mapped = data.map((w) => ({
        id: w.id,
        word: w.word,
        definition: w.simple_definition,
      }));

      setWords(mapped);
    } catch (err) {
      console.error("❌ FETCH WORDS ERROR:", err.message);
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

    const shuffled = [...words]
      .filter((w) => w.definition && w.definition !== correct)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return [...shuffled, currentWord]
      .sort(() => 0.5 - Math.random())
      .map((w) => w.definition);
  }, [currentWord, words]);

  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (mode === "mcq") {
      setOptions(generateOptions());
    }
  }, [currentWord, mode, generateOptions]);

  // 🔥 NEXT WORD
  const goNext = () => {
    setSelected(null);
    setInput("");
    setChecking(false);

    setCurrentIndex((prev) => {
      if (prev + 1 >= words.length) return 0;
      return prev + 1;
    });

    setMode((prev) => (prev === "mcq" ? "type" : "mcq"));
  };

  // 🔥 HANDLE ANSWER
  const handleAnswer = (answer) => {
    if (!currentWord || checking) return;

    setChecking(true);

    let isCorrect = false;

    if (mode === "mcq") {
      isCorrect =
        normalize(answer) === normalize(currentWord.definition);
      setSelected(answer);
    }

    if (mode === "type") {
      isCorrect =
        normalize(answer) === normalize(currentWord.word);
    }

    console.log(
      isCorrect ? "✅ Correct" : "❌ Wrong",
      "| Input:",
      answer,
      "| Expected:",
      mode === "mcq"
        ? currentWord.definition
        : currentWord.word
    );

    timeoutRef.current = setTimeout(() => {
      goNext();
    }, 800);
  };

  // 🔥 UI

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        ❌ Error: {error}
        <button onClick={fetchWords}>Retry</button>
      </div>
    );
  }

  if (!words.length) {
    return <div style={{ padding: 20 }}>⚠️ No words available</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Review</h2>

      <p>
        {currentIndex + 1} / {words.length}
      </p>

      <h3>{currentWord.word}</h3>

      {/* MCQ */}
      {mode === "mcq" && (
        <div>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              style={{
                display: "block",
                margin: "8px 0",
                background:
                  selected === opt ? "#ddd" : "#fff",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* TYPE */}
      {mode === "type" && (
        <div>
          <p>{currentWord.definition}</p>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={() => handleAnswer(input)}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";

const SESSION_SIZE = 10;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SavedWordsReview() {
  const [words, setWords] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("VOCAB_SAVED") || "[]");
    setWords(saved);
  }, []);

  useEffect(() => {
    if (!words.length) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const dict = {};

      for (const word of words) {
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          if (res.ok) {
            const data = await res.json();
            const definition =
              data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";

            dict[word] = definition;
          }
        } catch {
          dict[word] = "";
        }
      }

      const qs = [];

      for (const word of words) {
        const correct = dict[word];
        if (!correct) continue;

        const wrongPool = words.filter((w) => w !== word);
        const wrongChoices = shuffleArray(wrongPool).slice(0, 3);
        const options = shuffleArray([word, ...wrongChoices]);

        qs.push({
          definition: correct,
          correct: word,
          options,
        });
      }

      const shuffled = shuffleArray(qs).slice(0, SESSION_SIZE);

      setQuestions(shuffled);
      setLoading(false);
    };

    load();
  }, [words]);

  const handleAnswer = (option) => {
    if (selected) return;

    setSelected(option);

    if (option === questions[current].correct) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    setSelected(null);
    setCurrent((c) => c + 1);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setQuestions((q) => shuffleArray(q));
  };

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Loading review...</h2>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={{ padding: 30 }}>
        <h2>No saved words to review.</h2>
      </div>
    );
  }

  if (current >= questions.length) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Review Complete 🎉</h2>

        <p style={{ fontSize: 18 }}>
          Score: {score} / {questions.length}
        </p>

        <button
          onClick={restart}
          style={{
            marginTop: 20,
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            background: "#4A90E2",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Review Again
        </button>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ padding: 30 }}>
      <h2>Saved Words Review</h2>

      <p style={{ marginTop: 10 }}>
        Question {current + 1} / {questions.length}
      </p>

      <div
        style={{
          height: 8,
          background: "#eee",
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            background: "#4A90E2",
            height: "100%",
          }}
        />
      </div>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 14,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        <p>
          <strong>Definition:</strong>
        </p>

        <p style={{ fontSize: 18 }}>{q.definition}</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 20,
          }}
        >
          {q.options.map((opt) => {
            let bg = "#f4f4f4";

            if (selected) {
              if (opt === q.correct) bg = "#a5d6a7";
              else if (opt === selected) bg = "#ef9a9a";
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: bg,
                  fontSize: 16,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {selected && (
          <button
            onClick={next}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              border: "none",
              borderRadius: 8,
              background: "#4A90E2",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default SavedWordsReview;
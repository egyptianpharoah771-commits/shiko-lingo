import { useEffect, useState } from "react";

const SESSION_SIZE = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(word) {
  if (!word) return;

  if (window.location.hostname === "localhost") {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  } else {
    const audio = new Audio(`/api/tts?text=${encodeURIComponent(word)}`);
    audio.play().catch(() => {});
  }
}

function SavedWordsReview() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const load = async () => {
      const saved = JSON.parse(localStorage.getItem("VOCAB_SAVED") || "[]");

      if (!saved.length) {
        setLoading(false);
        return;
      }

      const dict = {};

      for (const word of saved) {
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          if (res.ok) {
            const data = await res.json();
            const def =
              data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";
            dict[word] = def;
          }
        } catch {
          dict[word] = "";
        }
      }

      const qs = [];

      for (const word of saved) {
        const definition = dict[word];
        if (!definition) continue;

        const typeRand = Math.random();

        if (typeRand < 0.33) {
          qs.push({
            type: "mcq",
            definition,
            correct: word,
          });
        } else if (typeRand < 0.66) {
          qs.push({
            type: "typing",
            definition,
            correct: word,
          });
        } else {
          qs.push({
            type: "listening",
            correct: word,
          });
        }
      }

      const session = shuffle(qs).slice(0, SESSION_SIZE);

      const wordBank = shuffle(saved);

      const final = session.map((q) => {
        if (q.type !== "mcq") return q;

        const wrong = wordBank.filter((w) => w !== q.correct).slice(0, 3);

        return {
          ...q,
          options: shuffle([q.correct, ...wrong]),
        };
      });

      setQuestions(final);
      setLoading(false);
    };

    load();
  }, []);

  function next() {
    setSelected(null);
    setInput("");
    setCurrent((c) => c + 1);
  }

  function answer(option, correct) {
    if (selected) return;

    setSelected(option);

    if (option === correct) {
      setScore((s) => s + 1);
    }
  }

  function submitTyping(correct) {
    if (!input) return;

    const ans = input.trim().toLowerCase();

    setSelected(ans);

    if (ans === correct.toLowerCase()) {
      setScore((s) => s + 1);
    }
  }

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
        <h2>Session Complete 🎉</h2>
        <p>
          Score: {score} / {questions.length}
        </p>
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div style={{ padding: 30 }}>
      <h2>Saved Words Review</h2>

      <p>
        Question {current + 1} / {questions.length}
      </p>

      <div
        style={{
          height: 8,
          background: "#eee",
          borderRadius: 5,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#4A90E2",
          }}
        />
      </div>

      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        }}
      >
        {q.type === "mcq" && (
          <>
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
                    onClick={() => answer(opt, q.correct)}
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
          </>
        )}

        {q.type === "typing" && (
          <>
            <p>
              <strong>Definition:</strong>
            </p>

            <p style={{ fontSize: 18 }}>{q.definition}</p>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type the word..."
              style={{
                marginTop: 15,
                padding: 10,
                width: "100%",
                fontSize: 16,
              }}
            />

            <button
              onClick={() => submitTyping(q.correct)}
              style={{
                marginTop: 10,
                padding: "8px 14px",
              }}
            >
              Submit
            </button>

            {selected && (
              <p style={{ marginTop: 10 }}>
                Correct answer: <b>{q.correct}</b>
              </p>
            )}
          </>
        )}

        {q.type === "listening" && (
          <>
            <p>
              <strong>Listen and choose the word</strong>
            </p>

            <button
              onClick={() => speak(q.correct)}
              style={{
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              🔊 Play
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {shuffle([q.correct, ...shuffle(questions.map(x => x.correct)).slice(0,3)])
                .slice(0,4)
                .map((opt) => {
                  let bg = "#f4f4f4";

                  if (selected) {
                    if (opt === q.correct) bg = "#a5d6a7";
                    else if (opt === selected) bg = "#ef9a9a";
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => answer(opt, q.correct)}
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
          </>
        )}

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



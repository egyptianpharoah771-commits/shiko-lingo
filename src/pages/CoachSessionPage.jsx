import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { generateCoachSession, updateWordStats } from "../coach/coachEngine";
import { useWords } from "../hooks/useWords";

export default function CoachSessionPage() {
  const navigate = useNavigate();
  const { level } = useParams();
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type") || "mixed"; // ✅ Session Type

  const { words, loading } = useWords(level);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // ✅ Generate Session
  useEffect(() => {
    if (loading) return;
    if (!words || !words.length) return;

    const session = generateCoachSession(words, { type });

    setQuestions(session);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setShowAnswer(false);
  }, [words, loading, type]);

  const current = questions[currentIndex];

  function handleSelect(option) {
    if (showAnswer || !current) return;

    setSelected(option);
    setShowAnswer(true);

    const isCorrect = option === current.correctAnswer;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    updateWordStats(current.wordId, isCorrect);
  }

  function handleNext() {
    if (!current) return;

    setSelected(null);
    setShowAnswer(false);

    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleRestart() {
    if (!words || !words.length) return;

    const session = generateCoachSession(words, { type });

    setQuestions(session);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setShowAnswer(false);
  }

  // ✅ Loading State
  if (loading || !questions.length) {
    return <p style={{ textAlign: "center" }}>Loading session...</p>;
  }

  // ✅ Finished State
  if (finished) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2>🎯 Session Complete</h2>

        <p>
          Score: {score} / {questions.length}
        </p>

        <button
          onClick={handleRestart}
          style={{
            padding: "10px 16px",
            margin: "10px",
            background: "#4A90E2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
        >
          🔁 Try Again
        </button>

        <button
          onClick={() => navigate(`/coach/${level}`)}
          style={{
            padding: "10px 16px",
            margin: "10px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
        >
          🧠 Back to Coach
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h3>
        Question {currentIndex + 1} / {questions.length}
      </h3>

      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        {current.question}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {current.options.map((opt, i) => {
          let bg = "#f3f3f3";

          if (showAnswer) {
            if (opt === current.correctAnswer) bg = "#4CAF50";
            else if (opt === selected) bg = "#E53935";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              style={{
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: bg,
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <button
          onClick={handleNext}
          style={{
            marginTop: "20px",
            padding: "10px 16px",
            background: "#4A90E2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
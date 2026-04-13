import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateCoachSession, updateWordStats } from "../coach/coachEngine";
import { useWords } from "../hooks/useWords";
import { useAuth } from "../context/AuthContext";
import { saveCoachSessionResult } from "../services/coachSessionService";

// 🔊 SFX
import { initSFX, playSelect, playCorrect, playWrong } from "../utils/sfx";

const LEVEL_BADGE_COLORS = {
  A1: "#2e7d32",
  A2: "#558b2f",
  B1: "#f9a825",
  B2: "#ef6c00",
  C1: "#c62828",
};

export default function CoachSessionPage() {
  const navigate = useNavigate();
  const { level } = useParams();
  const { user } = useAuth();

  const { words, loading } = useWords(level || "A1");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // 🔥 init SFX once
  useEffect(() => {
    initSFX();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!words || !words.length) return;
    const requestedLevel = (level || "A1").toUpperCase();
    const mismatch = words.some(
      (w) => w?.level && String(w.level).toUpperCase() !== requestedLevel
    );
    if (mismatch) return;

    const session = generateCoachSession(words, {
      level: requestedLevel,
    });

    setQuestions(session || []);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setShowAnswer(false);
  }, [words, loading, level]);

  const current = questions[currentIndex];
  const currentLevel = (level || "A1").toUpperCase();
  const levelBadgeColor = LEVEL_BADGE_COLORS[currentLevel] || LEVEL_BADGE_COLORS.A1;

  function handleSelect(option) {
    if (showAnswer || !current) return;

    // 🔊 select sound
    playSelect();

    setSelected(option);
    setShowAnswer(true);

    const isCorrect = option === current.correctAnswer;

    if (isCorrect) {
      playCorrect();
      setScore((prev) => prev + 1);
    } else {
      playWrong();
    }

    updateWordStats(current.wordId, isCorrect);
  }

  function handleNext() {
    if (!current) return;

    setSelected(null);
    setShowAnswer(false);

    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      saveCoachSessionResult({
        user,
        level,
        score: selected === current.correctAnswer ? score + 1 : score,
        totalQuestions: questions.length,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleRestart() {
    if (!words || !words.length) return;

    const session = generateCoachSession(words, {
      level: (level || "A1").toUpperCase(),
    });

    setQuestions(session || []);
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setSelected(null);
    setShowAnswer(false);
  }

  /* =========================
     🔥 GUARDS
  ========================= */
  const muted = { textAlign: "center", color: "#212529", padding: "24px 16px" };

  if (loading) {
    return <p style={muted}>Loading session...</p>;
  }

  if (!questions.length) {
    return (
      <p style={muted}>
        ⚠️ No questions generated (check coachEngine)
      </p>
    );
  }

  if (!current || !current.options || !current.options.length) {
    return (
      <p style={muted}>
        ⚠️ Question data invalid (no options)
      </p>
    );
  }

  if (finished) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <h2>🎯 Session Complete - {(level || "A1").toUpperCase()}</h2>

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
          onClick={() => navigate("/coach")}
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
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center",
        color: "#212529",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            background: levelBadgeColor,
          }}
        >
          Level: {currentLevel}
        </span>
      </div>
      <h3>
        Question {currentIndex + 1} / {questions.length}
      </h3>

      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        {current.question}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {(current.options || []).map((opt, i) => {
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
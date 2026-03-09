import { useEffect, useState } from "react";
import {
  getWordsForReview,
  updateWordStage,
} from "./spacedRepetition";
import { addQuizXP } from "../utils/xpEngine";

function VocabularyQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const normalize = (v) =>
    (v || "").toString().trim().toLowerCase();

  /* =========================
     Unified Pronunciation Engine
     Hybrid Mode:
     localhost → SpeechSynthesis
     production → /api/tts
  ========================= */
  const speakWord = (word) => {
    if (!word) return;

    /* Localhost fallback */
    if (window.location.hostname === "localhost") {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "en-US";
      speechSynthesis.speak(utter);
      return;
    }

    /* Production TTS */
    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(word)}`
    );

    audio.play().catch((err) => {
      console.warn("TTS playback failed:", err);
    });
  };

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );

    const reviewWords = getWordsForReview(saved);

    if (!reviewWords.length) {
      setLoading(false);
      return;
    }

    const loadQuiz = async () => {
      const questions = [];

      for (const word of reviewWords) {
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          if (!res.ok) continue;

          const data = await res.json();

          const definition =
            data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

          if (!definition) continue;

          questions.push({
            word,
            definition,
          });
        } catch {}
      }

      setQuiz(questions);
      setLoading(false);
    };

    loadQuiz();
  }, []);

  const handleAnswer = (index, value) => {
    if (submitted) return;

    setAnswers({
      ...answers,
      [index]: value,
    });
  };

  const handleSubmit = () => {
    if (submitted) return;

    let correct = 0;

    quiz.forEach((q, i) => {
      const isCorrect =
        normalize(answers[i]) === normalize(q.word);

      if (isCorrect) correct++;

      updateWordStage(q.word, isCorrect);
    });

    setScore(correct);
    setSubmitted(true);

    /* XP Tracking */
    addQuizXP();
  };

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Preparing your review...</h2>
      </div>
    );
  }

  if (!quiz.length) {
    return (
      <div style={{ padding: 30 }}>
        <h2>No words ready for review.</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>🧠 Smart Vocabulary Review</h1>

      {quiz.map((q, i) => {
        const correct =
          normalize(answers[i]) === normalize(q.word);

        return (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              padding: 18,
              borderRadius: 12,
              marginBottom: 16,
              background: "#fafafa",
            }}
          >
            <p>
              <strong>
                What word matches this definition?
              </strong>
            </p>

            <p style={{ fontStyle: "italic" }}>
              {q.definition}
            </p>

            <input
              type="text"
              disabled={submitted}
              value={answers[i] || ""}
              onChange={(e) =>
                handleAnswer(i, e.target.value)
              }
              style={{
                width: "100%",
                padding: 10,
                marginTop: 10,
              }}
            />

            {submitted && (
              <div style={{ marginTop: 10 }}>
                {correct ? (
                  <span style={{ color: "green" }}>
                    ✅ Correct
                  </span>
                ) : (
                  <span style={{ color: "red" }}>
                    ❌ {q.word}
                  </span>
                )}

                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => speakWord(q.word)}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={submitted}
        style={{ padding: 12 }}
      >
        Submit Review
      </button>

      {submitted && (
        <h2 style={{ marginTop: 20 }}>
          Score: {score} / {quiz.length}
        </h2>
      )}
    </div>
  );
}

export default VocabularyQuiz;
import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import STORAGE_KEYS from "../utils/storageKeys";
import { askAITutor } from "../utils/aiClient";
import { getUserId } from "../utils/userIdentity";
import AIResponseModal from "../components/AIResponseModal";

// ===== A1 Units =====
import a1Content1 from "./A1/unit1/content";
import a1Questions1 from "./A1/unit1/questions";
import a1Content2 from "./A1/unit2/content";
import a1Questions2 from "./A1/unit2/questions";

// ===== A2 Units =====
import a2Content1 from "./A2/unit1/content";
import a2Questions1 from "./A2/unit1/questions";
import a2Content2 from "./A2/unit2/content";
import a2Questions2 from "./A2/unit2/questions";

// ===== B1 Units =====
import b1Content1 from "./B1/unit1/content";
import b1Questions1 from "./B1/unit1/questions";
import b1Content2 from "./B1/unit2/content";
import b1Questions2 from "./B1/unit2/questions";
import b1Content3 from "./B1/unit3/content";
import b1Questions3 from "./B1/unit3/questions";

const GRAMMAR_MAP = {
  A1: {
    unit1: { content: a1Content1, questions: a1Questions1 },
    unit2: { content: a1Content2, questions: a1Questions2 },
  },
  A2: {
    unit1: { content: a2Content1, questions: a2Questions1 },
    unit2: { content: a2Content2, questions: a2Questions2 },
  },
  B1: {
    unit1: { content: b1Content1, questions: b1Questions1 },
    unit2: { content: b1Content2, questions: b1Questions2 },
    unit3: { content: b1Content3, questions: b1Questions3 },
  },
};

function GrammarUnitPage() {
  const { level, unit } = useParams();
  const grammarUnit = GRAMMAR_MAP[level]?.[unit];
  const content = grammarUnit?.content;
  const questions = grammarUnit?.questions || [];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // 🤖 AI
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  // 🔊 Audio refs
  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  // 🔊 TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);

  const userId = getUserId();
  const packageName = "FREE";

  const storageKey = STORAGE_KEYS.GRAMMAR_COMPLETED;
  const completedUnits =
    JSON.parse(localStorage.getItem(storageKey)) || [];

  const unitKey = `${level}-${unit}`;
  const isCompleted = completedUnits.includes(unitKey);

  const PASS_SCORE = Math.ceil(questions.length * 0.7);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setAiOpen(false);
    setAiStatus("IDLE");
    setAiMessage("");
    setIsSpeaking(false);

    // Fallback-safe audio init
    const safeAudio = (src) => {
      try {
        const a = new Audio(src);
        a.volume = 0.6;
        return a;
      } catch {
        return null;
      }
    };

    selectSound.current = safeAudio("/sounds/select.mp3");
    correctSound.current = safeAudio("/sounds/correct.mp3");
    wrongSound.current = safeAudio("/sounds/wrong.mp3");
  }, [level, unit]);

  if (!content || !questions.length) {
    return <p>Unit not found</p>;
  }

  const safePlay = (ref) => {
    try {
      ref?.current?.play?.();
    } catch {}
  };

  const handleAnswer = (qId, option) => {
    if (submitted) return;
    safePlay(selectSound);
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = () => {
    if (submitted) return;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    correct >= PASS_SCORE
      ? safePlay(correctSound)
      : safePlay(wrongSound);
  };

  // 🔊 TTS
  const toggleExplanationAudio = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      content.explanation
    );
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAIFeedback = async () => {
    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    try {
      const result = await askAITutor({
        skill: "Grammar",
        level,
        lessonTitle: content.title,
        text: content.explanation,
        score,
        total: questions.length,
        userId,
        packageName,
      });

      setAiStatus(result?.status || "ERROR");
      setAiMessage(result?.message || "");
    } catch {
      setAiStatus("ERROR");
      setAiMessage("AI feedback unavailable.");
    }
  };

  const passed = score !== null && score >= PASS_SCORE;

  const handleFinishUnit = () => {
    if (!passed || isCompleted) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify([...completedUnits, unitKey])
    );
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>{content.title}</h2>
      <p>{content.explanation}</p>

      {/* 🔊 Lesson Audio */}
      <button
        onClick={toggleExplanationAudio}
        style={{
          marginBottom: 15,
          padding: "8px 14px",
          borderRadius: 8,
          background: isSpeaking ? "#6c757d" : "#0a58ca",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {isSpeaking ? "⏸ Stop Explanation" : "▶️ Play Explanation"}
      </button>

      {submitted && (
        <button
          onClick={handleAIFeedback}
          style={{
            marginLeft: 10,
            padding: "8px 14px",
            borderRadius: 8,
            background: "#111",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🤖 AI Lesson Feedback
        </button>
      )}

      <h4>Questions</h4>

      {questions.map((q) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.answer;

        return (
          <div key={q.id} style={{ marginBottom: 12 }}>
            <strong>{q.question}</strong>
            <div style={{ marginTop: 6 }}>
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.id, opt)}
                  disabled={submitted}
                  style={{
                    marginRight: 6,
                    padding: "6px 10px",
                    background:
                      userAnswer === opt ? "#e5e9ff" : "#eee",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {submitted && (
              <p>{isCorrect ? "✅ Correct" : "❌ Wrong"}</p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button onClick={handleSubmit}>Check Answers</button>
      )}

      {submitted && (
        <p>
          Score: {score} / {questions.length}
        </p>
      )}

      <button
        onClick={handleFinishUnit}
        disabled={!passed || isCompleted}
      >
        Finish Unit
      </button>

      <div style={{ marginTop: 20 }}>
        <Link to={`/grammar/${level}`}>
          Back to Grammar {level}
        </Link>
      </div>

      <AIResponseModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        status={aiStatus}
        message={aiMessage}
      />
    </div>
  );
}

export default GrammarUnitPage;

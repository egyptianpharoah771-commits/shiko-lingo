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

// ===== B2 Units =====
import b2Content1 from "./B2/unit1/content";
import b2Questions1 from "./B2/unit1/questions";
import b2Content2 from "./B2/unit2/content";
import b2Questions2 from "./B2/unit2/questions";

// ===== C1 Units =====
import c1Content1 from "./C1/unit1/content";
import c1Questions1 from "./C1/unit1/questions";
import c1Content2 from "./C1/unit2/content";
import c1Questions2 from "./C1/unit2/questions";

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
  B2: {
    unit1: { content: b2Content1, questions: b2Questions1 },
    unit2: { content: b2Content2, questions: b2Questions2 },
  },
  C1: {
    unit1: { content: c1Content1, questions: c1Questions1 },
    unit2: { content: c1Content2, questions: c1Questions2 },
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

  // 🔊 Sounds
  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

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

    selectSound.current = new Audio("/sounds/select.mp3");
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
  }, [level, unit]);

  if (!content || !questions.length) {
    return <p>Unit not found</p>;
  }

  const play = (ref) => {
    try {
      ref?.current?.play();
    } catch {}
  };

  const handleAnswer = (qId, option) => {
    if (submitted) return;
    play(selectSound);
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
      ? play(correctSound)
      : play(wrongSound);
  };

  const handleAIFeedback = async () => {
    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

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

      {submitted && (
        <button onClick={handleAIFeedback}>
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

      <Link to={`/grammar/${level}`}>Back</Link>

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

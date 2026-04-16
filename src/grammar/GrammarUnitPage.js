import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useFeedbackSounds from "../core/feedback/useFeedbackSounds";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import STORAGE_KEYS from "../utils/storageKeys";
import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";
import { useFeatureAccess } from "../hooks/useFeatureAccess";

/* ===== CONTENT IMPORTS ===== */
import a1Content1 from "./A1/unit1/content";
import a1Questions1 from "./A1/unit1/questions";
import a1Content2 from "./A1/unit2/content";
import a1Questions2 from "./A1/unit2/questions";

import a2Content1 from "./A2/unit1/content";
import a2Questions1 from "./A2/unit1/questions";
import a2Content2 from "./A2/unit2/content";
import a2Questions2 from "./A2/unit2/questions";

import b1Content1 from "./B1/unit1/content";
import b1Questions1 from "./B1/unit1/questions";
import b1Content2 from "./B1/unit2/content";
import b1Questions2 from "./B1/unit2/questions";
import b1Content3 from "./B1/unit3/content";
import b1Questions3 from "./B1/unit3/questions";

import b2Content1 from "./B2/unit1/content";
import b2Questions1 from "./B2/unit1/questions";
import b2Content2 from "./B2/unit2/content";
import b2Questions2 from "./B2/unit2/questions";
import b2Content3 from "./B2/unit3/content";
import b2Questions3 from "./B2/unit3/questions";
import b2Content4 from "./B2/unit4/content";
import b2Questions4 from "./B2/unit4/questions";

import c1Content1 from "./C1/unit1/content";
import c1Questions1 from "./C1/unit1/questions";
import c1Content2 from "./C1/unit2/content";
import c1Questions2 from "./C1/unit2/questions";
import c1Content3 from "./C1/unit3/content";
import c1Questions3 from "./C1/unit3/questions";
import c1Content4 from "./C1/unit4/content";
import c1Questions4 from "./C1/unit4/questions";

/* ===== MAP ===== */
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
    unit3: { content: b2Content3, questions: b2Questions3 },
    unit4: { content: b2Content4, questions: b2Questions4 },
  },
  C1: {
    unit1: { content: c1Content1, questions: c1Questions1 },
    unit2: { content: c1Content2, questions: c1Questions2 },
    unit3: { content: c1Content3, questions: c1Questions3 },
    unit4: { content: c1Content4, questions: c1Questions4 },
  },
};

function GrammarUnitPage() {
  const { level, unit } = useParams();
  const navigate = useNavigate();

  const grammarUnit = GRAMMAR_MAP[level]?.[unit] || {};
  const content = grammarUnit.content || {};
  const questions = Array.isArray(grammarUnit.questions)
    ? grammarUnit.questions
    : [];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [score, setScore] = useState(0);
  const [weakPoints, setWeakPoints] = useState([]);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  const { canGetAIFeedback, userId, packageName } = useFeatureAccess({
    skill: "Grammar",
    level,
  });

  const feedback = useFeedbackSounds();

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setPassed(false);
    setScore(0);
    setWeakPoints([]);
    setAiStatus("IDLE");
    setAiMessage("");
    feedback.reset();
  }, [level, unit]);

  const selectAnswer = (id, value) => {
    if (submitted) return;

    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const saveProgress = () => {
    try {
      const raw = localStorage.getItem(
        STORAGE_KEYS.GRAMMAR_COMPLETED
      );

      const stored = raw ? JSON.parse(raw) : [];

      const unitKey = `${level}-${unit}`;

      if (!stored.includes(unitKey)) {
        const updated = [...stored, unitKey];

        localStorage.setItem(
          STORAGE_KEYS.GRAMMAR_COMPLETED,
          JSON.stringify(updated)
        );
      }
    } catch (err) {
      console.error("Progress save failed:", err);
    }
  };

  const submitAnswers = () => {
    let correct = 0;
    const weak = [];

    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      } else {
        weak.push(q.question);
      }
    });

    const isPassed = correct >= Math.ceil(questions.length * 0.6);

    setSubmitted(true);
    setPassed(isPassed);
    setScore(correct);
    setWeakPoints(weak);

    if (isPassed) {
      saveProgress(); // ✅ الآن متوافق
    }

    return isPassed;
  };

  const handleSubmit = () => {
    const result = submitAnswers();
    result ? feedback.correct() : feedback.wrong();
  };

  const handleAIFeedback = async () => {
    setAiOpen(true);

    if (!canGetAIFeedback) {
      setAiStatus("LIMIT");
      setAiMessage("AI feedback is available after completing lessons.");
      return;
    }

    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Grammar",
      level,
      lessonTitle: content?.title || unit,
      studentText: `Correct answers: ${score}/${questions.length}.`,
      score,
      total: questions.length,
      weakPoints,
      userId,
      packageName,
    });

    setAiStatus(result.status);
    setAiMessage(result.message || "");
  };

  const handleNextUnit = () => {
    feedback.reset();

    const currentNum = parseInt(unit.replace("unit", ""), 10);
    const nextUnit = `unit${currentNum + 1}`;

    if (GRAMMAR_MAP[level]?.[nextUnit]) {
      navigate(`/grammar/${level}/${nextUnit}`);
    } else {
      navigate(`/grammar/${level}`);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={heroCardStyle}>
        <h2 style={{ marginTop: 0 }}>{content?.title || "Lesson"}</h2>
        <p style={{ color: "#5c6370", marginBottom: 0 }}>{content?.explanation || ""}</p>
      </div>

      {questions.map((q) => (
        <div key={q.id} style={questionCardStyle}>
          <strong>{q.question}</strong>

          <div style={{ marginTop: 10 }}>
            {(q.options || []).map((opt) => (
              <AnswerOption
                key={opt}
                label={opt}
                disabled={submitted}
                state={
                  submitted
                    ? opt === q.answer
                      ? "correct"
                      : answers[q.id] === opt
                      ? "wrong"
                      : "default"
                    : answers[q.id] === opt
                    ? "selected"
                    : "default"
                }
                onClick={() => {
                  feedback.select();
                  selectAnswer(q.id, opt);
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {!submitted && questions.length > 0 && (
        <button onClick={handleSubmit} style={primaryBtnStyle}>Check Answers</button>
      )}

      <div style={{ marginTop: 12 }}>
        <button onClick={handleAIFeedback} disabled={!submitted} style={secondaryBtnStyle}>
          🤖 AI Lesson Feedback
        </button>
      </div>

      {submitted && passed && (
        <button onClick={handleNextUnit} style={{ ...primaryBtnStyle, marginTop: 10 }}>Next Unit →</button>
      )}

      <AIResponseModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        status={aiStatus}
        message={aiMessage}
      />
    </div>
  );
}

const pageStyle = {
  maxWidth: 820,
  margin: "0 auto",
};

const heroCardStyle = {
  background: "#fff",
  border: "1px solid #ece8fb",
  borderRadius: 16,
  boxShadow: "0 8px 20px rgba(45,37,89,0.08)",
  padding: 20,
  marginBottom: 16,
};

const questionCardStyle = {
  marginBottom: 14,
  background: "#fff",
  border: "1px solid #ece8fb",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 4px 12px rgba(45,37,89,0.06)",
};

const primaryBtnStyle = {
  background: "#6c4de6",
  border: "1px solid #583bc4",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "#f3efff",
  border: "1px solid #d8cbff",
  color: "#3f2e95",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};

export default GrammarUnitPage;
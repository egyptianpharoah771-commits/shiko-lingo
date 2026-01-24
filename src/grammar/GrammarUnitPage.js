import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useSounds from "../hooks/useSounds";
import AIResponseModal from "../components/AIResponseModal";

// ===== CONTENT IMPORTS =====
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

// ===== MAP =====
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

  const grammarUnit = GRAMMAR_MAP[level]?.[unit];
  const content = grammarUnit?.content;
  const questions = grammarUnit?.questions || [];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  const { playSelect, playCorrect, playWrong } = useSounds();

  const PASS_SCORE = Math.ceil(questions.length * 0.7);
  const passed = submitted && score >= PASS_SCORE;

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setAiOpen(false);
    setAiStatus("IDLE");
    setAiMessage("");
  }, [level, unit]);

  if (!content) return <p>⚠️ Unit not ready.</p>;

  const handleAnswer = (id, opt) => {
    if (submitted) return;
    playSelect();
    setAnswers((prev) => ({ ...prev, [id]: opt }));
  };

  const handleSubmit = () => {
    if (submitted) return;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (correct >= PASS_SCORE) playCorrect();
    else playWrong();
  };

  const handleNextUnit = () => {
    const currentNum = parseInt(unit.replace("unit", ""), 10);
    const nextUnit = `unit${currentNum + 1}`;

    if (GRAMMAR_MAP[level]?.[nextUnit]) {
      navigate(`/grammar/${level}/${nextUnit}`);
    } else {
      navigate(`/grammar/${level}`);
    }
  };

  // ===== AI FEEDBACK =====
  const handleAIFeedback = async () => {
    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `
The student finished a grammar lesson.

Score: ${score} / ${questions.length}

Lesson title: ${content.title}

Lesson explanation:
${content.explanation}

Give short, clear, helpful feedback.
          `.trim(),
          level,
          lessonTitle: content.title,
          text: content.explanation,
        }),
      });

      const data = await res.json();

      const cleaned =
        typeof data.answer === "string" && data.answer.trim().length > 0
          ? data.answer.trim()
          : "Good job! Review the lesson once more and keep practicing.";

      setAiMessage(cleaned);
      setAiStatus("SUCCESS");
    } catch {
      setAiStatus("ERROR");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>{content.title}</h2>
      <p>{content.explanation}</p>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 22 }}>
          <strong>{q.question}</strong>

          <div style={{ marginTop: 8 }}>
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt;
              const correct = submitted && opt === q.answer;
              const wrong = submitted && selected && opt !== q.answer;

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.id, opt)}
                  style={{
                    padding: "10px 16px",
                    marginRight: 10,
                    marginTop: 6,
                    fontWeight: "bold",
                    backgroundColor: correct
                      ? "#2f9e44"
                      : wrong
                      ? "#c92a2a"
                      : selected
                      ? "#364fc7"
                      : "#dee2e6",
                    color:
                      correct || wrong || selected ? "#fff" : "#000",
                    border: "none",
                    borderRadius: 6,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted && (
        <button onClick={handleSubmit} style={{ marginTop: 14 }}>
          Check Answers
        </button>
      )}

      {submitted && (
        <button onClick={handleAIFeedback} style={{ marginTop: 16 }}>
          🤖 Get AI Feedback
        </button>
      )}

      {passed && (
        <button onClick={handleNextUnit} style={{ marginTop: 20 }}>
          Next Unit →
        </button>
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

export default GrammarUnitPage;
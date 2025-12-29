import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

// ===== Grammar Map (CORE ARCHITECTURE) =====
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

  // ===== State =====
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ===== Resolve content =====
  const grammarUnit = GRAMMAR_MAP[level]?.[unit];
  const content = grammarUnit?.content;
  const questions = grammarUnit?.questions || [];

  // ===== Dynamic pass score (70%) =====
  const PASS_SCORE = Math.ceil(questions.length * 0.7);

  // ===== Progress =====
  const storageKey = "completedGrammarUnits";
  const completedUnits =
    JSON.parse(localStorage.getItem(storageKey)) || [];

  const unitKey = `${level}-${unit}`;
  const isCompleted = completedUnits.includes(unitKey);

  // ===== Reset on unit change =====
  useEffect(() => {
    setAnswers({});
    setScore(null);
    setSubmitted(false);
  }, [level, unit]);

  // ===== Guards =====
  if (!content || !questions.length) {
    return <p>❌ Unit not found</p>;
  }

  // ===== Handlers =====
  const handleAnswer = (qId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const finishUnit = () => {
    if (!isCompleted) {
      const updated = [...completedUnits, unitKey];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      alert("🎉 Unit completed successfully!");
    }
  };

  const allAnswered =
    Object.keys(answers).length === questions.length;
  const passed = score !== null && score >= PASS_SCORE;

  return (
    <div>
      <h2>{content.title}</h2>
      <p>{content.explanation}</p>

      <h4>Rules</h4>
      <ul>
        {content.rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>

      <h4>Examples</h4>
      <ul>
        {content.examples.map((ex, i) => (
          <li key={i}>{ex}</li>
        ))}
      </ul>

      <h4>Questions</h4>

      {questions.map((q) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.answer;

        return (
          <div
            key={q.id}
            style={{
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "8px",
              border: submitted
                ? isCorrect
                  ? "2px solid #28a745"
                  : "2px solid #dc3545"
                : "1px solid #ddd",
              backgroundColor: submitted
                ? isCorrect
                  ? "#eaffea"
                  : "#ffecec"
                : "#fff",
            }}
          >
            <p>{q.question}</p>

            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                disabled={submitted}
                style={{
                  marginRight: "6px",
                  marginTop: "5px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: submitted ? "default" : "pointer",
                  backgroundColor:
                    userAnswer === opt
                      ? "#cce5ff"
                      : "#eee",
                }}
              >
                {opt}
              </button>
            ))}

            {submitted && (
              <p
                style={{
                  marginTop: "6px",
                  fontWeight: "bold",
                  color: isCorrect ? "green" : "red",
                }}
              >
                {isCorrect ? "✅ Correct" : "❌ Wrong"}
              </p>
            )}
          </div>
        );
      })}

      {/* ===== Actions ===== */}
      {!submitted && (
        <button
          onClick={calculateScore}
          disabled={!allAnswered}
        >
          Check Answers
        </button>
      )}

      {submitted && (
        <p style={{ fontWeight: "bold", marginTop: "10px" }}>
          Your score: {score} / {questions.length}{" "}
          {passed ? "✅ Passed" : "❌ Try again"}
        </p>
      )}

      <button
        onClick={finishUnit}
        disabled={!passed || isCompleted}
        style={{ marginTop: "10px" }}
      >
        {isCompleted ? "✅ Completed" : "Finish Unit"}
      </button>
    </div>
  );
}

export default GrammarUnitPage;

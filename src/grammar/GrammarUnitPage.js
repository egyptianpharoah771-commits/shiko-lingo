import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

import STORAGE_KEYS from "../utils/storageKeys";

// Feature Gating
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

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

  const { canAccess } = useFeatureAccess({
    skill: "Grammar",
    level,
  });

  const grammarUnit = GRAMMAR_MAP[level]?.[unit];
  const content = grammarUnit?.content;
  const questions = grammarUnit?.questions || [];

  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const storageKey = STORAGE_KEYS.GRAMMAR_COMPLETED;
  const completedUnits =
    JSON.parse(localStorage.getItem(storageKey)) || [];

  const unitKey = `${level}-${unit}`;
  const isCompleted = completedUnits.includes(unitKey);

  const PASS_SCORE = Math.ceil(questions.length * 0.7);

  useEffect(() => {
    setAnswers({});
    setScore(null);
    setSubmitted(false);
  }, [level, unit]);

  if (!canAccess) {
    return <LockedFeature title="Grammar Unit" />;
  }

  if (!content || !questions.length) {
    return <p>Unit not found</p>;
  }

  const allAnswered =
    Object.keys(answers).length === questions.length;

  const passed =
    score !== null && score >= PASS_SCORE;

  const handleAnswer = (qId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const handleSubmit = () => {
    if (!allAnswered || submitted) return;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);
  };

  const handleFinishUnit = () => {
    if (!passed || isCompleted) return;

    const updated = [...completedUnits, unitKey];
    localStorage.setItem(
      storageKey,
      JSON.stringify(updated)
    );
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
          <div key={q.id}>
            <strong>{q.question}</strong>
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                disabled={submitted}
              >
                {opt}
              </button>
            ))}
            {submitted && (
              <p>{isCorrect ? "Correct" : "Wrong"}</p>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          Check Answers
        </button>
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

      <div>
        <Link to={`/grammar/${level}`}>
          Back to Grammar {level}
        </Link>
      </div>
    </div>
  );
}

export default GrammarUnitPage;

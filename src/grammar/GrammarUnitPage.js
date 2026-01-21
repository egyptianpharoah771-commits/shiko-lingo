import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

import STORAGE_KEYS from "../utils/storageKeys";

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
import b2Content3 from "./B2/unit3/content";
import b2Questions3 from "./B2/unit3/questions";
import b2Content4 from "./B2/unit4/content";
import b2Questions4 from "./B2/unit4/questions";

// ===== C1 Units =====
import c1Content1 from "./C1/unit1/content";
import c1Questions1 from "./C1/unit1/questions";
import c1Content2 from "./C1/unit2/content";
import c1Questions2 from "./C1/unit2/questions";
import c1Content3 from "./C1/unit3/content";
import c1Questions3 from "./C1/unit3/questions";
import c1Content4 from "./C1/unit4/content";
import c1Questions4 from "./C1/unit4/questions";

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

  const selectSound = useRef(null);

  const storageKey = STORAGE_KEYS.GRAMMAR_COMPLETED;
  const completedUnits =
    JSON.parse(localStorage.getItem(storageKey)) || [];

  const unitKey = `${level}-${unit}`;

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    selectSound.current = new Audio("/sounds/select.mp3");
  }, [level, unit]);

  if (!content || !questions.length) {
    return <p>⚠️ This unit is not ready yet.</p>;
  }

  const handleAnswer = (qId, option) => {
    if (submitted) return;
    selectSound.current?.play();
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = () => {
    if (submitted) return;

    setSubmitted(true);

    if (!completedUnits.includes(unitKey)) {
      localStorage.setItem(
        storageKey,
        JSON.stringify([...completedUnits, unitKey])
      );
    }
  };

  const handleNextUnit = () => {
    const currentNumber = parseInt(unit.replace("unit", ""), 10);
    const nextUnitId = `unit${currentNumber + 1}`;

    if (GRAMMAR_MAP[level]?.[nextUnitId]) {
      navigate(`/grammar/${level}/${nextUnitId}`);
    } else {
      navigate(`/grammar/${level}`);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>{content.title}</h2>
      <p>{content.explanation}</p>

      <h4>Questions</h4>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 10 }}>
          <strong>{q.question}</strong>
          <div>
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(q.id, opt)}
                disabled={submitted}
                style={{ marginRight: 6 }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted && (
        <button onClick={handleSubmit}>
          Check Answers
        </button>
      )}

      {submitted && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "2px solid green",
            background: "#f0fff4",
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: "bold" }}>
            NEXT UNIT SHOULD APPEAR NOW
          </p>
          <button onClick={handleNextUnit}>
            Next Unit →
          </button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <Link to={`/grammar/${level}`}>Back</Link>
      </div>
    </div>
  );
}

export default GrammarUnitPage;

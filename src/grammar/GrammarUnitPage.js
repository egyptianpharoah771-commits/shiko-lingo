import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useFeedbackSounds from "../core/feedback/useFeedbackSounds";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import STORAGE_KEYS from "../utils/storageKeys";

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

  const feedback = useFeedbackSounds();

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setPassed(false);
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

    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });

    const isPassed = correct >= Math.ceil(questions.length * 0.6);

    setSubmitted(true);
    setPassed(isPassed);

    if (isPassed) {
      saveProgress(); // ✅ الآن متوافق
    }

    return isPassed;
  };

  const handleSubmit = () => {
    const result = submitAnswers();
    result ? feedback.correct() : feedback.wrong();
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
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>{content?.title || "Lesson"}</h2>
      <p>{content?.explanation || ""}</p>

      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 24 }}>
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
        <button onClick={handleSubmit}>Check Answers</button>
      )}

      {submitted && passed && (
        <button onClick={handleNextUnit}>Next Unit →</button>
      )}
    </div>
  );
}

export default GrammarUnitPage;

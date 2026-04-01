import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useFeedbackSounds from "../core/feedback/useFeedbackSounds";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";

/* ===== IMPORTS (زي ما هي) ===== */
// نفس imports اللي عندك بدون تغيير...

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

  const safeTitle = content?.title || "Lesson";
  const safeExplanation = content?.explanation || "";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>{safeTitle}</h2>
      <p>{safeExplanation}</p>

      {questions.map((q) => {
        const options = Array.isArray(q?.options) ? q.options : [];

        return (
          <div key={q?.id || Math.random()} style={{ marginBottom: 24 }}>
            <strong>{q?.question || ""}</strong>

            <div style={{ marginTop: 10 }}>
              {options.map((opt) => (
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
        );
      })}

      {!submitted && questions.length > 0 && (
        <button onClick={handleSubmit} style={{ marginTop: 16 }}>
          Check Answers
        </button>
      )}

      {submitted && passed && (
        <button onClick={handleNextUnit} style={{ marginTop: 20 }}>
          Next Unit →
        </button>
      )}
    </div>
  );
}

export default GrammarUnitPage;
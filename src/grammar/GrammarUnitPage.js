import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

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

  // ===== SOUND REFS =====
  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  const PASS_SCORE = Math.ceil(questions.length * 0.7);
  const passed = submitted && score >= PASS_SCORE;

  // ===== INIT =====
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  }, [level, unit]);

  // ===== LOAD SOUNDS (ONCE) =====
  useEffect(() => {
    selectSound.current = new Audio("/sounds/select.mp3");
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
  }, []);

  if (!content) return <p>⚠️ Unit not ready.</p>;

  // ===== SAFE PLAY =====
  const playSound = (soundRef) => {
    try {
      if (!soundRef.current) return;
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
      soundRef.current.play();
    } catch {
      // silent fail
    }
  };

  const handleAnswer = (id, opt) => {
    if (submitted) return;

    playSound(selectSound);
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

    if (correct >= PASS_SCORE) {
      playSound(correctSound);
    } else {
      playSound(wrongSound);
    }
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

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2>{content.title}</h2>
      <p>{content.explanation}</p>

      {questions.map((q) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.answer;
        const isWrong = submitted && selected && selected !== q.answer;

        return (
          <div key={q.id} style={{ marginBottom: 22 }}>
            <strong>{q.question}</strong>

            <div style={{ marginTop: 8 }}>
              {q.options.map((opt) => {
                const selectedOpt = selected === opt;
                const correctOpt = submitted && opt === q.answer;
                const wrongOpt = submitted && selectedOpt && opt !== q.answer;

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(q.id, opt)}
                    style={{
                      padding: "10px 16px",
                      marginRight: 10,
                      marginTop: 6,
                      fontWeight: "bold",
                      backgroundColor: correctOpt
                        ? "#2f9e44"
                        : wrongOpt
                        ? "#c92a2a"
                        : selectedOpt
                        ? "#364fc7"
                        : "#dee2e6",
                      color:
                        correctOpt || wrongOpt || selectedOpt
                          ? "#ffffff"
                          : "#000000",
                      border: "none",
                      borderRadius: 6,
                      outline: correctOpt
                        ? "3px solid #2f9e44"
                        : wrongOpt
                        ? "3px solid #c92a2a"
                        : selectedOpt
                        ? "3px solid #364fc7"
                        : "1px solid #adb5bd",
                      cursor: submitted ? "not-allowed" : "pointer",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {submitted && isCorrect && (
              <div style={{ marginTop: 6, color: "#2f9e44", fontWeight: "bold" }}>
                ✓ Good choice
              </div>
            )}

            {submitted && isWrong && (
              <div style={{ marginTop: 6, color: "#c92a2a", fontWeight: "bold" }}>
                ✗ Try again
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{ padding: "12px 20px", marginTop: 14, fontWeight: "bold" }}
        >
          Check Answers
        </button>
      )}

      {submitted && (
        <p style={{ marginTop: 16, fontWeight: "bold" }}>
          Score: {score} / {questions.length}
        </p>
      )}

      {passed && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#f0fff4",
            border: "2px solid #2f9e44",
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <p style={{ fontWeight: "bold", color: "#2f9e44" }}>
            🎉 Lesson Completed Successfully
          </p>

          <button
            onClick={handleNextUnit}
            style={{
              marginTop: 10,
              padding: "12px 20px",
              fontWeight: "bold",
              background: "#2f9e44",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Next Unit →
          </button>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Link to={`/grammar/${level}`}>← Back</Link>
      </div>
    </div>
  );
}

export default GrammarUnitPage;
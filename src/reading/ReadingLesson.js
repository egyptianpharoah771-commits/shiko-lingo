import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";
import {
  getLessonFolder,
  isLastLesson,
} from "../utils/lessonUtils";

// 🔐 Feature Gating + Identity
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

// 🤖 AI
import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";

function ReadingLesson() {
  const { level, lessonId } = useParams();

  /* ===== Normalize lessonId ===== */
  const normalizedLessonId = lessonId?.includes("lesson")
    ? lessonId
    : lessonId?.split("-").pop(); // A1-lesson1 → lesson1

  const lessonNumber = Number(
    normalizedLessonId?.replace("lesson", "")
  );

  /* ===== Feature access + identity ===== */
  const { canAccess, userId, packageName } =
    useFeatureAccess({
      skill: "Reading",
      level,
    });

  /* ===== State ===== */
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  /* ===== Load lesson content ===== */
  let content = null;
  let questions = [];

  try {
    content =
      require(`./${level}/lesson${lessonNumber}/content`).default;
  } catch {}

  try {
    const imported =
      require(`./${level}/lesson${lessonNumber}/questions`).default;
    questions = Array.isArray(imported) ? imported : [];
  } catch {}

  /* ===== Reset on lesson change ===== */
  useEffect(() => {
    if (!canAccess) return;

    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setAiStatus("IDLE");
    setAiMessage("");
  }, [level, lessonId, canAccess]);

  /* ===== Lock ===== */
  if (!canAccess) {
    return <LockedFeature title="Reading Lesson" />;
  }

  if (!content) {
    return (
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <p style={{ color: "red", fontWeight: "bold" }}>
          Lesson content not found.
        </p>
        <Link to={`/reading/${level}`}>
          ← Back to {level} lessons
        </Link>
      </div>
    );
  }

  /* ===== Normalize text ===== */
  const textBlocks = Array.isArray(content.text)
    ? content.text
    : typeof content.text === "string"
    ? [content.text]
    : content.text && typeof content.text === "object"
    ? Object.values(content.text)
    : [];

  /* ===== Helpers ===== */
  const hasAnyAnswer = Object.values(answers).some(
    (v) => v && v.toString().trim() !== ""
  );

  const autoGradedCount = questions.filter(
    (q) => Array.isArray(q.options)
  ).length;

  const lastLesson = isLastLesson(
    getLessonFolder(level, "reading"),
    lessonNumber
  );

  /* ===== Submit ===== */
  const handleSubmit = () => {
    if (submitted || !hasAnyAnswer) return;

    let correct = 0;

    questions.forEach((q, i) => {
      if (
        Array.isArray(q.options) &&
        answers[i] === q.answer
      ) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);

    markLessonCompleted(
      STORAGE_KEYS.READING_COMPLETED,
      `${level}-lesson${lessonNumber}`
    );
  };

  /* ===== Ask AI Tutor ===== */
  const handleAskAI = async () => {
    if (!hasAnyAnswer) return;

    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Reading",
      level,
      lessonTitle: content.title,
      text: textBlocks.join(" "),
      studentAnswers: answers,
      score,
      total: autoGradedCount,
      userId,
      packageName,
    });

    if (result.status === "SUCCESS") {
      setAiStatus("SUCCESS");
      setAiMessage(result.message);
    } else if (result.status === "LIMIT") {
      setAiStatus("LIMIT");
      setAiMessage(result.message);
    } else {
      setAiStatus("ERROR");
      setAiMessage(
        "AI Tutor error. Please try again."
      );
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>{content.title}</h2>
      {content.description && (
        <p>{content.description}</p>
      )}

      {/* 🤖 AI Tutor */}
      <button
        onClick={handleAskAI}
        disabled={!hasAnyAnswer}
        style={{
          marginBottom: "15px",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#111",
          color: "white",
          fontWeight: "bold",
          opacity: hasAnyAnswer ? 1 : 0.6,
          cursor: "pointer",
        }}
      >
        🤖 Ask AI Tutor
      </button>

      <hr />

      {/* 📖 Reading Text */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "12px",
          background: "#f9f9f9",
          marginBottom: "30px",
        }}
      >
        {textBlocks.map((block, i) => (
          <p key={i}>{block}</p>
        ))}
      </div>

      <h3>Comprehension Questions</h3>

      {questions.map((q, i) => {
        const isMCQ = Array.isArray(q.options);

        return (
          <div
            key={i}
            style={{
              marginBottom: "15px",
              padding: "12px",
              border: "1px solid #eee",
              borderRadius: "8px",
            }}
          >
            <strong>{q.question}</strong>

            {isMCQ ? (
              q.options.map((opt, j) => {
                const isSelected = answers[i] === opt;
                const isCorrect = opt === q.answer;

                let bg = "#fff";
                if (submitted) {
                  if (isCorrect) bg = "#d4edda";
                  else if (isSelected)
                    bg = "#f8d7da";
                } else if (isSelected) {
                  bg = "#e5e9ff";
                }

                return (
                  <div
                    key={j}
                    style={{
                      marginTop: "6px",
                      padding: "8px",
                      borderRadius: "6px",
                      backgroundColor: bg,
                      border: "1px solid #ddd",
                    }}
                  >
                    <label>
                      <input
                        type="radio"
                        disabled={submitted}
                        checked={isSelected}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [i]: opt,
                          })
                        }
                      />{" "}
                      {opt}
                      {submitted &&
                        isCorrect &&
                        " ✔️"}
                    </label>
                  </div>
                );
              })
            ) : (
              <textarea
                rows={3}
                disabled={submitted}
                placeholder="Write your answer here..."
                value={answers[i] || ""}
                onChange={(e) =>
                  setAnswers({
                    ...answers,
                    [i]: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  marginTop: "8px",
                }}
              />
            )}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={submitted || !hasAnyAnswer}
        style={{
          marginTop: "10px",
          opacity:
            submitted || !hasAnyAnswer ? 0.6 : 1,
        }}
      >
        Submit Answers
      </button>

      {submitted && (
        <>
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#eaffea",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            🎉 You scored {score} out of{" "}
            {autoGradedCount}
          </div>

          <div style={{ marginTop: "20px" }}>
            {lastLesson ? (
              <Link to={`/reading/${level}`}>
                Back to {level} lessons
              </Link>
            ) : (
              <Link
                to={`/reading/${level}/lesson${
                  lessonNumber + 1
                }`}
              >
                ▶️ Next Lesson
              </Link>
            )}
          </div>
        </>
      )}

      {/* 🤖 AI Modal */}
      <AIResponseModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        status={aiStatus}
        message={aiMessage}
      />
    </div>
  );
}

export default ReadingLesson;

import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";

import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";

/* =========================
   Listening Lesson Page
   ✅ Full File – Copy/Paste Ready
   ✅ Supports new index schema (LEVEL-L#)
   ✅ Backward compatible with old lessonId format
   ✅ Normalized Comparison
   ✅ Safe Guards
========================= */

function Listening() {
  const { level, lessonId } = useParams();

  const {
    canAccess,
    canGetAIFeedback,
    userId,
    packageName,
  } = useFeatureAccess({
    skill: "Listening",
    level,
  });

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  /* 🔊 Sounds */
  const selectSound = useRef(new Audio("/sounds/select.mp3"));
  const correctSound = useRef(new Audio("/sounds/correct.mp3"));
  const wrongSound = useRef(new Audio("/sounds/wrong.mp3"));

  /* =========================
     Helpers
  ========================= */

  const normalize = (value) =>
    (value || "")
      .toString()
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();

  const resolveAnswer = (q) =>
    q.answer ?? q.correct ?? q.correctAnswer ?? "";

  const getQuestionText = (q) =>
    q.q || q.question || "";

  /* =========================
     Resolve Folder Lesson ID
     Supports:
     - A1-L1
     - lesson1
     - 1
  ========================= */
  const resolveLessonFolder = (id) => {
    if (!id) return null;

    // If format LEVEL-L#
    const match = id.match(/L(\d+)$/i);
    if (match) {
      return `lesson${match[1]}`;
    }

    // If already lesson#
    if (id.toLowerCase().startsWith("lesson")) {
      return id;
    }

    // If just number
    if (!isNaN(id)) {
      return `lesson${id}`;
    }

    return id;
  };

  /* =========================
     Load Lesson
  ========================= */
  useEffect(() => {
    if (!canAccess || !lessonId) {
      setLoading(false);
      return;
    }

    const folderName = resolveLessonFolder(lessonId);

    if (!folderName) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLesson(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);

    fetch(`/listening/${level}/${folderName}/data.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Lesson not found");
        return res.json();
      })
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lesson load error:", err);
        setLoading(false);
      });
  }, [level, lessonId, canAccess]);

  /* =========================
     Guards
  ========================= */

  if (!canAccess) {
    return <LockedFeature title="Listening Lesson" />;
  }

  if (!lessonId) {
    return <p>Please select a lesson.</p>;
  }

  if (loading) return <p>Loading lesson…</p>;
  if (!lesson) return <p>Lesson not found</p>;

  /* =========================
     Submit Answers
  ========================= */

  const handleSubmit = () => {
    if (submitted || Object.keys(answers).length === 0) return;

    let correctCount = 0;

    lesson.questions?.forEach((q, i) => {
      const correctAnswer = resolveAnswer(q);

      if (
        normalize(answers[i]) ===
        normalize(correctAnswer)
      ) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === lesson.questions.length) {
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(() => {});
    } else {
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
    }

    markLessonCompleted(
      STORAGE_KEYS.LISTENING_COMPLETED,
      `${level}-${lessonId}`
    );
  };

  /* =========================
     AI Feedback
  ========================= */

  const handleAIFeedback = async () => {
    setAiOpen(true);

    if (!canGetAIFeedback) {
      setAiStatus("LIMIT");
      setAiMessage(
        "AI feedback is available after completing lessons."
      );
      return;
    }

    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Listening",
      level,
      lessonTitle: lesson.title,
      text: lesson.text?.join(" ") || "",
      score,
      total: lesson.questions?.length || 0,
      userId,
      packageName,
    });

    setAiStatus(result.status);
    setAiMessage(result.message || "");
  };

  /* =========================
     Render
  ========================= */

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>

      <button
        onClick={handleAIFeedback}
        disabled={!submitted}
        style={{
          marginBottom: 15,
          padding: "8px 14px",
          borderRadius: 8,
          background: submitted ? "#111" : "#aaa",
          color: "#fff",
          border: "none",
          cursor: submitted ? "pointer" : "not-allowed",
          fontWeight: "bold",
        }}
      >
        🤖 AI Lesson Feedback
      </button>

      <hr />

      <audio
        controls
        style={{ width: "100%", marginBottom: 20 }}
        src={`/listening/${level}/${resolveLessonFolder(
          lessonId
        )}/${lesson.audio}`}
      />

      <ul>
        {lesson.text?.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>

      <h3>Comprehension Questions</h3>

      {lesson.questions?.map((q, i) => {
        const correctAnswer = resolveAnswer(q);

        return (
          <div
            key={i}
            style={{
              marginBottom: 20,
              padding: 15,
              border: "1px solid #eee",
              borderRadius: 10,
            }}
          >
            <strong>{getQuestionText(q)}</strong>

            {q.options?.map((opt, j) => {
              const isSelected =
                normalize(answers[i]) ===
                normalize(opt);

              const isCorrect =
                normalize(opt) ===
                normalize(correctAnswer);

              let bg = "#fff";
              let border = "1px solid #ddd";
              let color = "#000";

              if (submitted && isCorrect) {
                bg = "#28a745";
                border = "1px solid #1e7e34";
                color = "#fff";
              } else if (
                submitted &&
                isSelected &&
                !isCorrect
              ) {
                bg = "#dc3545";
                border = "1px solid #b21f2d";
                color = "#fff";
              } else if (isSelected) {
                bg = "#4A90E2";
                border = "1px solid #2f6fc2";
                color = "#fff";
              }

              return (
                <div
                  key={j}
                  style={{
                    marginTop: 8,
                    padding: 8,
                    borderRadius: 6,
                    border,
                    background: bg,
                    color,
                  }}
                >
                  <label style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      disabled={submitted}
                      checked={isSelected}
                      onChange={() => {
                        selectSound.current.currentTime = 0;
                        selectSound.current
                          .play()
                          .catch(() => {});
                        setAnswers({
                          ...answers,
                          [i]: opt,
                        });
                      }}
                    />{" "}
                    {opt}
                  </label>
                </div>
              );
            })}
          </div>
        );
      })}

      <button onClick={handleSubmit} disabled={submitted}>
        Submit Answers
      </button>

      {submitted && (
        <>
          <p style={{ marginTop: 15 }}>
            🎉 Score: {score} /{" "}
            {lesson.questions?.length}
          </p>

          <Link to={`/listening/${level}`}>
            Back to {level} Lessons
          </Link>
        </>
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

export default Listening;
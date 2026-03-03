import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";

import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";

/* =========================
   Reading Lesson Page
   ✅ Full File – Copy/Paste Ready
   ✅ Uses public/reading/{LEVEL}/lessonX/data.json
   ✅ No require()
   ✅ Same architecture as Listening
   ✅ AI + Progress + Next Lesson
========================= */

function ReadingLesson() {
  const { level, lessonId } = useParams();

  const {
    canAccess,
    canGetAIFeedback,
    userId,
    packageName,
  } = useFeatureAccess({
    skill: "Reading",
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

  const resolveLessonFolder = (id) => {
    if (!id) return null;

    const match = id.match(/L(\d+)$/i);
    if (match) {
      return `lesson${match[1]}`;
    }

    if (id.toLowerCase().startsWith("lesson")) {
      return id;
    }

    if (!isNaN(id)) {
      return `lesson${id}`;
    }

    return id;
  };

  /* =========================
     Load Lesson (from public)
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

    fetch(`/reading/${level}/${folderName}/data.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Lesson not found");
        return res.json();
      })
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Reading load error:", err);
        setLoading(false);
      });
  }, [level, lessonId, canAccess]);

  /* =========================
     Guards
  ========================= */

  if (!canAccess) {
    return <LockedFeature title="Reading Lesson" />;
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
    if (submitted || Object.keys(answers).length === 0)
      return;

    let correctCount = 0;

    lesson.questions?.forEach((q, i) => {
      if (!Array.isArray(q.options)) return;

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

    markLessonCompleted(
      STORAGE_KEYS.READING_COMPLETED,
      `${level}-${lessonId}`
    );
  };

  /* =========================
     AI Tutor
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
      skill: "Reading",
      level,
      lessonTitle: lesson.title,
      text: lesson.text?.join(" ") || "",
      studentAnswers: answers,
      score,
      total:
        lesson.questions?.filter((q) =>
          Array.isArray(q.options)
        ).length || 0,
      userId,
      packageName,
    });

    setAiStatus(result.status);
    setAiMessage(result.message || "");
  };

  /* =========================
     Next Lesson Logic
  ========================= */

  const lessonNumberMatch =
    lessonId?.match(/(\d+)/);

  const lessonNumber = lessonNumberMatch
    ? Number(lessonNumberMatch[1])
    : null;

  const nextLessonLink =
    lessonNumber != null
      ? `/reading/${level}/lesson${
          lessonNumber + 1
        }`
      : null;

  /* =========================
     Render
  ========================= */

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>{lesson.title}</h2>
      {lesson.description && (
        <p>{lesson.description}</p>
      )}

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
          cursor: submitted
            ? "pointer"
            : "not-allowed",
          fontWeight: "bold",
        }}
      >
        🤖 AI Lesson Feedback
      </button>

      <hr />

      {/* Reading Text */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "12px",
          background: "#f9f9f9",
          marginBottom: "30px",
        }}
      >
        {lesson.text?.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <h3>Comprehension Questions</h3>

      {lesson.questions?.map((q, i) => {
        const correctAnswer = resolveAnswer(q);
        const isMCQ = Array.isArray(q.options);

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

            {isMCQ ? (
              q.options.map((opt, j) => {
                const isSelected =
                  normalize(answers[i]) ===
                  normalize(opt);

                const isCorrect =
                  normalize(opt) ===
                  normalize(correctAnswer);

                let bg = "#fff";
                let border = "1px solid #ddd";

                if (submitted && isCorrect) {
                  bg = "#28a745";
                  border = "1px solid #1e7e34";
                } else if (
                  submitted &&
                  isSelected &&
                  !isCorrect
                ) {
                  bg = "#dc3545";
                  border = "1px solid #b21f2d";
                } else if (isSelected) {
                  bg = "#4A90E2";
                  border = "1px solid #2f6fc2";
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
                      color:
                        bg === "#fff"
                          ? "#000"
                          : "#fff",
                    }}
                  >
                    <label
                      style={{
                        cursor: "pointer",
                      }}
                    >
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
                  marginTop: 10,
                }}
              />
            )}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={submitted}
      >
        Submit Answers
      </button>

      {submitted && (
        <>
          <p style={{ marginTop: 15 }}>
            🎉 Score: {score} /{" "}
            {lesson.questions?.filter((q) =>
              Array.isArray(q.options)
            ).length}
          </p>

          {nextLessonLink ? (
            <Link to={nextLessonLink}>
              ▶️ Next Lesson
            </Link>
          ) : (
            <Link to={`/reading/${level}`}>
              Back to {level} Lessons
            </Link>
          )}
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

export default ReadingLesson;
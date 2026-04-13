import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";

import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";
import { LISTENING_ADVANCED_CONTENT } from "../data/listeningAdvancedContent";

/* =========================
   Listening Lesson Page
   ✅ Full File – Copy/Paste Ready
   ✅ Audio Re-initialized on lesson change (Pi Browser safe)
   ✅ Supports new index schema (LEVEL-L#)
   ✅ Backward compatible with old lessonId format
========================= */

function Listening() {
  const { level, lessonId } = useParams();
  const navigate = useNavigate();

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
  const [levelLessons, setLevelLessons] = useState([]);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  /* 🔊 Sounds */
  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

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
    if (match) return `lesson${match[1]}`;

    if (id.toLowerCase().startsWith("lesson")) return id;

    if (!isNaN(id)) return `lesson${id}`;

    return id;
  };

  const normalizeLessonId = (id) => {
    if (!id) return "";
    if (id.includes("-L")) {
      const num = id.split("-L")[1];
      return `lesson${num}`;
    }
    return resolveLessonFolder(id);
  };

  const buildFallbackLesson = (meta, normalizedId) => {
    const lessonNumber =
      Number(String(normalizedId || "").replace("lesson", "")) || 1;
    const advancedFromMap =
      LISTENING_ADVANCED_CONTENT?.[level]?.[normalizedId];
    if (advancedFromMap) {
      return {
        lesson: lessonNumber,
        level,
        ...advancedFromMap,
      };
    }

    return {
      lesson: lessonNumber,
      level,
      title: meta?.title || `Listening Lesson ${lessonNumber}`,
      description:
        meta?.description ||
        "Lesson content will be refined in the next update.",
      speaker: "Narrator",
      audio: "speaker.mp3",
      text: [
        "This is a temporary dialogue script for this lesson.",
        "The full voice script will be added in the production audio phase.",
        "Please focus on the topic and answer the comprehension questions.",
        "Use the lesson title and description to infer key details.",
      ],
      questions: [
        {
          question: "What is the main topic of this lesson?",
          options: [
            "A personal story with no clear topic",
            meta?.title || "The lesson title topic",
            "A scientific lecture",
            "A weather report",
          ],
          correctAnswer: meta?.title || "The lesson title topic",
        },
        {
          question: "What should the learner focus on in this fallback lesson?",
          options: [
            "Memorizing every word exactly",
            "Ignoring the description",
            "Understanding the main idea and key details",
            "Skipping all questions",
          ],
          correctAnswer: "Understanding the main idea and key details",
        },
        {
          question: "Why was this temporary script added?",
          options: [
            "Because the lesson was removed",
            "To bridge the course until final audio scripts are produced",
            "To replace all advanced lessons permanently",
            "To test random content",
          ],
          correctAnswer: "To bridge the course until final audio scripts are produced",
        },
        {
          question: "What is the best next step after this temporary lesson?",
          options: [
            "Wait for final dialogue and audio release for this level",
            "Delete your progress",
            "Skip listening practice forever",
            "Only practice grammar",
          ],
          correctAnswer: "Wait for final dialogue and audio release for this level",
        },
      ],
    };
  };

  /* =========================
     Load Lesson + Re-init Audio
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

    // 🔥 Re-initialize audio instances safely
    selectSound.current = new Audio("/sounds/select.mp3");
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");

    Promise.all([
      fetch(`/listening/${level}/${folderName}/data.json`),
      fetch(`/listening/${level}/index.json`).catch(() => null),
    ])
      .then(async ([lessonRes, indexRes]) => {
        let normalizedIds = [];
        let baseLessons = [];
        if (indexRes?.ok) {
          const indexData = await indexRes.json();
          baseLessons = Array.isArray(indexData)
            ? indexData
            : (indexData?.lessons || []);
          normalizedIds = baseLessons
            .map((l) => normalizeLessonId(l.id))
            .filter(Boolean);
        }

        let lessonData = null;
        if (lessonRes.ok) {
          lessonData = await lessonRes.json();
        } else {
          const currentId = normalizeLessonId(lessonId);
          const meta = baseLessons.find(
            (item) => normalizeLessonId(item.id) === currentId
          );
          lessonData = buildFallbackLesson(meta, currentId);
        }

        setLevelLessons(normalizedIds);
        setLesson(lessonData);
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
      if (correctSound.current) {
        correctSound.current.currentTime = 0;
        correctSound.current.play().catch(() => {});
      }
    } else {
      if (wrongSound.current) {
        wrongSound.current.currentTime = 0;
        wrongSound.current.play().catch(() => {});
      }
    }

    markLessonCompleted(
      STORAGE_KEYS.LISTENING_COMPLETED,
      `${level}-${lessonId}`
    );
  };

  const currentNormalizedId = normalizeLessonId(lessonId);
  const currentLessonIndex = levelLessons.indexOf(currentNormalizedId);
  const hasNextLesson =
    currentLessonIndex !== -1 && currentLessonIndex < levelLessons.length - 1;
  const nextLessonId = hasNextLesson ? levelLessons[currentLessonIndex + 1] : null;
  const isLastLesson = currentLessonIndex !== -1 && !hasNextLesson;
  const totalQuestions = lesson.questions?.length || 0;
  const isPassed = totalQuestions > 0 && score === totalQuestions;

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
                        if (selectSound.current) {
                          selectSound.current.currentTime = 0;
                          selectSound.current.play().catch(() => {});
                        }
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

          {hasNextLesson ? (
            <button
              onClick={() => navigate(`/listening/${level}/${nextLessonId}`)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "#4A90E2",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Next Lesson →
            </button>
          ) : (
            <>
              {isLastLesson && isPassed ? (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#ecfff1",
                    border: "1px solid #b7efc5",
                    textAlign: "center",
                  }}
                >
                  <style>
                    {`@keyframes listeningCelebratePulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }`}
                  </style>
                  <div
                    style={{
                      fontSize: 24,
                      marginBottom: 6,
                      animation: "listeningCelebratePulse 1.2s ease-in-out infinite",
                    }}
                  >
                    🎉✨🎧✨🎉
                  </div>
                  <strong>Congratulations, well done!</strong>
                  <p style={{ margin: "8px 0 0" }}>
                    You completed all {level} listening lessons.
                  </p>
                </div>
              ) : null}

              <div style={{ marginTop: 12 }}>
                <Link to={`/listening/${level}`}>
                  Back to {level} Lessons
                </Link>
              </div>
            </>
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

export default Listening;



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
import { SPEAKING_CURRICULUM } from "./speakingCurriculum";

function SpeakingLesson() {
  const { level, lessonId } = useParams();

  /* ===== Normalize lessonId ===== */
  const normalizedLessonId = lessonId?.includes("lesson")
    ? lessonId
    : lessonId?.split("-").pop(); // A1-lesson1 → lesson1

  const lessonNumber = Number(
    normalizedLessonId?.replace("lesson", "")
  );

  /* ===== Feature access ===== */
  const { canAccess, userId, packageName } =
    useFeatureAccess({
      skill: "Speaking",
      level,
    });

  const answerKey = `speaking-answer-${level}-lesson${lessonNumber}`;

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  /* ===== Reset on change ===== */
  useEffect(() => {
    if (!canAccess) return;

    const saved = localStorage.getItem(answerKey);
    setAnswer(saved || "");
    setSubmitted(!!saved);

    setAiStatus("IDLE");
    setAiMessage("");
  }, [answerKey, canAccess]);

  /* ===== Lock ===== */
  if (!canAccess) {
    return <LockedFeature title="Speaking Lesson" />;
  }

  const lessonData =
    SPEAKING_CURRICULUM[level]?.[normalizedLessonId];

  if (!lessonData) {
    return <p>Lesson not found.</p>;
  }

  const { content, questions } = lessonData;
  const hasAnswer = answer.trim().length > 0;

  const lastLesson = isLastLesson(
    getLessonFolder(level, "speaking"),
    lessonNumber
  );

  /* ===== Submit ===== */
  const handleSubmit = () => {
    if (submitted || !hasAnswer) return;

    localStorage.setItem(answerKey, answer);

    markLessonCompleted(
      STORAGE_KEYS.SPEAKING_COMPLETED,
      `${level}-lesson${lessonNumber}`
    );

    setSubmitted(true);
  };

  /* ===== Ask AI Tutor ===== */
  const handleAskAI = async () => {
    if (!hasAnswer) return;

    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Speaking",
      level,
      lessonTitle: content.title,
      prompt: content.prompt,
      studentText: answer,
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
        "Something went wrong. Please try again."
      );
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>{content.title}</h2>

      {content.prompt && (
        <p style={{ fontWeight: "bold" }}>
          {content.prompt}
        </p>
      )}

      {Array.isArray(content.tips) && (
        <ul>
          {content.tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}

      <h3>Guiding Questions</h3>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>{q.question}</li>
        ))}
      </ul>

      {/* 🤖 AI Tutor */}
      <button
        onClick={handleAskAI}
        disabled={!hasAnswer}
        style={{
          marginBottom: "12px",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#111",
          color: "white",
          fontWeight: "bold",
          cursor: hasAnswer
            ? "pointer"
            : "not-allowed",
          opacity: hasAnswer ? 1 : 0.6,
        }}
      >
        🤖 Ask AI Tutor
      </button>

      <h3>Your Answer</h3>
      <textarea
        rows={6}
        value={answer}
        disabled={submitted}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      <button
        onClick={handleSubmit}
        disabled={submitted || !hasAnswer}
        style={{
          marginTop: "10px",
          opacity:
            submitted || !hasAnswer ? 0.6 : 1,
        }}
      >
        Submit
      </button>

      {submitted && (
        <div style={{ marginTop: "20px" }}>
          {lastLesson ? (
            <Link to={`/speaking/${level}`}>
              Back to {level} lessons
            </Link>
          ) : (
            <Link
              to={`/speaking/${level}/lesson${
                lessonNumber + 1
              }`}
            >
              ▶️ Next Lesson
            </Link>
          )}
        </div>
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

export default SpeakingLesson;



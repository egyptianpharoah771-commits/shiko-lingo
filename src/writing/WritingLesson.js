import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

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
import { WRITING_CURRICULUM } from "./writingCurriculum";

function WritingLesson() {
  const { level, lessonId } = useParams();

  /* ===== Normalize lessonId ===== */
  const normalizedLessonId = lessonId?.includes("lesson")
    ? lessonId
    : lessonId?.split("-").pop();

  const lessonNumber = Number(
    normalizedLessonId?.replace("lesson", "")
  );

  /* ===== Hooks FIRST ===== */
  const { canAccess, userId, packageName } =
    useFeatureAccess({
      skill: "Writing",
      level,
    });

  const answerKey = `writing-answer-${level}-lesson${lessonNumber}`;

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  const lessonData =
    WRITING_CURRICULUM[level]?.[normalizedLessonId];

  const content = lessonData?.content;
  const questions = lessonData?.questions || [];

  const lastLesson = isLastLesson(
    getLessonFolder(level, "writing"),
    lessonNumber
  );

  useEffect(() => {
    if (!canAccess) return;

    const saved = localStorage.getItem(answerKey);
    setAnswer(saved || "");
    setSubmitted(!!saved);

    setAiStatus("IDLE");
    setAiMessage("");
  }, [answerKey, canAccess]);

  /* ===== Guards ===== */
  if (!canAccess) {
    return <LockedFeature title="Writing Lesson" />;
  }

  if (!lessonData) {
    return <p>Lesson not found.</p>;
  }

  const hasAnswer = answer.trim().length > 0;

  /* ===== Submit ===== */
  const handleSubmit = () => {
    if (submitted || !hasAnswer) return;

    localStorage.setItem(answerKey, answer);

    markLessonCompleted(
      STORAGE_KEYS.WRITING_COMPLETED,
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
      skill: "Writing",
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
      setAiMessage("AI error. Please try again.");
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

      <h3>Guiding Questions</h3>
      <ul>
        {questions.map((q) => (
          <li key={q.id}>{q.question}</li>
        ))}
      </ul>

      <h3>Your Writing</h3>
      <textarea
        rows={8}
        value={answer}
        disabled={submitted}
        onChange={(e) => setAnswer(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      <button
        onClick={handleAskAI}
        disabled={!hasAnswer}
        style={{
          marginTop: "12px",
          padding: "8px 14px",
          backgroundColor: "#111",
          color: "white",
          borderRadius: "8px",
          border: "none",
          fontWeight: "bold",
          opacity: hasAnswer ? 1 : 0.6,
        }}
      >
        🤖 Ask AI Tutor
      </button>

      <button
        onClick={handleSubmit}
        disabled={submitted || !hasAnswer}
        style={{
          marginTop: "15px",
          opacity:
            submitted || !hasAnswer ? 0.6 : 1,
        }}
      >
        Submit
      </button>

      {submitted && (
        <div style={{ marginTop: "20px" }}>
          {lastLesson ? (
            <Link to={`/writing/${level}`}>
              Back to {level} lessons
            </Link>
          ) : (
            <Link
              to={`/writing/${level}/lesson${
                lessonNumber + 1
              }`}
            >
              ▶️ Next Lesson
            </Link>
          )}
        </div>
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

export default WritingLesson;



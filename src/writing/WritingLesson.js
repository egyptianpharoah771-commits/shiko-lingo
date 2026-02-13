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

/* ======================
   CONTENT IMPORTS
====================== */
// A1
import A1L1Content from "./A1/lesson1/content";
import A1L1Questions from "./A1/lesson1/questions";
import A1L2Content from "./A1/lesson2/content";
import A1L2Questions from "./A1/lesson2/questions";
import A1L3Content from "./A1/lesson3/content";
import A1L3Questions from "./A1/lesson3/questions";
import A1L4Content from "./A1/lesson4/content";
import A1L4Questions from "./A1/lesson4/questions";
import A1L5Content from "./A1/lesson5/content";
import A1L5Questions from "./A1/lesson5/questions";

// A2
import A2L1Content from "./A2/lesson1/content";
import A2L1Questions from "./A2/lesson1/questions";
import A2L2Content from "./A2/lesson2/content";
import A2L2Questions from "./A2/lesson2/questions";
import A2L3Content from "./A2/lesson3/content";
import A2L3Questions from "./A2/lesson3/questions";
import A2L4Content from "./A2/lesson4/content";
import A2L4Questions from "./A2/lesson4/questions";
import A2L5Content from "./A2/lesson5/content";
import A2L5Questions from "./A2/lesson5/questions";
import A2L6Content from "./A2/lesson6/content";
import A2L6Questions from "./A2/lesson6/questions";

// B1
import B1L1Content from "./B1/lesson1/content";
import B1L1Questions from "./B1/lesson1/questions";
import B1L2Content from "./B1/lesson2/content";
import B1L2Questions from "./B1/lesson2/questions";
import B1L3Content from "./B1/lesson3/content";
import B1L3Questions from "./B1/lesson3/questions";
import B1L4Content from "./B1/lesson4/content";
import B1L4Questions from "./B1/lesson4/questions";
import B1L5Content from "./B1/lesson5/content";
import B1L5Questions from "./B1/lesson5/questions";
import B1L6Content from "./B1/lesson6/content";
import B1L6Questions from "./B1/lesson6/questions";

/* ======================
   MAPPING
====================== */
const WRITING_CONTENT = {
  A1: {
    lesson1: { content: A1L1Content, questions: A1L1Questions },
    lesson2: { content: A1L2Content, questions: A1L2Questions },
    lesson3: { content: A1L3Content, questions: A1L3Questions },
    lesson4: { content: A1L4Content, questions: A1L4Questions },
    lesson5: { content: A1L5Content, questions: A1L5Questions },
  },
  A2: {
    lesson1: { content: A2L1Content, questions: A2L1Questions },
    lesson2: { content: A2L2Content, questions: A2L2Questions },
    lesson3: { content: A2L3Content, questions: A2L3Questions },
    lesson4: { content: A2L4Content, questions: A2L4Questions },
    lesson5: { content: A2L5Content, questions: A2L5Questions },
    lesson6: { content: A2L6Content, questions: A2L6Questions },
  },
  B1: {
    lesson1: { content: B1L1Content, questions: B1L1Questions },
    lesson2: { content: B1L2Content, questions: B1L2Questions },
    lesson3: { content: B1L3Content, questions: B1L3Questions },
    lesson4: { content: B1L4Content, questions: B1L4Questions },
    lesson5: { content: B1L5Content, questions: B1L5Questions },
    lesson6: { content: B1L6Content, questions: B1L6Questions },
  },
};

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
    WRITING_CONTENT[level]?.[normalizedLessonId];

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

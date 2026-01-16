import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getLessonFolder,
  getLessonNumber,
  isLastLesson,
} from "../utils/lessonUtils";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";

// 🔐 Feature Gating + Identity
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

// 🤖 AI
import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";

function normalizeLessonId(level, lessonId) {
  if (!lessonId) return null;
  if (!lessonId.includes("-")) {
    return `${level}-${lessonId}`;
  }
  return lessonId;
}

function Listening() {
  const { level, lessonId: rawLessonId } = useParams();
  const lessonId = normalizeLessonId(level, rawLessonId);

  const {
    canAccess,
    canUseAI,
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

  const totalLessonsByLevel = {
    A1: 16,
    A2: 12,
    B1: 14,
  };

  const lessonFolder = lessonId
    ? getLessonFolder(lessonId)
    : null;

  const lessonNumber = lessonId
    ? getLessonNumber(lessonId)
    : null;

  const lastLesson =
    lessonId &&
    isLastLesson(
      lessonId,
      level,
      totalLessonsByLevel
    );

  const nextLessonId =
    lessonNumber && !lastLesson
      ? `${level}-lesson${lessonNumber + 1}`
      : null;

  useEffect(() => {
    if (!canAccess || !lessonId || !lessonFolder) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLesson(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);

    fetch(`/listening/${level}/${lessonFolder}/data.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Lesson not found");
        return res.json();
      })
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [level, lessonId, lessonFolder, canAccess]);

  if (!canAccess) {
    return <LockedFeature title="Listening Lesson" />;
  }

  if (!lessonId) {
    return <p>Please select a lesson.</p>;
  }

  if (loading) return <p>Loading lesson…</p>;
  if (!lesson) return <p>Lesson not found</p>;

  const handleSubmit = () => {
    if (submitted || Object.keys(answers).length === 0) return;

    let correct = 0;
    lesson.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    const lessonKey = `${level}-${lessonId}`;
    markLessonCompleted(
      STORAGE_KEYS.LISTENING_COMPLETED,
      lessonKey
    );
  };

  // ✅ الإصلاح الكامل هنا
  const handleAskAI = async () => {
    if (!canUseAI) {
      setAiOpen(true);
      setAiStatus("LIMIT");
      setAiMessage(
        "You’re using the FREE plan. Upgrade to PRO to unlock AI feedback."
      );
      return;
    }

    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    try {
      const result = await askAITutor({
        question: "Give me feedback on my listening performance.",
        skill: "Listening",
        level,
        lessonTitle: lesson.title,
        lessonDescription: lesson.description,
        text: lesson.text.join(" "),
        score,
        total: lesson.questions.length,
        userId,
        packageName,
      });

      setAiStatus("SUCCESS");
      setAiMessage(result.answer || "");
    } catch (err) {
      console.error("AI Tutor error:", err);
      setAiStatus("ERROR");
      setAiMessage("Sorry, the AI tutor is unavailable right now.");
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>

      <button
        onClick={handleAskAI}
        style={{
          marginBottom: 15,
          padding: "8px 14px",
          borderRadius: 8,
          background: "#111",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🤖 Ask AI Tutor
      </button>

      <hr />

      <audio
        controls
        style={{ width: "100%", marginBottom: 15 }}
        src={`/listening/${level}/${lessonFolder}/${lesson.audio}`}
      />

      <ul>
        {lesson.text.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>

      <h3>Comprehension Questions</h3>

      {lesson.questions.map((q, i) => (
        <div
          key={i}
          style={{
            marginBottom: 20,
            padding: 15,
            border: "1px solid #eee",
            borderRadius: 10,
          }}
        >
          <strong>{q.q}</strong>

          {q.options.map((opt, j) => {
            const isSelected = answers[i] === opt;
            const isCorrect = opt === q.answer;

            let bg = "#fff";
            if (submitted && isCorrect) bg = "#d4edda";
            else if (submitted && isSelected && !isCorrect)
              bg = "#f8d7da";
            else if (isSelected) bg = "#e5e9ff";

            return (
              <div
                key={j}
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  background: bg,
                }}
              >
                <label style={{ cursor: "pointer" }}>
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
          })}
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitted}>
        Submit Answers
      </button>

      {submitted && (
        <>
          <p style={{ marginTop: 15 }}>
            🎉 Score: {score} / {lesson.questions.length}
          </p>

          {!lastLesson && nextLessonId && (
            <Link to={`/listening/${level}/${nextLessonId}`}>
              Next Lesson →
            </Link>
          )}

          {lastLesson && (
            <Link to={`/listening/${level}`}>
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

export default Listening;

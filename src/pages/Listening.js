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

function Listening() {
  const { level, lessonId } = useParams();

  // 🔐 Feature access + identity (Phase 3)
  const {
    canAccess,
    userId,
    packageName,
  } = useFeatureAccess({
    skill: "Listening",
    level,
  });

  // ===== State =====
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // 🤖 AI Modal State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  // ===== Level config =====
  const totalLessonsByLevel = {
    A1: 16,
    A2: 12,
    B1: 14,
  };

  const lessonFolder = getLessonFolder(lessonId);
  const lessonNumber = getLessonNumber(lessonId);

  const lastLesson = isLastLesson(
    lessonId,
    level,
    totalLessonsByLevel
  );

  const isFinalB1 = level === "B1" && lastLesson;
  const nextLessonId = `${level}-lesson${lessonNumber + 1}`;

  // ===== Load lesson =====
  useEffect(() => {
    if (!canAccess) return;

    setLoading(true);
    setLesson(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setAiStatus("IDLE");
    setAiMessage("");

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

  // 🔒 Access lock
  if (!canAccess) {
    return <LockedFeature title="Listening Lesson" />;
  }

  if (loading) return <p>Loading lesson...</p>;
  if (!lesson) return <p>Lesson not found</p>;

  // ===== Submit answers =====
  const handleSubmit = () => {
    if (submitted || Object.keys(answers).length === 0) return;

    let correct = 0;

    lesson.questions.forEach((q, i) => {
      if (answers[i] === q.answer) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);

    const lessonKey = `${level}-${lessonId}`;

    markLessonCompleted(
      STORAGE_KEYS.LISTENING_COMPLETED,
      lessonKey
    );

    if (isFinalB1) {
      localStorage.setItem(
        STORAGE_KEYS.B1_LISTENING_UNLOCKED,
        "true"
      );
    }
  };

  // ===== Ask AI Tutor =====
  const handleAskAI = async () => {
    setAiOpen(true);
    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Listening",
      level,
      lessonTitle: lesson.title,
      text: lesson.text.join(" "),
      score,
      total: lesson.questions.length,

      // 🔑 Phase 3 – identity
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
      setAiMessage("AI Tutor error. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>

      {/* ===== AI Tutor ===== */}
      <button
        onClick={handleAskAI}
        style={{
          marginBottom: "15px",
          padding: "8px 14px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#111",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        🤖 Ask AI Tutor
      </button>

      <hr />

      <div
        style={{
          border: "1px solid #ddd",
          padding: "20px",
          borderRadius: "12px",
          background: "#f9f9ff",
          marginBottom: "30px",
        }}
      >
        <h3>{lesson.speaker}</h3>

        <audio
          controls
          style={{ width: "100%", marginBottom: "15px" }}
          src={`/listening/${level}/${lessonFolder}/${lesson.audio}`}
        />

        <ul>
          {lesson.text.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>

      <hr />

      <h3>Comprehension Questions</h3>

      {lesson.questions.map((q, i) => (
        <div
          key={i}
          style={{
            marginBottom: "15px",
            padding: "12px",
            border: "1px solid #eee",
            borderRadius: "8px",
          }}
        >
          <strong>{q.q}</strong>

          {q.options.map((opt, j) => {
            const isSelected = answers[i] === opt;
            const isCorrect = opt === q.answer;

            let bgColor = "#fff";

            if (submitted) {
              if (isCorrect) bgColor = "#d4edda";
              else if (isSelected && !isCorrect)
                bgColor = "#f8d7da";
            } else if (isSelected) {
              bgColor = "#e5e9ff";
            }

            return (
              <div
                key={j}
                style={{
                  padding: "8px",
                  marginTop: "6px",
                  borderRadius: "6px",
                  backgroundColor: bgColor,
                  border: "1px solid #ddd",
                }}
              >
                <label>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={opt}
                    disabled={submitted}
                    checked={isSelected}
                    onChange={() =>
                      setAnswers({ ...answers, [i]: opt })
                    }
                  />{" "}
                  {opt}
                  {submitted && isCorrect && " ✔️"}
                </label>
              </div>
            );
          })}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitted}
        style={{
          opacity: submitted ? 0.6 : 1,
          cursor: submitted ? "not-allowed" : "pointer",
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
            🎉 You scored <strong>{score}</strong> out of{" "}
            {lesson.questions.length}
          </div>

          <div style={{ marginTop: "20px" }}>
            {isFinalB1 ? (
              <Link to="/listening/B1">Review B1</Link>
            ) : lastLesson ? (
              <Link to={`/listening/${level}`}>
                Back to {level} Lessons
              </Link>
            ) : (
              <Link to={`/listening/${level}/${nextLessonId}`}>
                Next Lesson →
              </Link>
            )}
          </div>
        </>
      )}

      {/* ===== AI Modal ===== */}
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

import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import STORAGE_KEYS from "../utils/storageKeys";
import { markLessonCompleted } from "../utils/progressStorage";

import { useFeatureAccess } from "../hooks/useFeatureAccess";
import LockedFeature from "../components/LockedFeature";

import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";

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

  useEffect(() => {
    if (!canAccess || !lessonId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLesson(null);
    setAnswers({});
    setSubmitted(false);
    setScore(0);

    fetch(`/listening/${level}/${lessonId}/data.json`)
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
  }, [level, lessonId, canAccess]);

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
      if (answers[i] === q.answer) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);

    if (correct === lesson.questions.length) {
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
      text: lesson.text.join(" "),
      score,
      total: lesson.questions.length,
      userId,
      packageName,
    });

    setAiStatus(result.status);
    setAiMessage(result.message || "");
  };

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
        src={`/listening/${level}/${lessonId}/${lesson.audio}`}
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
            let border = "1px solid #ddd";
            let color = "#000";

            if (submitted && isCorrect) {
              bg = "#28a745";
              border = "1px solid #1e7e34";
              color = "#fff";
            } else if (submitted && isSelected && !isCorrect) {
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
                      selectSound.current.play().catch(() => {});
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
      ))}

      <button onClick={handleSubmit} disabled={submitted}>
        Submit Answers
      </button>

      {submitted && (
        <>
          <p style={{ marginTop: 15 }}>
            🎉 Score: {score} / {lesson.questions.length}
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

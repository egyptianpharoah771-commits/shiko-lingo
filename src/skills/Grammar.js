import React, { useState, useEffect } from "react";
import "./grammar.css"; // CSS الخاص بالصفحة

// ======== دروس Grammar مع أمثلة وأسئلة =========
const lessons = [
  {
    id: "present_simple",
    title: "Present Simple",
    explanation:
      "We use the Present Simple to talk about routines, facts, and general truths.",
    examples: [
      "I work every day.",
      "The sun rises in the east.",
      "She plays football.",
    ],
    questions: [
      {
        q: "She ___ to school every day.",
        options: ["go", "goes", "going"],
        answer: "goes",
      },
      {
        q: "The sun ___ in the east.",
        options: ["rise", "rises", "rising"],
        answer: "rises",
      },
    ],
  },
  {
    id: "past_simple",
    title: "Past Simple",
    explanation:
      "We use the Past Simple to talk about completed actions in the past.",
    examples: [
      "I visited Paris last year.",
      "She cooked dinner yesterday.",
      "They watched a movie.",
    ],
    questions: [
      {
        q: "I ___ Paris last year.",
        options: ["visit", "visits", "visited"],
        answer: "visited",
      },
    ],
  },
  {
    id: "future_simple",
    title: "Future Simple",
    explanation:
      "We use the Future Simple to talk about actions that will happen in the future.",
    examples: [
      "I will travel next month.",
      "She will call you later.",
      "They will finish the project tomorrow.",
    ],
    questions: [
      {
        q: "I ___ travel next month.",
        options: ["will", "am", "is"],
        answer: "will",
      },
    ],
  },
  {
    id: "modal_verbs",
    title: "Modal Verbs",
    explanation:
      "Modal verbs are used to express ability, possibility, permission, or obligation.",
    examples: ["I can swim.", "You must wear a helmet.", "She may come later."],
    questions: [
      {
        q: "You ___ wear a helmet.",
        options: ["must", "can", "should"],
        answer: "must",
      },
    ],
  },
  {
    id: "articles",
    title: "Articles",
    explanation:
      "Articles are used before nouns to define whether they are specific or general (a, an, the).",
    examples: ["I saw a cat.", "She has an umbrella.", "The sun is shining."],
    questions: [
      {
        q: "I saw ___ cat.",
        options: ["a", "an", "the"],
        answer: "a",
      },
    ],
  },
];

// ======== Component الرئيسي =========
export default function Grammar() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [message, setMessage] = useState("");

  // تحميل التقدم من localStorage عند فتح الصفحة
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem("grammar"));
    if (savedProgress) setProgress(savedProgress);
  }, []);

  // التحقق من الإجابة وتحديث التقدم
  const handleAnswer = (lessonId, qIndex, option) => {
    const correct = lessons.find((l) => l.id === lessonId).questions[qIndex].answer;

    if (option === correct) {
      setMessage("✔ Correct!");
      const newProgress = {
        ...progress,
        [lessonId]: (progress[lessonId] || 0) + 1,
      };
      setProgress(newProgress);
      localStorage.setItem("grammar", JSON.stringify(newProgress));
    } else {
      setMessage("❌ Try again");
    }

    setTimeout(() => setMessage(""), 1500);
  };

  return (
    <div className="grammar-container">
      <h1>Grammar Lessons</h1>

      {/* قائمة الدروس */}
      {!selectedLesson && (
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="lesson-card"
              onClick={() => setSelectedLesson(lesson)}
            >
              <h3>{lesson.title}</h3>
              <p>
                Progress:{" "}
                {progress[lesson.id]
                  ? `${progress[lesson.id]} / ${lesson.questions.length}`
                  : `0 / ${lesson.questions.length}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* محتوى الدرس */}
      {selectedLesson && (
        <div className="lesson-content">
          <button onClick={() => setSelectedLesson(null)} className="back-btn">
            ← Back
          </button>

          <h2>{selectedLesson.title}</h2>
          <p className="explanation">{selectedLesson.explanation}</p>

          <h3>Examples:</h3>
          <ul>
            {selectedLesson.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>

          <h3>Practice:</h3>
          {selectedLesson.questions.map((q, qIndex) => (
            <div key={qIndex} className="question-box">
              <p>{q.q}</p>
              {q.options.map((op) => (
                <button
                  key={op}
                  className="option-btn"
                  onClick={() => handleAnswer(selectedLesson.id, qIndex, op)}
                >
                  {op}
                </button>
              ))}
            </div>
          ))}

          {message && <div className="feedback">{message}</div>}
        </div>
      )}
    </div>
  );
}

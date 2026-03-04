import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import STORAGE_KEYS from "./utils/storageKeys";
import { markLessonCompleted } from "./utils/progressStorage";

import { useFeatureAccess } from "./hooks/useFeatureAccess";
import LockedFeature from "./components/LockedFeature";

import { askAITutor } from "./utils/aiClient";
import AIResponseModal from "./components/AIResponseModal";

/* =========================
   Reading Lesson Page
   Full File – Clean Stable Version
   ✔ Sound Feedback
   ✔ Answer Explanation
   ✔ Interactive Dictionary
   ✔ Arabic Translation (translated definition)
   ✔ Pronunciation
   ✔ Save Word System
========================= */

function ReadingLesson() {
  const { level, lessonId } = useParams();

  const { canAccess, canGetAIFeedback, userId, packageName } =
    useFeatureAccess({
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

  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState("");
  const [dictionaryData, setDictionaryData] = useState(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);

  // نحتفظ بالـ setter فقط لتجنب eslint warning
  const [, setSavedWords] = useState([]);

  /* =========================
     Sound System
  ========================= */

  const selectSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  const playSelect = () => {
    if (selectSound.current) {
      selectSound.current.currentTime = 0;
      selectSound.current.play().catch(() => {});
    }
  };

  const playCorrect = () => {
    if (correctSound.current) {
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(() => {});
    }
  };

  const playWrong = () => {
    if (wrongSound.current) {
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
    }
  };

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

  const resolveExplanation = (q) =>
    q.explanation ?? q.reason ?? "";

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

  const cleanWord = (word) =>
    word.replace(/[.,!?;:()"']/g, "").toLowerCase();

  /* =========================
     Pronounce Word
  ========================= */

  const speakWord = (word) => {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  /* =========================
     Save Word
  ========================= */

  const saveWord = (word) => {
    const existing = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );

    if (!existing.includes(word)) {
      const updated = [...existing, word];
      localStorage.setItem("VOCAB_SAVED", JSON.stringify(updated));
      setSavedWords(updated);
    }
  };

  /* =========================
     Dictionary Lookup
  ========================= */

  const handleWordClick = async (word) => {
    const clean = cleanWord(word);
    if (!clean) return;

    setDictionaryWord(clean);
    setDictionaryOpen(true);
    setDictionaryLoading(true);
    setDictionaryData(null);

    try {
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`
      );

      let definition = "";
      let example = "";

      if (dictRes.ok) {
        const dictData = await dictRes.json();
        definition =
          dictData?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";
        example =
          dictData?.[0]?.meanings?.[0]?.definitions?.[0]?.example || "";
      }

      let arabic = "";

      if (definition) {
        const transRes = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            definition
          )}&langpair=en|ar`
        );

        if (transRes.ok) {
          const transData = await transRes.json();
          arabic =
            transData?.responseData?.translatedText || "";
        }
      }

      setDictionaryData({
        definition,
        example,
        arabic,
      });
    } catch (err) {
      setDictionaryData({
        definition: "Definition not available",
        example: "",
        arabic: "",
      });
    }

    setDictionaryLoading(false);
  };

  /* =========================
     Load Lesson
  ========================= */

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );
    setSavedWords(saved);

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
      .catch(() => setLoading(false));
  }, [level, lessonId, canAccess]);

  if (!canAccess) {
    return <LockedFeature title="Reading Lesson" />;
  }

  if (!lessonId) return <p>Please select a lesson.</p>;
  if (loading) return <p>Loading lesson…</p>;
  if (!lesson) return <p>Lesson not found</p>;

  const textLines = Array.isArray(lesson.text)
    ? lesson.text
    : typeof lesson.text === "string"
    ? lesson.text.split("\n\n")
    : [];

  /* =========================
     Submit Answers
  ========================= */

  const handleSubmit = () => {
    if (submitted || Object.keys(answers).length === 0) return;

    let correctCount = 0;

    lesson.questions?.forEach((q, i) => {
      if (!Array.isArray(q.options)) return;

      const correctAnswer = resolveAnswer(q);

      if (normalize(answers[i]) === normalize(correctAnswer)) {
        correctCount++;
        playCorrect();
      } else {
        playWrong();
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

    const result = await askAITutor({
      skill: "Reading",
      level,
      lessonTitle: lesson.title,
      text: textLines.join(" "),
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

  const lessonNumberMatch = lessonId?.match(/(\d+)/);
  const lessonNumber = lessonNumberMatch
    ? Number(lessonNumberMatch[1])
    : null;

  const nextLessonLink =
    lessonNumber != null
      ? `/reading/${level}/lesson${lessonNumber + 1}`
      : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: 20 }}>
      <audio ref={selectSound} src="/sounds/select.mp3" />
      <audio ref={correctSound} src="/sounds/correct.mp3" />
      <audio ref={wrongSound} src="/sounds/wrong.mp3" />

      <h2>{lesson.title}</h2>

      <button onClick={handleAIFeedback} disabled={!submitted}>
        🤖 AI Lesson Feedback
      </button>

      <div
        style={{
          border: "1px solid #eee",
          padding: 24,
          borderRadius: 14,
          background: "#fafafa",
          marginBottom: 30,
          lineHeight: 1.9,
          fontSize: 18,
        }}
      >
        {textLines.map((line, i) => {
          const words = line.split(" ");

          return (
            <p key={i}>
              {words.map((word, j) => (
                <span
                  key={j}
                  onClick={() => handleWordClick(word)}
                  style={{
                    cursor: "pointer",
                    marginRight: 4,
                  }}
                >
                  {word}
                </span>
              ))}
            </p>
          );
        })}
      </div>

      <h3>Comprehension Questions</h3>

      {lesson.questions?.map((q, i) => {
        const correctAnswer = resolveAnswer(q);
        const explanation = resolveExplanation(q);
        const isMCQ = Array.isArray(q.options);

        return (
          <div key={i} style={{ marginBottom: 20 }}>
            <strong>{getQuestionText(q)}</strong>

            {isMCQ &&
              q.options.map((opt, j) => {
                const isSelected =
                  normalize(answers[i]) === normalize(opt);

                const isCorrect =
                  normalize(opt) === normalize(correctAnswer);

                return (
                  <div key={j}>
                    <label>
                      <input
                        type="radio"
                        disabled={submitted}
                        checked={isSelected}
                        onChange={() => {
                          playSelect();
                          setAnswers({
                            ...answers,
                            [i]: opt,
                          });
                        }}
                      />
                      {opt}
                    </label>
                    {submitted && isCorrect && (
                      <span> ✅</span>
                    )}
                  </div>
                );
              })}

            {submitted && explanation && (
              <p>
                <strong>Explanation:</strong> {explanation}
              </p>
            )}
          </div>
        );
      })}

      <button onClick={handleSubmit} disabled={submitted}>
        Submit Answers
      </button>

      {submitted && (
        <>
          <p>
            Score: {score} /{" "}
            {
              lesson.questions?.filter((q) =>
                Array.isArray(q.options)
              ).length
            }
          </p>

          {nextLessonLink && (
            <Link to={nextLessonLink}>Next Lesson</Link>
          )}
        </>
      )}

      {dictionaryOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 28,
              borderRadius: 16,
              width: 420,
            }}
          >
            <h2>📘 {dictionaryWord}</h2>

            {dictionaryLoading && <p>Loading...</p>}

            {dictionaryData && (
              <>
                <button onClick={() => speakWord(dictionaryWord)}>
                  🔊 Pronounce
                </button>

                {dictionaryData.arabic && (
                  <p>
                    <strong>🇸🇦 Arabic:</strong>{" "}
                    {dictionaryData.arabic}
                  </p>
                )}

                {dictionaryData.definition && (
                  <p>
                    <strong>📖 Definition:</strong>{" "}
                    {dictionaryData.definition}
                  </p>
                )}

                {dictionaryData.example && (
                  <p>
                    <strong>💡 Example:</strong>{" "}
                    {dictionaryData.example}
                  </p>
                )}

                <button
                  onClick={() => saveWord(dictionaryWord)}
                >
                  ⭐ Save Word
                </button>
              </>
            )}

            <button
              onClick={() => setDictionaryOpen(false)}
              style={{ marginTop: 14 }}
            >
              Close
            </button>
          </div>
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

export default ReadingLesson;
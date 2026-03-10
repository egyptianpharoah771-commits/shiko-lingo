import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import STORAGE_KEYS from "./utils/storageKeys";
import { markLessonCompleted } from "./utils/progressStorage";

import { useFeatureAccess } from "./hooks/useFeatureAccess";
import LockedFeature from "./components/LockedFeature";

import { askAITutor } from "./utils/aiClient";
import AIResponseModal from "./components/AIResponseModal";

import { saveWordToDB } from "./utils/vocabEngine";

/* =========================
   Reading Lesson Page
   Full File – Stable TTS Proxy Version
   ✔ Smart Lesson Unlock (60%)
   ✔ Retry Lesson
   ✔ Supabase Save Word
   ✔ Interactive Dictionary
   ✔ Pronunciation via /api/tts (No CORS)
   ✔ Word Highlight
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
  const [passed, setPassed] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState("");
  const [dictionaryData, setDictionaryData] = useState(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);

  const [activeWord, setActiveWord] = useState(null);
  const [activeSentence, setActiveSentence] = useState(null);
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
     Pronunciation via TTS Proxy
     /api/tts?text=
     Fixes Google CORS problem
  ========================= */

  const speakWord = (word, example = "") => {
  if (!word) return;

  const text = example ? `${word}. ${example}` : word;

  /* Localhost fallback */

  if (window.location.hostname === "localhost") {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
    return;
  }

  /* Production TTS */

  const audio = new Audio(
    `/api/tts?text=${encodeURIComponent(text)}`
  );

  audio.play().catch((err) => {
    console.warn("TTS playback failed:", err);
  });
};

  const saveWord = async (word) => {
  const clean = cleanWord(word);
  if (!clean || !userId) return;

  /* save to Supabase */
  await saveWordToDB(userId, clean);

  /* save to localStorage for review system */

  const key = "VOCAB_SAVED";

  const existing =
    JSON.parse(localStorage.getItem(key)) || [];

  if (!existing.includes(clean)) {
    existing.push(clean);
    localStorage.setItem(key, JSON.stringify(existing));
  }
};

  const handleWordClick = async (word) => {
    const clean = cleanWord(word);
    if (!clean) return;

    setActiveWord(clean);
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
          arabic = transData?.responseData?.translatedText || "";
        }
      }

      setDictionaryData({
        definition,
        example,
        arabic,
      });
    } catch {
      setDictionaryData({
        definition: "Definition not available",
        example: "",
        arabic: "",
      });
    }

    setDictionaryLoading(false);
  };

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
    setPassed(false);

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

  const totalQuestions = lesson.questions?.length || 0;

  const handleSubmit = () => {
  if (submitted || Object.keys(answers).length === 0) return;

  let correctCount = 0;

  lesson.questions?.forEach((q, i) => {

    const correctAnswer = resolveAnswer(q);

    const studentAnswer = normalize(answers[i]);

    const keywords = normalize(correctAnswer).split(" ");

    const match = keywords.some(word =>
      studentAnswer.includes(word)
    );

    if (match) {
      correctCount++;
      playCorrect();
    } else {
      playWrong();
    }

  });

    const percentage = correctCount / totalQuestions;

    setScore(correctCount);
    setSubmitted(true);
    setPassed(percentage >= 0.6);

    if (percentage >= 0.6) {
      markLessonCompleted(
        STORAGE_KEYS.READING_COMPLETED,
        `${level}-${lessonId}`
      );
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
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

    const result = await askAITutor({
      skill: "Reading",
      level,
      lessonTitle: lesson.title,
      text: textLines.join(" "),
      studentAnswers: answers,
      score,
      total: totalQuestions,
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
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: 20,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <audio ref={selectSound} src="/sounds/select.mp3" />
      <audio ref={correctSound} src="/sounds/correct.mp3" />
      <audio ref={wrongSound} src="/sounds/wrong.mp3" />

      <h2 style={{ marginBottom: 20 }}>{lesson.title}</h2>

      <button onClick={handleAIFeedback} disabled={!submitted}>
        🤖 AI Lesson Feedback
      </button>

      <div
  style={{
    maxWidth: 760,
    margin: "40px auto",
    padding: "52px 46px",
    background: "#ffffff",
    borderRadius: 18,
    boxShadow: "0 12px 42px rgba(0,0,0,0.06)",
    fontSize: 21,
    lineHeight: 2.1,
    letterSpacing: "0.3px",
    color: "#222",
    width: "100%",
    boxSizing: "border-box",
  }}
>
      
        {textLines.map((line, i) => {
          const words = line.split(" ");

          return (
  <p
    key={i}
    style={{
      marginBottom: 30,
      fontSize: 21,
      lineHeight: 2.1,
      fontWeight: 400,
      background: activeSentence === i ? "#fff9db" : "transparent",
      padding: activeSentence === i ? "8px 10px" : "0",
      borderRadius: 8,
      transition: "background 0.2s"
    }}
  >
    {words.map((word, j) => {
      const clean = cleanWord(word);
      const isActive = activeWord === clean;

                return (
                  <span
                    key={j}
onClick={() => {
  setActiveSentence(i);
  handleWordClick(word);
}}                    style={{
                      cursor: "pointer",
                      marginRight: 6,
                      padding: "2px 4px",
                      borderRadius: 4,
                      display: "inline-block",
                      background: isActive
  ? "#ffd54f"
  : "transparent",
color: isActive ? "#000" : "inherit",
fontWeight: isActive ? "600" : "normal",
                      transition: "background 0.15s",
                    }}
                  >
                    {word}
                  </span>
                );
              })}
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
                    {submitted && isCorrect && <span> ✅</span>}
                  </div>
                );
              })}
{!isMCQ && (
  <div style={{ marginTop: 10 }}>
    <input
      type="text"
      disabled={submitted}
      value={answers[i] || ""}
      onChange={(e) =>
        setAnswers({
          ...answers,
          [i]: e.target.value,
        })
      }
      style={{
        width: "100%",
        padding: 10,
        marginTop: 8,
      }}
      placeholder="Type your answer..."
    />
  </div>
)}
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
            Score: {score} / {totalQuestions}
          </p>

          {passed ? (
            <>
              <p style={{ color: "green", fontWeight: "bold" }}>
                Lesson Passed 🎉
              </p>

              {nextLessonLink && (
                <Link to={nextLessonLink}>Next Lesson</Link>
              )}
            </>
          ) : (
            <>
              <p style={{ color: "red", fontWeight: "bold" }}>
                You need at least 60% to unlock the next lesson.
              </p>

              <button onClick={handleRetry}>
                Retry Lesson
              </button>
            </>
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
              maxWidth: "90%",
              boxSizing: "border-box",
            }}
          >
            <h2>📘 {dictionaryWord}</h2>

            {dictionaryLoading && <p>Loading...</p>}

            {dictionaryData && (
              <>
                <button
                  onClick={() =>
                    speakWord(dictionaryWord, dictionaryData?.example)
                  }
                >
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

                <button onClick={() => saveWord(dictionaryWord)}>
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
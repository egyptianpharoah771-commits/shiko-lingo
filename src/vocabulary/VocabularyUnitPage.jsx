import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Vocabulary.css";

/* ======================
   Utils
====================== */
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function VocabularyUnitPage() {
  const { level, unitId } = useParams();
  const navigate = useNavigate();

  const normalizedLevel =
    typeof level === "string" ? level.trim().toUpperCase() : null;
  const unitNumber = Number.parseInt(unitId, 10);

  const STORAGE_KEY = `vocabularyProgress_${normalizedLevel}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔊 audio ref
  const audioRef = useRef(null);
  const [playingWord, setPlayingWord] = useState(null);

  useEffect(() => {
    const loadUnit = async () => {
      setLoading(true);
      setCurrentQuestion(0);
      setSelected(null);
      setShowResult(false);

      // ==== Guards على الـ params ====
      if (!normalizedLevel || Number.isNaN(unitNumber)) {
        console.error("Invalid vocabulary params:", { level, unitId });
        setContent(null);
        setQuestions([]);
        setLoading(false);
        return;
      }

      try {
        // ==== تحميل المحتوى ====
        const contentModule = await import(
          `./${normalizedLevel}/unit${unitNumber}/content.js`
        );

        // ==== تحميل الأسئلة ====
        const questionsModule = await import(
          `./${normalizedLevel}/unit${unitNumber}/questions.js`
        );

        const rawQuestions = questionsModule?.default;

        // ==== Guard مهم جدًا ====
        if (!Array.isArray(rawQuestions)) {
          console.error(
            "Invalid questions export (must be default array):",
            normalizedLevel,
            unitNumber,
            questionsModule
          );
          setContent(null);
          setQuestions([]);
          setLoading(false);
          return;
        }

        const preparedQuestions = rawQuestions.map((q) => ({
          ...q,
          shuffledOptions: Array.isArray(q.options)
            ? shuffle(q.options)
            : [],
        }));

        setContent(contentModule.default);
        setQuestions(preparedQuestions);
      } catch (err) {
        console.error("Vocabulary unit load failed:", err);
        setContent(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    loadUnit();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [normalizedLevel, unitNumber, level, unitId]);

  /* ======================
     Audio
  ====================== */
  const playWordAudio = (word) => {
    const cleanWord = word.toLowerCase();

    if (playingWord === cleanWord && audioRef.current) {
      audioRef.current.pause();
      setPlayingWord(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audioPath = `/sounds/vocabulary/${normalizedLevel}/unit${unitNumber}/${cleanWord}.mp3`;
    const audio = new Audio(audioPath);

    audioRef.current = audio;
    setPlayingWord(cleanWord);

    audio.play().catch(() => {
      console.warn("Audio not found:", audioPath);
      setPlayingWord(null);
    });

    audio.onended = () => {
      setPlayingWord(null);
    };
  };

  /* ======================
     Render guards
  ====================== */
  if (loading) return <p className="vocab-loading">Loading...</p>;

  if (!content || questions.length === 0) {
    return (
      <p className="vocab-loading">
        Vocabulary unit not found.
      </p>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  const isCorrect = selected === question.correctAnswer;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const saveProgress = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { completedUnits: [] };

    if (!data.completedUnits.includes(unitNumber)) {
      data.completedUnits.push(unitNumber);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  return (
    <div className="vocab-page vocab-unit-page">
      {/* ===== Header ===== */}
      <div className="vocab-unit-header">
        <h1>
          {content.level} – Unit {content.unit}
        </h1>
        <h2>{content.title}</h2>
        <p className="vocab-unit-desc">{content.description}</p>
      </div>

      {/* ===== Explanation ===== */}
      {Array.isArray(content.explanation) && (
        <div className="vocab-explanation">
          <h3>Explanation</h3>
          <ul>
            {content.explanation.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== Vocabulary ===== */}
      {Array.isArray(content.items) && (
        <div className="vocab-items-section">
          <h3>Vocabulary</h3>

          <div className="vocab-items">
            {content.items.map((item, i) => (
              <div key={i} className="vocab-item-card">
                <div className="vocab-item-header">
                  <div>
                    <div className="vocab-item-word">{item.word}</div>
                    <div className="vocab-item-phonetic">
                      {item.phonetic}
                    </div>
                  </div>

                  <button
                    className={`vocab-audio-btn ${
                      playingWord === item.word.toLowerCase()
                        ? "playing"
                        : ""
                    }`}
                    onClick={() => playWordAudio(item.word)}
                  >
                    🔊
                  </button>
                </div>

                <div className="vocab-item-meaning">
                  <strong>Meaning:</strong> {item.meaning}
                </div>

                <div className="vocab-item-example">
                  <strong>Example:</strong> {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Questions ===== */}
      <div className="vocab-question-box">
        <div className="vocab-question-header">
          Question {currentQuestion + 1} / {questions.length}
        </div>

        <p className="vocab-question-text">
          {question.question}
        </p>

        <div className="vocab-options">
          {question.shuffledOptions.map((opt) => {
            let optionClass = "vocab-option";

            if (showResult && opt === question.correctAnswer)
              optionClass += " correct";
            else if (showResult && opt === selected)
              optionClass += " wrong";
            else if (selected === opt)
              optionClass += " selected";

            return (
              <button
                key={opt}
                disabled={showResult}
                onClick={() => setSelected(opt)}
                className={optionClass}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <p className="vocab-inline-result">
            {isCorrect ? "Correct ✅" : "Wrong ❌"}
          </p>
        )}

        <div className="vocab-actions">
          {!showResult ? (
            <button
              className="vocab-btn primary"
              disabled={!selected}
              onClick={() => setShowResult(true)}
            >
              Check Answer
            </button>
          ) : !isLastQuestion ? (
            <button
              className="vocab-btn primary"
              onClick={() => {
                setSelected(null);
                setShowResult(false);
                setCurrentQuestion((q) => q + 1);
              }}
            >
              Next Question →
            </button>
          ) : (
            <button
              className="vocab-btn success"
              onClick={() => {
                saveProgress();
                navigate(`/vocabulary/${normalizedLevel}`);
              }}
            >
              Finish 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VocabularyUnitPage;

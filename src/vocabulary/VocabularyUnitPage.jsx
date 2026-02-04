import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Vocabulary.css";
import {
  UNIT_LOADERS,
  QUESTION_LOADERS,
} from "./vocabularyIndex";

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

  /* ======================
     Normalize params (STATIC KEYS)
  ====================== */
  const normalizedLevel =
    typeof level === "string"
      ? level.trim().toUpperCase()
      : null;

  const unitNumber = Number(unitId);

  const STORAGE_KEY = `vocabularyProgress_${normalizedLevel}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] =
    useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔊 audio
  const audioRef = useRef(null);
  const [playingWord, setPlayingWord] =
    useState(null);

  /* ======================
     Load Unit (STATIC)
  ====================== */
  useEffect(() => {
    let isMounted = true;

    const loadUnit = async () => {
      setLoading(true);
      setCurrentQuestion(0);
      setSelected(null);
      setShowResult(false);

      // ==== Guards على params ====
      if (
        !normalizedLevel ||
        !Number.isInteger(unitNumber)
      ) {
        console.error("Invalid vocabulary params:", {
          level,
          unitId,
        });
        setLoading(false);
        return;
      }

      const loadContent =
        UNIT_LOADERS?.[normalizedLevel]?.[unitNumber];
      const loadQuestions =
        QUESTION_LOADERS?.[normalizedLevel]?.[
          unitNumber
        ];

      if (!loadContent || !loadQuestions) {
        console.error("Unit loader not found:", {
          normalizedLevel,
          unitNumber,
        });
        setLoading(false);
        return;
      }

      try {
        const contentModule = await loadContent();
        const questionsModule =
          await loadQuestions();

        const resolvedContent =
          contentModule.default ??
          contentModule.content ??
          null;

        const rawQuestions =
          questionsModule.default ??
          questionsModule.questions ??
          null;

        if (
          !resolvedContent ||
          !Array.isArray(rawQuestions)
        ) {
          console.error("Invalid unit exports");
          return;
        }

        const preparedQuestions = rawQuestions.map(
          (q) => ({
            ...q,
            shuffledOptions: Array.isArray(q.options)
              ? shuffle(q.options)
              : [],
          })
        );

        if (!isMounted) return;

        setContent(resolvedContent);
        setQuestions(preparedQuestions);
      } catch (err) {
        console.error(
          "Vocabulary unit load failed:",
          err
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUnit();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [normalizedLevel, unitNumber]);

  /* ======================
     Audio
  ====================== */
  const playWordAudio = (word) => {
    const cleanWord = word.toLowerCase();

    if (
      playingWord === cleanWord &&
      audioRef.current
    ) {
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

    audio.onended = () => setPlayingWord(null);
  };

  /* ======================
     Render guards
  ====================== */
  if (loading) {
    return (
      <p className="vocab-loading">Loading...</p>
    );
  }

  if (!content || questions.length === 0) {
    return (
      <p className="vocab-loading">
        Vocabulary unit not found.
      </p>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  const isCorrect =
    selected === question.correctAnswer;
  const isLastQuestion =
    currentQuestion === questions.length - 1;

  const saveProgress = () => {
    const raw =
      localStorage.getItem(STORAGE_KEY);
    const data = raw
      ? JSON.parse(raw)
      : { completedUnits: [] };

    if (!data.completedUnits.includes(unitNumber)) {
      data.completedUnits.push(unitNumber);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    }
  };

  /* ======================
     Render
  ====================== */
  return (
    <div className="vocab-page vocab-unit-page">
      <div className="vocab-unit-header">
        <h1>
          {content.level} – Unit {content.unit}
        </h1>
        <h2>{content.title}</h2>
        <p className="vocab-unit-desc">
          {content.description}
        </p>
      </div>

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

      {Array.isArray(content.items) && (
        <div className="vocab-items-section">
          <h3>Vocabulary</h3>
          <div className="vocab-items">
            {content.items.map((item, i) => (
              <div
                key={i}
                className="vocab-item-card"
              >
                <div className="vocab-item-header">
                  <div>
                    <div className="vocab-item-word">
                      {item.word}
                    </div>
                    <div className="vocab-item-phonetic">
                      {item.phonetic}
                    </div>
                  </div>

                  <button
                    className={`vocab-audio-btn ${
                      playingWord ===
                      item.word.toLowerCase()
                        ? "playing"
                        : ""
                    }`}
                    onClick={() =>
                      playWordAudio(item.word)
                    }
                  >
                    🔊
                  </button>
                </div>

                <div className="vocab-item-meaning">
                  <strong>Meaning:</strong>{" "}
                  {item.meaning}
                </div>

                <div className="vocab-item-example">
                  <strong>Example:</strong>{" "}
                  {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="vocab-question-box">
        <div className="vocab-question-header">
          Question {currentQuestion + 1} /{" "}
          {questions.length}
        </div>

        <p className="vocab-question-text">
          {question.question}
        </p>

        <div className="vocab-options">
          {question.shuffledOptions.map((opt) => {
            let optionClass = "vocab-option";

            if (
              showResult &&
              opt === question.correctAnswer
            )
              optionClass += " correct";
            else if (
              showResult &&
              opt === selected
            )
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
            {isCorrect
              ? "Correct ✅"
              : "Wrong ❌"}
          </p>
        )}

        <div className="vocab-actions">
          {!showResult ? (
            <button
              className="vocab-btn primary"
              disabled={!selected}
              onClick={() =>
                setShowResult(true)
              }
            >
              Check Answer
            </button>
          ) : !isLastQuestion ? (
            <button
              className="vocab-btn primary"
              onClick={() => {
                setSelected(null);
                setShowResult(false);
                setCurrentQuestion(
                  (q) => q + 1
                );
              }}
            >
              Next Question →
            </button>
          ) : (
            <button
              className="vocab-btn success"
              onClick={() => {
                saveProgress();
                navigate(
                  `/vocabulary/${normalizedLevel}`
                );
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

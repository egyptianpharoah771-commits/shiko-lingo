import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import useQuizEngine from "../core/engine/useQuizEngine";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";

/* ======================
   Utils
====================== */
function shuffle(array) {
  if (!Array.isArray(array)) return [];
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

  const unitKey = `unit${unitId}`;
  const STORAGE_KEY = `vocabularyProgress_${normalizedLevel}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ======================
     Audio Refs (ISOLATED)
  ====================== */
  const wordAudioRef = useRef(null);
  const selectAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  const [playingWord, setPlayingWord] = useState(null);

  /* ======================
     Init Feedback Sounds (ONCE)
  ====================== */
  useEffect(() => {
    selectAudioRef.current = new Audio("/sounds/select.mp3");
    correctAudioRef.current = new Audio("/sounds/correct.mp3");
    wrongAudioRef.current = new Audio("/sounds/wrong.mp3");
  }, []);

  const playSelectSound = () => {
    if (!selectAudioRef.current) return;
    selectAudioRef.current.currentTime = 0;
    selectAudioRef.current.play().catch(() => {});
  };

  const playCorrectSound = () => {
    if (!correctAudioRef.current) return;
    correctAudioRef.current.currentTime = 0;
    correctAudioRef.current.play().catch(() => {});
  };

  const playWrongSound = () => {
    if (!wrongAudioRef.current) return;
    wrongAudioRef.current.currentTime = 0;
    wrongAudioRef.current.play().catch(() => {});
  };

  /* ======================
     Load Unit
  ====================== */
  useEffect(() => {
    setLoading(true);

    if (!normalizedLevel || !unitId) {
      setContent(null);
      setQuestions([]);
      setLoading(false);
      return;
    }

    const unitData =
      VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

    if (
      unitData &&
      unitData.content &&
      Array.isArray(unitData.questions)
    ) {
      setContent(unitData.content);

      const safeQuestions = unitData.questions.map((q) => ({
        ...q,
        shuffledOptions: shuffle(q.options),
      }));

      setQuestions(safeQuestions);
      setCurrentQuestion(0);
      setSelected(null);
      setShowResult(false);
    } else {
      setContent(null);
      setQuestions([]);
    }

    setLoading(false);
  }, [normalizedLevel, unitKey, unitId]);

  /* ======================
     Quiz Engine
  ====================== */
  const quizData = useMemo(() => {
    if (!Array.isArray(questions) || questions.length === 0)
      return [];
    return questions.map((q) => ({
      id: q.id,
      answer: q.correctAnswer,
    }));
  }, [questions]);

  const {
    selectAnswer,
    submitAnswers,
    resetQuiz,
  } = useQuizEngine({
    questions: quizData,
  });

  /* ======================
     Word Audio
  ====================== */
  const playWordAudio = (word) => {
    if (!normalizedLevel || !unitId) return;

    const cleanWord = word.toLowerCase();

    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }

    const audioPath = `/sounds/vocabulary/${normalizedLevel}/unit${unitId}/${cleanWord}.mp3`;

    const audio = new Audio(audioPath);
    wordAudioRef.current = audio;
    setPlayingWord(cleanWord);

    audio.play().catch(() => {});

    audio.onended = () => {
      setPlayingWord(null);
      wordAudioRef.current = null;
    };
  };

  /* ======================
     Save Progress
  ====================== */
  const saveProgress = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw
        ? JSON.parse(raw)
        : { completedUnits: [] };

      const unitNumber = Number(unitId);

      if (!data.completedUnits.includes(unitNumber)) {
        data.completedUnits.push(unitNumber);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(data)
        );
      }
    } catch {}
  };

  /* ======================
     Guards
  ====================== */
  if (loading) {
    return <div className="vocab-loading">Loading...</div>;
  }

  if (
    !content ||
    !Array.isArray(content.items) ||
    questions.length === 0
  ) {
    return (
      <div className="vocab-loading">
        Unit not found.
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion =
    currentQuestion === questions.length - 1;

  /* ======================
     Handlers
  ====================== */
  const handleCheck = () => {
    if (!question || !selected) return;

    const isCorrect =
      selected === question.correctAnswer;

    selectAnswer(question.id, selected);
    submitAnswers();
    setShowResult(true);

    if (isCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      saveProgress();
      navigate(`/vocabulary/${level}`);
    } else {
      setSelected(null);
      setShowResult(false);
      setCurrentQuestion((prev) => prev + 1);
      resetQuiz();
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

      <div className="vocab-items-section">
        <div className="vocab-items">
          {content.items.map((item, i) => (
            <div key={i} className="vocab-item-card">
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

      <div className="vocab-question-box">
        <div className="vocab-question-header">
          Question {currentQuestion + 1} /{" "}
          {questions.length}
        </div>

        <p className="vocab-question-text">
          {question.question}
        </p>

        <div className="vocab-options">
          {Array.isArray(question.shuffledOptions) &&
            question.shuffledOptions.map((opt) => (
              <AnswerOption
                key={opt}
                label={opt}
                disabled={showResult}
                state={
                  showResult
                    ? opt === question.correctAnswer
                      ? "correct"
                      : opt === selected
                      ? "wrong"
                      : "default"
                    : selected === opt
                    ? "selected"
                    : "default"
                }
                onClick={() => {
                  setSelected(opt);
                  playSelectSound();
                }}
              />
            ))}
        </div>

        <div className="vocab-actions">
          {!showResult ? (
            <button
              className="vocab-btn primary"
              disabled={!selected}
              onClick={handleCheck}
            >
              Check Answer
            </button>
          ) : (
            <button
              className={`vocab-btn ${
                isLastQuestion
                  ? "success"
                  : "primary"
              }`}
              onClick={handleNext}
            >
              {isLastQuestion
                ? "Finish 🎉"
                : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VocabularyUnitPage;
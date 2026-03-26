import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "../lib/auth";
import { useQuizEngine } from "../core/engine/useQuizEngine";
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

  const wordAudioRef = useRef(null);
  const selectAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  const [playingWord, setPlayingWord] = useState(null);

  const [audioMap, setAudioMap] = useState({}); // 🔥 NEW

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

  // 🔥 LOAD CONTENT + AUDIO FROM DB
  useEffect(() => {
    async function load() {
      setLoading(true);

      const unitData =
        VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

      if (unitData && unitData.content && Array.isArray(unitData.questions)) {
        setContent(unitData.content);

        const safeQuestions = unitData.questions.map((q) => ({
          ...q,
          shuffledOptions: shuffle(q.options),
        }));

        setQuestions(safeQuestions);
        setCurrentQuestion(0);
        setSelected(null);
        setShowResult(false);

        // 🔥 FETCH AUDIO FROM DB
        const words = unitData.content.items.map((w) =>
          w.word.toLowerCase()
        );

        const { data } = await supabase
          .from("words")
          .select("word, audio_url")
          .in("word", words);

        const map = {};
        (data || []).forEach((w) => {
          map[w.word.toLowerCase()] = w.audio_url;
        });

        setAudioMap(map);
      } else {
        setContent(null);
        setQuestions([]);
      }

      setLoading(false);
    }

    load();
  }, [normalizedLevel, unitKey]);

  const quizData = useMemo(() => {
    if (!Array.isArray(questions) || questions.length === 0) return [];
    return questions.map((q) => ({
      id: q.id,
      answer: q.correctAnswer,
    }));
  }, [questions]);

  const { selectAnswer, submitAnswers, resetQuiz } = useQuizEngine({
    questions: quizData,
  });

  // 🔊 AUDIO SYSTEM (FIXED)
  const playWordAudio = (word, example = "") => {
    const lower = word.toLowerCase();

    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current = null;
    }

    // ✅ DB AUDIO
    const dbAudio = audioMap[lower];
    if (dbAudio) {
      const audio = new Audio(dbAudio);
      wordAudioRef.current = audio;
      setPlayingWord(lower);

      audio.play().catch(() => {});
      audio.onended = () => {
        setPlayingWord(null);
        wordAudioRef.current = null;
      };
      return;
    }

    // 🔁 FALLBACK → TTS
    const text = example ? `${word}. ${example}` : word;

    const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
    wordAudioRef.current = audio;
    setPlayingWord(lower);

    audio.play().catch(() => {});
    audio.onended = () => {
      setPlayingWord(null);
      wordAudioRef.current = null;
    };
  };

  const saveProgress = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : { completedUnits: [] };

      const unitNumber = Number(unitId);

      if (!data.completedUnits.includes(unitNumber)) {
        data.completedUnits.push(unitNumber);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch {}
  };

  async function addUnitWordsToReview() {
    try {
      if (!content || !content.items) return;

      const user = await getCurrentUser();

      const words = content.items.map((w) =>
        w.word.toLowerCase()
      );

      const { data: dbWords } = await supabase
        .from("words")
        .select("id, word, simple_definition, audio_url") // ✅ FIXED
        .in("word", words);

      if (!dbWords || dbWords.length === 0) return;

      const progressRows = dbWords.map((w) => ({
        user_id: user.id,
        word_id: w.id,
        stage: 0,
        review_count: 0,
        correct_count: 0,
        wrong_count: 0,
        ease_factor: 2.5,
        interval: 0,
        next_review: new Date().toISOString(),
        last_review: null,
      }));

      await supabase
        .from("vocab_progress")
        .upsert(progressRows, {
          onConflict: ["user_id", "word_id"],
        });

    } catch (err) {
      console.error("Error adding unit words:", err);
    }
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleCheck = () => {
    if (!question || !selected) return;

    const isCorrect = selected === question.correctAnswer;

    selectAnswer(question.id, selected);
    submitAnswers();
    setShowResult(true);

    isCorrect ? playCorrectSound() : playWrongSound();
  };

  const handleFinish = async () => {
    await addUnitWordsToReview();
    saveProgress();
    navigate(`/vocabulary/${level}`);
  };

  if (loading) return <div className="vocab-loading">Loading...</div>;

  if (!content || !Array.isArray(content.items) || questions.length === 0) {
    return <div className="vocab-loading">Unit not found.</div>;
  }

  return (
    <div className="vocab-page vocab-unit-page">
      <div className="vocab-unit-header">
        <h1>{content.level} – Unit {content.unit}</h1>
        <h2>{content.title}</h2>
        <p className="vocab-unit-desc">{content.description}</p>
      </div>

      <div className="vocab-question-box">
        <div className="vocab-question-header">
          Question {currentQuestion + 1} / {questions.length}
        </div>

        <p className="vocab-question-text">{question.question}</p>

        {/* 🔊 PLAY WORD */}
        <button
          className="vocab-btn secondary"
          onClick={() =>
            playWordAudio(
              question.word || "",
              question.example || ""
            )
          }
        >
          🔊 Play
        </button>

        <div className="vocab-options">
          {question.shuffledOptions.map((opt) => (
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
                isLastQuestion ? "success" : "primary"
              }`}
              onClick={
                isLastQuestion
                  ? handleFinish
                  : () => {
                      setSelected(null);
                      setShowResult(false);
                      setCurrentQuestion((prev) => prev + 1);
                      resetQuiz();
                    }
              }
            >
              {isLastQuestion ? "Finish 🎉" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VocabularyUnitPage;
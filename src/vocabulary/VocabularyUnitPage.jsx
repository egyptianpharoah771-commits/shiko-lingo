import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "../lib/auth";
import { useQuizEngine } from "../core/engine/useQuizEngine";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";

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

  const selectAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    selectAudioRef.current = new Audio("/sounds/select.mp3");
    correctAudioRef.current = new Audio("/sounds/correct.mp3");
    wrongAudioRef.current = new Audio("/sounds/wrong.mp3");
  }, []);

  const playSelectSound = () => {
    selectAudioRef.current?.play().catch(() => {});
  };

  const playCorrectSound = () => {
    correctAudioRef.current?.play().catch(() => {});
  };

  const playWrongSound = () => {
    wrongAudioRef.current?.play().catch(() => {});
  };

  // 🔥 ✅ الرجوع للنظام القديم الحقيقي
  const speakWord = (text) => {
    if (!text) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      speechSynthesis.cancel(); // مهم علشان يمنع stacking
      speechSynthesis.speak(utter);
    } catch {}
  };

  useEffect(() => {
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
    } else {
      setContent(null);
      setQuestions([]);
    }

    setLoading(false);
  }, [normalizedLevel, unitKey]);

  const quizData = useMemo(() => {
    if (!questions.length) return [];
    return questions.map((q) => ({
      id: q.id,
      answer: q.correctAnswer,
    }));
  }, [questions]);

  const { selectAnswer, submitAnswers, resetQuiz } = useQuizEngine({
    questions: quizData,
  });

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
        .select("id, word")
        .in("word", words);

      if (!dbWords?.length) return;

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
      console.error(err);
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

  if (loading) return <div>Loading...</div>;
  if (!content || !questions.length) return <div>Unit not found</div>;

  return (
    <div className="vocab-page vocab-unit-page">
      <h2>{content.title}</h2>

      <p>{question.question}</p>

      {/* 🔊 الصوت رجع هنا */}
      <button onClick={() => speakWord(question.word)}>
        🔊 Play
      </button>

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

      {!showResult ? (
        <button onClick={handleCheck} disabled={!selected}>
          Check
        </button>
      ) : (
        <button
          onClick={
            isLastQuestion
              ? handleFinish
              : () => {
                  setSelected(null);
                  setShowResult(false);
                  setCurrentQuestion((p) => p + 1);
                  resetQuiz();
                }
          }
        >
          {isLastQuestion ? "Finish" : "Next"}
        </button>
      )}
    </div>
  );
}

export default VocabularyUnitPage;
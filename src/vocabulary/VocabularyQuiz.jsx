import { useEffect, useState } from "react";
import {
  getWordsForReview,
  updateWordStage,
} from "./spacedRepetition";
import { addQuizXP } from "../utils/xpEngine";
import QuizRenderer from "../components/QuizRenderer";

function VocabularyQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  const normalize = (v) =>
    (v || "").toString().trim().toLowerCase();

  /* =========================
     Generate Options (MCQ)
  ========================= */
  const generateOptions = (correctWord, allWords) => {
    const pool = allWords.filter((w) => w !== correctWord);

    if (pool.length < 3) return null;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());

    return [correctWord, ...shuffled.slice(0, 3)].sort(
      () => 0.5 - Math.random()
    );
  };

  /* =========================
     Build Question (SAFE)
  ========================= */
  const buildQuestion = (word, definition, allWords) => {
    const options = generateOptions(word, allWords);

    if (options && options.length >= 4) {
      return {
        type: "MCQ",
        word,
        definition,
        options,
      };
    }

    return {
      type: "TYPE",
      word,
      definition,
    };
  };

  /* =========================
     Load Quiz (UNCHANGED FLOW)
  ========================= */
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );

    const reviewWords = getWordsForReview(saved);

    if (!reviewWords.length) {
      setLoading(false);
      return;
    }

    const loadQuiz = async () => {
      const questions = [];

      for (const word of reviewWords) {
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          if (!res.ok) continue;

          const data = await res.json();

          const definition =
            data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

          if (!definition) continue;

          questions.push({
            word,
            definition,
          });
        } catch {}
      }

      const allWords = questions.map((q) => q.word);

      const finalQuiz = questions.map((q) =>
        buildQuestion(q.word, q.definition, allWords)
      );

      setQuiz(finalQuiz);
      setLoading(false);
    };

    loadQuiz();
  }, []);

  /* =========================
     Handle Answer
  ========================= */
  const handleAnswer = (answer) => {
    if (submitted) return;

    const q = quiz[currentIndex];

    const isCorrect =
      normalize(answer) === normalize(q.word);

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    updateWordStage(q.word, isCorrect);

    setInputValue("");

    if (currentIndex + 1 < quiz.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setSubmitted(true);
      addQuizXP();
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Preparing your review...</h2>
      </div>
    );
  }

  if (!quiz.length) {
    return (
      <div style={{ padding: 30 }}>
        <h2>No words ready for review.</h2>
      </div>
    );
  }

  const currentQuestion = quiz[currentIndex];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>🧠 Smart Vocabulary Review</h1>

      <p>
        Question {currentIndex + 1} / {quiz.length}
      </p>

      <QuizRenderer
        question={currentQuestion}
        onAnswer={handleAnswer}
        inputValue={inputValue}
        setInputValue={setInputValue}
      />

      {submitted && (
        <h2 style={{ marginTop: 20 }}>
          Score: {score} / {quiz.length}
        </h2>
      )}
    </div>
  );
}

export default VocabularyQuiz;
import { useState } from "react";

export default function useQuizEngine({
  questions,
  passRatio = 0.7,
}) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const PASS_SCORE = Math.ceil(
    questions.length * passRatio
  );
  const passed =
    submitted && score >= PASS_SCORE;

  const selectAnswer = (questionId, option) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const submitAnswers = () => {
    if (submitted) return false;

    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);

    return correct >= PASS_SCORE;
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return {
    answers,
    submitted,
    score,
    passed,
    PASS_SCORE,
    selectAnswer,
    submitAnswers,
    resetQuiz,
  };
}

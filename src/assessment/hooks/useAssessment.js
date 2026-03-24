import { useEffect, useState, useCallback } from "react";
import questionBank from "../../data/questionBank"; // ✅ FIXED PATH
import {
  initAssessmentState,
  getNextQuestion,
  handleAnswer,
} from "../logic/adaptiveEngine";

const STORAGE_KEY = "level_assessment_result";

export default function useAssessment() {
  const [state, setState] = useState(() => initAssessmentState());
  const [currentQuestion, setCurrentQuestion] = useState(null);

  /* ================= INIT ================= */

  useEffect(() => {
    const initialState = initAssessmentState();
    const first = getNextQuestion(questionBank, initialState);
    setCurrentQuestion(first);
  }, []);

  /* ================= ANSWER ================= */

  const submitAnswer = useCallback(
    (selectedIndex) => {
      if (!currentQuestion) return;

      const isCorrect =
        selectedIndex === currentQuestion.correctAnswer;

      setState((prev) => {
        const updated = handleAnswer(
          { correct: isCorrect },
          prev
        );

        const nextState = {
          ...updated,
          askedQuestionIds: [
            ...prev.askedQuestionIds,
            currentQuestion.id,
          ],
        };

        const nextQuestion = getNextQuestion(
          questionBank,
          nextState
        );

        setCurrentQuestion(nextQuestion);

        return nextState;
      });
    },
    [currentQuestion]
  );

  /* ================= FINISHED ================= */

  const finished = state.finished || !currentQuestion;

  /* ================= SAVE RESULT ================= */

  useEffect(() => {
    if (!finished) return;

    const result = {
      level: state.maxReachedLevel,
      questionsAnswered: state.askedQuestionIds.length,
      finishedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(result)
    );
  }, [finished, state.maxReachedLevel, state.askedQuestionIds.length]);

  return {
    currentQuestion,
    submitAnswer,
    finished,
    maxReachedLevel: state.maxReachedLevel,
    progress: state.askedQuestionIds.length,
  };
}
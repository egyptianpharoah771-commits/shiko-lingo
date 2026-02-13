import { useEffect, useState } from "react";
import questionBank from "../data/questionBank";
import {
  initAssessmentState,
  getNextQuestion,
  handleAnswer,
} from "../logic/adaptiveEngine";

const STORAGE_KEY = "level_assessment_result";

export default function useAssessment() {
  const [state, setState] = useState(initAssessmentState);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // تحميل أول سؤال مرة واحدة
  useEffect(() => {
    const first = getNextQuestion(
      questionBank,
      initAssessmentState()
    );
    setCurrentQuestion(first);
    // eslint-disable-next-line
  }, []);

  function submitAnswer(selectedIndex) {
    if (!currentQuestion) return;

    const isCorrect =
      selectedIndex === currentQuestion.correctAnswer;

    setState((prev) => {
      const updated = handleAnswer(
        { correct: isCorrect },
        prev
      );

      return {
        ...updated,
        askedQuestionIds: [
          ...prev.askedQuestionIds,
          currentQuestion.id,
        ],
      };
    });

    const nextState = {
      ...state,
      askedQuestionIds: [
        ...state.askedQuestionIds,
        currentQuestion.id,
      ],
    };

    const nextQuestion = getNextQuestion(
      questionBank,
      nextState
    );

    setCurrentQuestion(nextQuestion);
  }

  const finished = state.finished || !currentQuestion;

  // ⬅️ تخزين النتيجة عند الانتهاء
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
  }, [finished, state.maxReachedLevel, state.askedQuestionIds]);

  return {
    currentQuestion,
    submitAnswer,
    finished,
    maxReachedLevel: state.maxReachedLevel,
    progress: state.askedQuestionIds.length,
  };
}

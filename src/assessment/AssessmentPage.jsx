import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAssessment from "./hooks/useAssessment";

import AssessmentIntro from "./ui/AssessmentIntro";
import AssessmentQuestion from "./ui/AssessmentQuestion";
import AssessmentProgress from "./ui/AssessmentProgress";
import AssessmentResult from "./ui/AssessmentResult";

export default function AssessmentPage() {
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  const {
    currentQuestion,
    submitAnswer,
    finished,
    maxReachedLevel,
    progress,
  } = useAssessment();

  // Intro
  if (!started) {
    return (
      <AssessmentIntro
        onStart={() => setStarted(true)}
      />
    );
  }

  // Result
  if (finished) {
    return (
      <AssessmentResult
        level={maxReachedLevel}
        questionsAnswered={progress}
        onRestart={() => window.location.reload()}
        onContinue={() => navigate("/dashboard")}
      />
    );
  }

  // Loading
  if (!currentQuestion) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 🧭 Progress HUD */}
      <AssessmentProgress
        currentLevel={maxReachedLevel}
        questionsAnswered={progress}
      />

      {/* ❓ Question */}
      <AssessmentQuestion
        question={currentQuestion}
        onAnswer={(isCorrect) => {
          submitAnswer(
            isCorrect
              ? currentQuestion.correctAnswer
              : -1
          );
        }}
      />
    </div>
  );
}

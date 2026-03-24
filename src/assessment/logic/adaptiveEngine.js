const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function initAssessmentState() {
  return {
    currentLevel: "A1",
    correctStreak: 0,
    wrongStreak: 0,
    maxReachedLevel: "A1",
    askedQuestionIds: [],
    finished: false,
  };
}

/**
 * Get next question for current level
 */
export function getNextQuestion(questionBank, state) {
  if (!questionBank || questionBank.length === 0) return null;
  if (state.finished) return null;

  // أسئلة المستوى الحالي
  let candidates = questionBank.filter(
    (q) =>
      q.level === state.currentLevel &&
      !state.askedQuestionIds.includes(q.id)
  );

  // لو مفيش → جرّب المستوى الأعلى
  if (candidates.length === 0) {
    const currentIndex = LEVELS.indexOf(state.currentLevel);

    if (currentIndex < LEVELS.length - 1) {
      const nextLevel = LEVELS[currentIndex + 1];

      candidates = questionBank.filter(
        (q) =>
          q.level === nextLevel &&
          !state.askedQuestionIds.includes(q.id)
      );
    }
  }

  // لو لسه مفيش → إنهاء
  if (candidates.length === 0) {
    return null;
  }

  // اختيار عشوائي
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Handle answer and update state
 */
export function handleAnswer({ correct }, state) {
  let newState = { ...state };

  if (correct) {
    newState.correctStreak += 1;
    newState.wrongStreak = 0;

    // صح مرتين → اطلع مستوى
    if (newState.correctStreak >= 2) {
      newState.correctStreak = 0;
      newState = increaseLevel(newState);
    }
  } else {
    newState.wrongStreak += 1;
    newState.correctStreak = 0;

    // غلط مرتين → إنهاء
    if (newState.wrongStreak >= 2) {
      newState.finished = true;
    }
  }

  return newState;
}

/**
 * Increase level safely
 */
function increaseLevel(state) {
  const index = LEVELS.indexOf(state.currentLevel);

  // فيه مستوى أعلى
  if (index < LEVELS.length - 1) {
    const nextLevel = LEVELS[index + 1];

    return {
      ...state,
      currentLevel: nextLevel,
      maxReachedLevel: nextLevel,
    };
  }

  // وصل C2 → إنهاء التقييم
  return {
    ...state,
    finished: true,
  };
}



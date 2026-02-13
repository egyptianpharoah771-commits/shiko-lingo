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
  if (state.finished) return null;

  // أي سؤال من نفس المستوى ولسه متسألش
  const candidates = questionBank.filter(
    (q) =>
      q.level === state.currentLevel &&
      !state.askedQuestionIds.includes(q.id)
  );

  if (candidates.length === 0) {
    return null;
  }

  // خد أول واحد (ممكن نعمل random بعدين)
  return candidates[0];
}

/**
 * Handle answer and update state
 */
export function handleAnswer({ correct }, state) {
  let newState = { ...state };

  if (correct) {
    newState.correctStreak += 1;
    newState.wrongStreak = 0;

    // لو صح مرتين → اطلع مستوى
    if (newState.correctStreak >= 2) {
      newState.correctStreak = 0;
      newState = increaseLevel(newState);
    }
  } else {
    newState.wrongStreak += 1;
    newState.correctStreak = 0;

    // غلط مرتين → وقف
    if (newState.wrongStreak >= 2) {
      newState.finished = true;
    }
  }

  return newState;
}

function increaseLevel(state) {
  const index = LEVELS.indexOf(state.currentLevel);
  if (index < LEVELS.length - 1) {
    const nextLevel = LEVELS[index + 1];
    return {
      ...state,
      currentLevel: nextLevel,
      maxReachedLevel: nextLevel,
    };
  }
  return state;
}

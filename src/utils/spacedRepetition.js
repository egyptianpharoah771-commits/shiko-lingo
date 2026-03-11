/* =========================
   Spaced Repetition Engine
========================= */

export function getNextReview(stage, isCorrect) {

  let nextStage = stage;

  /* Move stage up or down */

  if (isCorrect) {
    nextStage = Math.min(stage + 1, 3);
  } else {
    nextStage = Math.max(stage - 1, 0);
  }

  const now = new Date();

  /* Review intervals (minutes) */

  const intervals = {
    0: 10,        // new word → 10 minutes
    1: 60 * 24,   // learning → 1 day
    2: 60 * 24 * 3, // review → 3 days
    3: 60 * 24 * 7  // mastered → 7 days
  };

  const minutes = intervals[nextStage] ?? 60 * 24;

  const nextReview = new Date(
    now.getTime() + minutes * 60000
  );

  return {
    nextStage,
    nextReview: nextReview.toISOString(),
  };
}
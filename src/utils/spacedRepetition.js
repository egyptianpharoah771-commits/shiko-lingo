export function getNextReview(stage, isCorrect) {
  let nextStage = stage;

  if (isCorrect) {
    nextStage = Math.min(stage + 1, 3);
  } else {
    nextStage = 0;
  }

  const now = new Date();
  let nextReview = new Date(now);

  switch (nextStage) {
    case 0:
      nextReview.setMinutes(now.getMinutes() + 10);
      break;

    case 1:
      nextReview.setDate(now.getDate() + 1);
      break;

    case 2:
      nextReview.setDate(now.getDate() + 3);
      break;

    case 3:
      nextReview.setDate(now.getDate() + 7);
      break;

    default:
      nextReview.setDate(now.getDate() + 1);
  }

  return {
    nextStage,
    nextReview,
  };
}
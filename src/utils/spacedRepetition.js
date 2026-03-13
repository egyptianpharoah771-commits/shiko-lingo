export function getNextReview(stage, correct) {

  let nextStage = stage;

  if (correct) {

    nextStage = stage + 1;

  } else {

    nextStage = Math.max(stage - 1, 0);

  }

  const intervals = [
    0,
    1,
    2,
    4,
    7,
    15,
    30
  ];

  const days =
    intervals[nextStage] ||
    intervals[intervals.length - 1];

  const nextReview =
    new Date(
      Date.now() + days * 86400000
    ).toISOString();

  return {
    nextStage,
    nextReview
  };

}
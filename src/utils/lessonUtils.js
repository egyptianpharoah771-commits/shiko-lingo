// A1-lesson3 → lesson3
export function getLessonFolder(lessonId) {
  return lessonId.split("-")[1];
}

// A1-lesson3 → 3
export function getLessonNumber(lessonId) {
  const folder = getLessonFolder(lessonId);
  return Number(folder.replace("lesson", ""));
}

// Check if this is the last lesson in the level
export function isLastLesson(
  lessonId,
  level,
  totals
) {
  return (
    getLessonNumber(lessonId) ===
    (totals[level] || 0)
  );
}

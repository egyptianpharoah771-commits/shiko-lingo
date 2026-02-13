// A1-lesson3 → lesson3
export function getLessonFolder(lessonId) {
  if (!lessonId || typeof lessonId !== "string") {
    return null;
  }

  const parts = lessonId.split("-");
  return parts.length > 1 ? parts[1] : null;
}

// A1-lesson3 → 3 (SAFE – no crash)
export function getLessonNumber(lessonId) {
  if (!lessonId || typeof lessonId !== "string") {
    return null;
  }

  const parts = lessonId.split("-");
  if (parts.length < 2) return null;

  const folder = parts[1];
  if (!folder.startsWith("lesson")) return null;

  const number = Number(folder.replace("lesson", ""));
  return Number.isNaN(number) ? null : number;
}

// Check if this is the last lesson in the level (SAFE)
export function isLastLesson(
  lessonId,
  level,
  totals
) {
  const lessonNumber = getLessonNumber(lessonId);
  if (!lessonNumber) return false;

  return lessonNumber === (totals[level] || 0);
}

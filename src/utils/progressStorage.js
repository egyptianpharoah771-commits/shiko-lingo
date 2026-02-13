// src/utils/progressStorage.js

/* ===== Base Helpers ===== */

export function getArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function setArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ===== Progress Helpers ===== */

export function getCompletedLessons(storageKey) {
  return getArray(storageKey);
}

export function isLessonCompleted(storageKey, lessonKey) {
  const completed = getArray(storageKey);
  return completed.includes(lessonKey);
}

export function markLessonCompleted(storageKey, lessonKey) {
  const completed = getArray(storageKey);

  if (!completed.includes(lessonKey)) {
    completed.push(lessonKey);
    setArray(storageKey, completed);
  }
}

export function countCompletedByLevel(storageKey, level) {
  const completed = getArray(storageKey);
  return completed.filter((id) =>
    id.startsWith(`${level}-`)
  ).length;
}

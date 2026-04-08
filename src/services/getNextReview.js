import {
  filterWordsByLevel,
  safeGenerateOptions,
  shuffle
} from "./utils/reviewEngine";

export function getNextReview({
  allWords,
  userLevel = "B2",
  usedWordIds = []
}) {
  if (!allWords || allWords.length === 0) {
    return null;
  }

  // 1. فلترة حسب المستوى
  const filtered = filterWordsByLevel(allWords, userLevel);

  // 2. استبعاد الكلمات اللي اتستخدمت
  const available = filtered.filter(w => !usedWordIds.includes(w.id));

  const pool = available.length > 0 ? available : filtered;

  if (!pool.length) return null;

  // 3. اختيار كلمة
  const currentWord = shuffle(pool)[0];

  // 4. توليد اختيارات (مضمون)
  const options = safeGenerateOptions(currentWord, allWords);

  // 5. Guard
  if (!options || options.length < 2) {
    return null;
  }

  return {
    word: currentWord,
    options
  };
}



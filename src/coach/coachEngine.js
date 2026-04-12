const SESSION_SIZE = 20;
const MAX_REPEATS = 2;

/**
 * Load progress
 */
export function getCoachProgress() {
  try {
    return JSON.parse(localStorage.getItem("coach_progress") || "{}");
  } catch {
    return {};
  }
}

/**
 * Save progress
 */
export function saveCoachProgress(progress) {
  localStorage.setItem("coach_progress", JSON.stringify(progress));
}

/**
 * Update stats after each answer
 */
export function updateWordStats(wordId, isCorrect) {
  const progress = getCoachProgress();

  if (!progress[wordId]) {
    progress[wordId] = {
      correct: 0,
      wrong: 0,
      lastSeen: 0,
    };
  }

  if (isCorrect) {
    progress[wordId].correct += 1;
  } else {
    progress[wordId].wrong += 1;
  }

  progress[wordId].lastSeen = Date.now();

  saveCoachProgress(progress);
}

/**
 * Weakness score
 */
function getWeaknessScore(wordId, progress) {
  const data = progress[wordId];

  if (!data) return 1;

  const { correct, wrong, lastSeen } = data;

  const accuracy = correct / (correct + wrong || 1);

  const daysSinceSeen =
    (Date.now() - lastSeen) / (1000 * 60 * 60 * 24);

  return (1 - accuracy) + daysSinceSeen * 0.1;
}

/**
 * Shuffle helper
 */
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

/**
 * 🔥 SAFE MEANING RESOLVER (FIX)
 */
function getMeaning(word) {
  return (
    word.meaning ||
    word.definition ||
    word.simple_definition ||
    ""
  );
}

/**
 * Generate question (FIXED)
 */
function generateContextQuestion(word, allWords) {
  const sentence =
    word.example ||
    `This is a sentence using "${word.word}".`;

  const correctAnswer = getMeaning(word);

  if (!correctAnswer) return null;

  const distractors = shuffle(
    allWords
      .filter(w => w.id !== word.id)
      .map(w => getMeaning(w))
      .filter(Boolean)
  ).slice(0, 3);

  // 🔥 ضمان وجود 4 اختيارات
  const options = shuffle([
    correctAnswer,
    ...distractors,
  ]).slice(0, 4);

  if (options.length < 2) return null;

  return {
    type: "context_mcq",
    wordId: word.id,
    question: sentence,
    correctAnswer,
    options,
  };
}

/**
 * Prevent repeats
 */
function limitRepeats(questions) {
  const seen = {};

  return questions.filter(q => {
    if (!q) return false;

    if (!seen[q.wordId]) seen[q.wordId] = 0;

    if (seen[q.wordId] >= MAX_REPEATS) return false;

    seen[q.wordId]++;
    return true;
  });
}

/**
 * MAIN FUNCTION (FIXED)
 */
export function generateCoachSession(words) {
  if (!words || !words.length) return [];

  const progress = getCoachProgress();

  const ranked = [...words].sort((a, b) => {
    return (
      getWeaknessScore(b.id, progress) -
      getWeaknessScore(a.id, progress)
    );
  });

  const selected = ranked.slice(0, SESSION_SIZE);

  let questions = selected
    .map(word => generateContextQuestion(word, words))
    .filter(Boolean);

  questions = limitRepeats(questions);

  return questions;
}
// src/coach/coachEngine.js

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
 * Weakness score (higher = needs review)
 */
function getWeaknessScore(wordId, progress) {
  const data = progress[wordId];

  if (!data) return 1; // unseen words

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
 * Generate context question (C1-style)
 */
function generateContextQuestion(word, allWords) {
  const sentence =
    word.example ||
    `This is a sentence using "${word.word}".`;

  const correctAnswer = word.meaning;

  const distractors = shuffle(
    allWords
      .filter(w => w.id !== word.id)
      .map(w => w.meaning)
  ).slice(0, 3);

  const options = shuffle([correctAnswer, ...distractors]);

  return {
    type: "context_mcq",
    wordId: word.id,
    question: sentence,
    correctAnswer,
    options,
  };
}

/**
 * Prevent same word repeating too much
 */
function limitRepeats(questions) {
  const seen = {};

  return questions.filter(q => {
    if (!seen[q.wordId]) seen[q.wordId] = 0;

    if (seen[q.wordId] >= MAX_REPEATS) return false;

    seen[q.wordId]++;
    return true;
  });
}

/**
 * MAIN FUNCTION
 */
export function generateCoachSession(words) {
  const progress = getCoachProgress();

  // rank by weakness
  const ranked = [...words].sort((a, b) => {
    return (
      getWeaknessScore(b.id, progress) -
      getWeaknessScore(a.id, progress)
    );
  });

  const selected = ranked.slice(0, SESSION_SIZE);

  let questions = selected.map(word =>
    generateContextQuestion(word, words)
  );

  questions = limitRepeats(questions);

  return questions;
}

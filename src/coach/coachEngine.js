import { generateMCQOptions } from "../utils/mcqGenerator";
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

  const accuracy = correct / ((correct + wrong) || 1);

  const daysSinceSeen =
    (Date.now() - lastSeen) / (1000 * 60 * 60 * 24);

  return (1 - accuracy) + daysSinceSeen * 0.1;
}

/**
 * Stable question generator (uses word.definition — matches useWords output)
 */
const LEVEL_SENTENCE_TEMPLATES = {
  A1: (w) => `I see a ${w}.`,
  A2: (w) => `I use the word "${w}" in a short daily sentence.`,
  B1: (w) => `In daily communication, "${w}" often appears in practical contexts.`,
  B2: (w) => `In a more formal context, "${w}" can shift the meaning of the sentence.`,
  C1: (w) => `In nuanced discourse, "${w}" conveys subtle intent depending on register and context.`,
};

function getSentenceTemplate(level, word) {
  const key = (level || "A1").toUpperCase();
  const template = LEVEL_SENTENCE_TEMPLATES[key] || LEVEL_SENTENCE_TEMPLATES.A1;
  return template(word);
}

function generateContextQuestion(word, allWords, level = "A1") {
  const correctAnswer = word.definition;
  if (!correctAnswer || !String(correctAnswer).trim()) return null;

  const sentence = getSentenceTemplate(level, word.word);
  const options = generateMCQOptions(word, allWords, level);
  if (options.length !== 4) return null;

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

  return questions.filter((q) => {
    if (!seen[q.wordId]) seen[q.wordId] = 0;

    if (seen[q.wordId] >= MAX_REPEATS) return false;

    seen[q.wordId]++;
    return true;
  });
}

/**
 * Build coach session from word list.
 * Second argument ignored (kept for call sites that pass { type }).
 */
export function generateCoachSession(words, options = {}) {
  if (!words || !words.length) return [];
  const level = options.level || "A1";

  const progress = getCoachProgress();

  const ranked = [...words].sort((a, b) => {
    return (
      getWeaknessScore(b.id, progress) -
      getWeaknessScore(a.id, progress)
    );
  });

  const selected = ranked.slice(0, SESSION_SIZE);

  let questions = selected
    .map((word) => generateContextQuestion(word, words, level))
    .filter(Boolean);

  questions = limitRepeats(questions);

  return questions;
}

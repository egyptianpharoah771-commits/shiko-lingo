import { generateMCQOptions } from "../../utils/mcqGenerator";

const LEVEL_PROMPTS = {
  A1: (word) => `Choose the best meaning of "${word}".`,
  A2: (word) => `Pick the correct meaning for "${word}" in simple English.`,
  B1: (word) => `Choose the meaning that best fits "${word}" in a sentence context.`,
  B2: (word) => `Select the most accurate meaning of "${word}" in this context.`,
  C1: (word) => `Identify the most precise interpretation of "${word}" in nuanced usage.`,
};

function resolvePrompt(level, word) {
  const fn = LEVEL_PROMPTS[(level || "A1").toUpperCase()] || LEVEL_PROMPTS.A1;
  return fn(word);
}

export function buildQuestion(word, words, level = "A1") {
  const correctAnswer = word.simple_definition || word.definition;
  if (!word?.word || !correctAnswer) return null;

  const options = generateMCQOptions(word, words, level);
  if (!options.length) return null;

  return {
    word: word.word,
    question: resolvePrompt(level, word.word),
    correctAnswer,
    options,
    level: (level || "A1").toUpperCase(),
  };
}

export function buildQuestionSet(words, level = "A1") {
  if (!Array.isArray(words)) return [];

  return words
    .filter((w) => w && w.word && (w.simple_definition || w.definition))
    .map((word) => buildQuestion(word, words, level))
    .filter(Boolean);
}

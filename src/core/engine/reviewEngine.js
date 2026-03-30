// src/core/engine/reviewEngine.js

import { generateMCQOptions } from "../../utils/mcqGenerator";

/**
 * Normalize text
 */
function normalize(text) {
  return text?.toLowerCase().trim();
}

/**
 * Get definition based on level
 */
function getDefinition(word, level = "A1") {
  if (!word) return "";

  switch (level) {
    case "A1":
      return word.definition_easy || word.definition;

    case "A2":
      return (
        word.definition_easy ||
        word.definition_medium ||
        word.definition
      );

    case "B1":
    case "B2":
      return (
        word.definition_medium ||
        word.definition_easy ||
        word.definition
      );

    case "C1":
      return (
        word.definition_hard ||
        word.definition_medium ||
        word.definition
      );

    default:
      return word.definition_easy || word.definition;
  }
}

/**
 * Create a review question
 */
export function createReviewQuestion(
  currentWord,
  allWords,
  level = "A1"
) {
  if (!currentWord) return null;

  const correctAnswer = getDefinition(currentWord, level);

  if (!correctAnswer) return null;

  const options = generateMCQOptions(
    {
      ...currentWord,
      definition: correctAnswer, // مهم علشان mcqGenerator
    },
    allWords.map((w) => ({
      ...w,
      definition: getDefinition(w, level),
    }))
  );

  return {
    word: currentWord.word,
    correctAnswer,
    options,
  };
}

/**
 * Validate answer
 */
export function checkAnswer(selected, correctAnswer) {
  if (!selected || !correctAnswer) return false;
  return normalize(selected) === normalize(correctAnswer);
}

/**
 * Filter valid words
 */
export function filterValidWords(words, level = "A1") {
  if (!Array.isArray(words)) return [];

  return words.filter((w) => {
    if (!w || !w.word) return false;

    const def = getDefinition(w, level);
    return !!def;
  });
}
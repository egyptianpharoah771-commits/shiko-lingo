// src/core/engine/reviewEngine.js

import { generateMCQOptions } from "../../utils/mcqGenerator";

/**
 * Normalize text
 */
function normalize(text) {
  return text?.toLowerCase().trim();
}

/**
 * Create a review question
 */
export function createReviewQuestion(currentWord, allWords) {
  if (!currentWord) return null;

  const correctAnswer =
    currentWord.simple_definition || currentWord.definition;

  if (!correctAnswer) return null;

  const options = generateMCQOptions(currentWord, allWords);

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
export function filterValidWords(words) {
  if (!Array.isArray(words)) return [];

  return words.filter(
    (w) =>
      w &&
      w.word &&
      (w.simple_definition || w.definition)
  );
}
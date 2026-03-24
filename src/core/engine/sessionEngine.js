// src/core/engine/sessionEngine.js

import { generateMCQOptions } from "../../utils/mcqGenerator";

/**
 * Normalize text
 */
function normalize(text) {
  return text?.toLowerCase().trim();
}

/**
 * Create session questions
 */
export function createSession(words) {
  if (!Array.isArray(words)) return [];

  return words
    .filter((w) => w && w.word && (w.simple_definition || w.definition))
    .map((word) => {
      const correct =
        word.simple_definition || word.definition;

      const options = generateMCQOptions(word, words);

      return {
        word: word.word,
        correctAnswer: correct,
        options,
      };
    });
}

/**
 * Check answer
 */
export function validateAnswer(selected, correctAnswer) {
  if (!selected || !correctAnswer) return false;
  return normalize(selected) === normalize(correctAnswer);
}
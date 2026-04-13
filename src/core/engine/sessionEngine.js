// src/core/engine/sessionEngine.js

import { buildQuestionSet } from "./QuestionEngine";

/**
 * Normalize text
 */
function normalize(text) {
  return text?.toLowerCase().trim();
}

/**
 * Create session questions
 */
export function createSession(words, level = "A1") {
  return buildQuestionSet(words, level);
}

/**
 * Check answer
 */
export function validateAnswer(selected, correctAnswer) {
  if (!selected || !correctAnswer) return false;
  return normalize(selected) === normalize(correctAnswer);
}
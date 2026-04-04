// src/core/engine/reviewEngine.js

import { generateMCQOptions } from "../../utils/mcqGenerator";

function normalize(text) {
  return text?.toLowerCase().trim();
}

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
 * 🔥 SAFE word filter (CRITICAL FIX)
 */
export function filterValidWords(words, level = "A1") {
  if (!Array.isArray(words)) return [];

  return words.filter((w) => {
    if (!w || !w.word) return false;

    const def = getDefinition(w, level);
    return typeof def === "string" && def.trim().length > 0;
  });
}

/**
 * 🔥 Create stable review question
 */
export function createReviewQuestion(
  currentWord,
  allWords,
  level = "A1"
) {
  if (!currentWord) return null;

  const correctAnswer = getDefinition(currentWord, level);
  if (!correctAnswer) return null;

  // ✅ CRITICAL: فلترة pool بالكامل
  const validWords = filterValidWords(allWords, level);

  // ❌ لو مش كفاية كلمات → امنع crash
  if (validWords.length < 4) {
    return {
      word: currentWord.word,
      correctAnswer,
      options: [correctAnswer],
      fallback: true,
    };
  }

  const options = generateMCQOptions(
    {
      ...currentWord,
      definition: correctAnswer,
    },
    validWords.map((w) => ({
      ...w,
      definition: getDefinition(w, level),
    }))
  );

  // 🔥 HARD GUARD (يمنع Preparing)
  if (!options || options.length < 2) {
    return {
      word: currentWord.word,
      correctAnswer,
      options: [correctAnswer],
      fallback: true,
    };
  }

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
// src/services/reviewService.js

import {
  filterWordsByLevel,
  safeGenerateOptions,
  shuffle
} from "../utils/reviewEngine";

/**
 * getNextReview
 * Responsible for:
 * - Selecting next word
 * - Applying difficulty logic
 * - Generating options safely
 * - Preventing empty questions
 */
export function getNextReview({
  allWords = [],
  userLevel = "B2",
  usedWordIds = []
}) {
  try {
    // 🛑 Guard 1
    if (!allWords.length) {
      console.warn("No words available");
      return null;
    }

    // 🧠 Step 1: Filter by level
    const filtered = filterWordsByLevel(allWords, userLevel);

    if (!filtered.length) {
      console.warn("No words after filtering");
      return null;
    }

    // 🔄 Step 2: Remove already used words
    const available = filtered.filter(
      (w) => !usedWordIds.includes(w.id)
    );

    const pool = available.length ? available : filtered;

    // 🎯 Step 3: Pick random word
    const currentWord = shuffle(pool)[0];

    if (!currentWord) {
      console.warn("No word selected");
      return null;
    }

    // 🎲 Step 4: Generate options safely
    const options = safeGenerateOptions(currentWord, allWords);

    // 🛑 Guard 2 (Critical Fix)
    if (!options || options.length < 2) {
      console.warn("Options generation failed");
      return null;
    }

    return {
      word: currentWord,
      options
    };

  } catch (error) {
    console.error("getNextReview error:", error);
    return null;
  }
}
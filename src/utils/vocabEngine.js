// src/utils/vocabEngine.js

import { calculateNextReview } from "../vocabulary/spacedRepetition";

/**
 * Normalize word object coming from DB
 */
function normalizeWord(word) {
  if (!word) return null;

  return {
    id: word.id,
    word: word.word?.trim(),

    // 🔥 FIX: definition fallback
    definition:
      word.simple_definition?.trim() ||
      word.definition?.trim() ||
      "",

    // 🔥 FIX: audio support
    audio_url: word.audio_url || null,

    level: word.level,
    next_review: word.next_review || null,
    interval: word.interval || 1,
    ease_factor: word.ease_factor || 2.5,
    repetitions: word.repetitions || 0,
  };
}

/**
 * Prepare words for review session
 */
export function prepareReviewWords(words) {
  if (!Array.isArray(words)) return [];

  return words
    .map(normalizeWord)
    .filter((w) => w && w.word && w.definition);
}

/**
 * Process answer result (SM-2 or custom spaced repetition)
 */
export function processAnswer(word, isCorrect) {
  if (!word) return null;

  const quality = isCorrect ? 5 : 2;

  const updated = calculateNextReview({
    interval: word.interval,
    easeFactor: word.ease_factor,
    repetitions: word.repetitions,
    quality,
  });

  return {
    ...word,
    interval: updated.interval,
    ease_factor: updated.easeFactor,
    repetitions: updated.repetitions,
    next_review: updated.nextReview,
  };
}

/**
 * Filter due words
 */
export function getDueWords(words) {
  if (!Array.isArray(words)) return [];

  const now = new Date();

  return words.filter((w) => {
    if (!w.next_review) return true;
    return new Date(w.next_review) <= now;
  });
}

/**
 * 🔊 Play audio with fallback (IMPORTANT)
 */
export function playWordAudio(word) {
  try {
    if (word.audio_url) {
      const audio = new Audio(word.audio_url);
      audio.play();
    } else if (word.word) {
      const utter = new SpeechSynthesisUtterance(word.word);
      utter.lang = "en-US";
      speechSynthesis.speak(utter);
    }
  } catch (err) {
    console.error("Audio error:", err);
  }
}

/**
 * Save word progress to DB
 */
export async function saveWordToDB(supabase, word) {
  if (!supabase || !word) return;

  try {
    const { error } = await supabase
      .from("words_progress")
      .upsert({
        word_id: word.id,
        interval: word.interval,
        ease_factor: word.ease_factor,
        repetitions: word.repetitions,
        next_review: word.next_review,
      });

    if (error) {
      console.error("saveWordToDB error:", error);
    }
  } catch (err) {
    console.error("saveWordToDB exception:", err);
  }
}
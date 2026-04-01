import { calculateNextReview } from "../vocabulary/spacedRepetition";

/**
 * Normalize word object
 */
function normalizeWord(word) {
  if (!word) return null;

  return {
    id: word.id || word.word,
    word: word.word?.trim(),

    definition:
      word.simple_definition?.trim() ||
      word.definition?.trim() ||
      word.meaning?.trim() ||
      "",

    // ✅ audio لو موجود
    audio: word.audio || null,

    level: word.level,
    unit: word.unit,

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
 * Process answer result
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
 * 🔥 NORMALIZE WORD → FILE NAME
 */
function normalizeWordToFile(word) {
  return word
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "_"); // ✅ المهم — بدون حذف حروف
}

/**
 * 🔊 FIXED AUDIO SYSTEM (FINAL)
 */
export function playWordAudio(word) {
  try {
    if (!word?.word) return;

    let src = word.audio;

    // ✅ fallback لو مفيش audio في الداتا
    if (!src) {
      const fileName = normalizeWordToFile(word.word);

      // ⚠️ لازم level و unit يكونوا موجودين في word
      const level = word.level?.toUpperCase();
      const unit = word.unit ? `unit${word.unit}` : null;

      if (!level || !unit) {
        console.warn("Missing level/unit for audio:", word);
        return;
      }

      src = `/sounds/vocabulary/${level}/${unit}/${fileName}.mp3`;
    }

    const audio = new Audio(src);
    audio.currentTime = 0;

    audio.play().catch(() => {
      console.warn("Audio failed:", src);
    });

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
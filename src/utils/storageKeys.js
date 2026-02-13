// src/utils/storageKeys.js

/**
 * Centralized localStorage keys
 * Phase 3 – Unified & Backend-ready
 */

const STORAGE_KEYS = {
  /* ===== Progress (Skills) ===== */
  LISTENING_COMPLETED: "completedLessons",
  READING_COMPLETED: "completedReadingLessons",
  WRITING_COMPLETED: "completedWritingLessons",
  SPEAKING_COMPLETED: "completedSpeakingLessons",

  /* ===== Grammar ===== */
  GRAMMAR_COMPLETED: "completedGrammarUnits",

  /* ===== Admin Feedback ===== */
  FEEDBACKS: "shiko_feedbacks",
  ADMIN_NOTES: "shiko_admin_notes",

  /* ===== Meta / UX ===== */
  LAST_VISITED_SKILL: "lastVisitedSkill",

  /* ===== Flags / Unlocks (Normalized) ===== */
  B1_LISTENING_UNLOCKED: "b1_listening_unlocked",
};

export default STORAGE_KEYS;

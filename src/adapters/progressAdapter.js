import STORAGE_KEYS from "../utils/storageKeys";
import { getArray } from "../utils/progressStorage";
import { getCurrentPiUser } from "./piUserAdapter";

/**
 * Returns progress in Contract shape
 */
export function getUserProgress() {
  const piUser = getCurrentPiUser();

  return {
    pi_uid: piUser?.uid || "guest",

    skills: {
      listening: getArray(STORAGE_KEYS.LISTENING_COMPLETED),
      reading: getArray(STORAGE_KEYS.READING_COMPLETED),
      writing: getArray(STORAGE_KEYS.WRITING_COMPLETED),
      speaking: getArray(STORAGE_KEYS.SPEAKING_COMPLETED),
      grammar: getArray(STORAGE_KEYS.GRAMMAR_COMPLETED),
    },

    flags: {
      b1ListeningUnlocked:
        localStorage.getItem(
          STORAGE_KEYS.B1_LISTENING_UNLOCKED
        ) === "true",
    },

    updatedAt: new Date().toISOString(),
  };
}

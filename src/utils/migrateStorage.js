// src/utils/migrateStorage.js
import STORAGE_KEYS from "./storageKeys";

/**
 * Run once on app load
 * Safely migrates legacy keys to new unified keys
 */
export function migrateLegacyStorage() {
  try {
    // ---- Migrate B1_completed -> B1_LISTENING_UNLOCKED
    const legacyB1 = localStorage.getItem("B1_completed");
    const newB1 = localStorage.getItem(
      STORAGE_KEYS.B1_LISTENING_UNLOCKED
    );

    if (legacyB1 === "true" && !newB1) {
      localStorage.setItem(
        STORAGE_KEYS.B1_LISTENING_UNLOCKED,
        "true"
      );
    }

    // Optional: remove legacy key after migration
    if (legacyB1) {
      localStorage.removeItem("B1_completed");
    }
  } catch {
    // silent fail (never block app)
  }
}

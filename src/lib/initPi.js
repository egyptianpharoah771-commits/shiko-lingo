/**
 * Pi SDK Initialization (Stabilization Version)
 * ----------------------------------------------
 * Passive initialization only.
 *
 * - No authenticate
 * - No payment logic
 * - No incomplete handlers
 * - No backend calls
 *
 * Safe for:
 * - Pi Browser
 * - Chrome
 * - SSR environments
 */

let initialized = false;

/**
 * Initializes Pi SDK safely (Passive Mode)
 * Returns:
 *  - true  => Pi SDK available and marked initialized
 *  - false => Not in Pi environment
 */
export function initPiSDK() {
  /* ==============================
     1️⃣ SSR Safety
  ============================== */
  if (typeof window === "undefined") {
    return false;
  }

  /* ==============================
     2️⃣ Ensure Pi SDK exists
  ============================== */
  if (!window.Pi) {
    return false;
  }

  /* ==============================
     3️⃣ Prevent double initialization
  ============================== */
  if (initialized) {
    return true;
  }

  /* ==============================
     4️⃣ Passive detection only
  ============================== */
  console.log("✅ Pi SDK detected (passive init)");

  initialized = true;

  return true;
}

/**
 * Helper: Check if Pi SDK is available
 */
export function isPiAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof window.Pi !== "undefined"
  );
}
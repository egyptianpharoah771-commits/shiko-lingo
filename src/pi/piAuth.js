/**
 * Pi Authentication (Stabilization Version)
 * ------------------------------------------
 * Minimal, deterministic, defensive.
 *
 * - No incomplete payment handlers
 * - No side effects
 * - No external calls
 * - No race conditions
 */

let authInProgress = false;

export async function authenticateWithPi() {
  /* ==============================
     1️⃣ Environment Safety
  ============================== */
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error("Pi SDK not available");
  }

  /* ==============================
     2️⃣ Prevent double execution
  ============================== */
  if (authInProgress) {
    throw new Error("Pi authentication already in progress");
  }

  authInProgress = true;

  try {
    const scopes = ["username", "payments"];

    /* ==============================
       3️⃣ Minimal authenticate call
    ============================== */
    const auth = await window.Pi.authenticate(scopes);

    if (!auth || !auth.user || !auth.user.uid) {
      throw new Error("Invalid Pi authentication response");
    }

    return {
      uid: auth.user.uid,
      username: auth.user.username,
      accessToken: auth.accessToken,
    };
  } finally {
    authInProgress = false;
  }
}



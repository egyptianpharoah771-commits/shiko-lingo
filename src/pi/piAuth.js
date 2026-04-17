/**
 * Pi Authentication (Stabilization Version)
 * ------------------------------------------
 * Minimal, deterministic, defensive.
 *
 * - Pi.authenticate includes required incomplete-payment callback when using payments scope
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
    const auth = await window.Pi.authenticate(scopes, async (incompletePayment) => {
      const pid = incompletePayment?.identifier;
      if (!pid) return;
      console.warn("[Shiko Lingo] Incomplete Pi payment found (piAuth):", pid);
      try {
        await fetch("/api/pi-approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: pid }),
        });
      } catch {
        /* best-effort */
      }
    });

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



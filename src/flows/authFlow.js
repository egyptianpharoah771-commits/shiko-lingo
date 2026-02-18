/**
 * Auth Flow
 * ----------
 * Orchestrates Pi authentication
 * - Ensures Pi SDK initialization (only in Pi environment)
 * - Authenticates with Pi SDK
 * - Checks subscription from backend
 * - Stores unified Pi user contract
 */

import { initPiSDK } from "../lib/initPi";
import { authenticateWithPi } from "../pi/piAuth";
import {
  setPiUser,
  getCurrentPiUser,
} from "../adapters/piUserAdapter";

/**
 * Starts Pi authentication flow (Hybrid Safe)
 */
export async function startPiLogin() {
  try {
    // 🚫 If not inside Pi Browser → skip Pi auth completely
    if (typeof window === "undefined" || !window.Pi) {
      console.log("Not in Pi environment — skipping Pi authentication.");

      return setPiUser({
        uid: null,
        username: null,
        isAuthenticated: false,
        isSubscribed: false,
      });
    }

    // Prevent double login
    const existingUser = getCurrentPiUser();
    if (existingUser?.isAuthenticated) {
      return existingUser;
    }

    /* ==============================
       1️⃣ Ensure Pi SDK initialized
    ============================== */
    initPiSDK();

    /* ==============================
       2️⃣ Authenticate via Pi SDK
    ============================== */
    const piUser = await authenticateWithPi();

    if (!piUser?.uid) {
      throw new Error("Pi authentication failed");
    }

    const uid = piUser.uid;

    /* ==============================
       3️⃣ Check subscription from backend
    ============================== */
    let isSubscribed = false;

    try {
      const res = await fetch(
        `/api/check-subscription?uid=${uid}`
      );

      if (res.ok) {
        const data = await res.json();
        isSubscribed = data.active === true;
      }
    } catch (err) {
      console.error("Subscription check failed:", err);
    }

    /* ==============================
       4️⃣ Store unified user contract
    ============================== */
    return setPiUser({
      uid,
      username: piUser.username,
      isAuthenticated: true,
      isSubscribed,
    });

  } catch (err) {
    console.error("Pi login flow error:", err);

    return setPiUser({
      uid: null,
      username: null,
      isAuthenticated: false,
      isSubscribed: false,
    });
  }
}

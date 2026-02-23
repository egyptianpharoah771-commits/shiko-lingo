/**
 * Auth Flow (Stabilization Version)
 * ----------------------------------
 * Pi Identity Layer ONLY
 *
 * - No subscription checks
 * - No backend calls
 * - No Supabase sync
 * - No auto initialization
 *
 * This file is responsible ONLY for:
 * Authenticating with Pi SDK
 * Storing minimal Pi identity contract
 */

import { authenticateWithPi } from "../pi/piAuth";
import {
  setPiUser,
  getCurrentPiUser,
} from "../adapters/piUserAdapter";

/**
 * Starts Pi authentication flow (Manual Only)
 * Must be triggered by explicit user action.
 */
export async function startPiLogin() {
  try {
    /* ==============================
       1️⃣ Ensure we are inside Pi Browser
    ============================== */
    if (typeof window === "undefined" || !window.Pi) {
      console.log("Not inside Pi Browser — Pi login skipped.");

      return setPiUser({
        uid: null,
        username: null,
        isAuthenticated: false,
      });
    }

    /* ==============================
       2️⃣ Prevent double authentication
    ============================== */
    const existingUser = getCurrentPiUser();
    if (existingUser?.isAuthenticated) {
      return existingUser;
    }

    /* ==============================
       3️⃣ Authenticate via Pi SDK
    ============================== */
    const piUser = await authenticateWithPi();

    if (!piUser?.uid) {
      throw new Error("Pi authentication failed");
    }

    /* ==============================
       4️⃣ Store minimal Pi identity contract
    ============================== */
    return setPiUser({
      uid: piUser.uid,
      username: piUser.username,
      isAuthenticated: true,
    });

  } catch (err) {
    console.error("Pi login flow error:", err);

    return setPiUser({
      uid: null,
      username: null,
      isAuthenticated: false,
    });
  }
}
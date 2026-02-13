/**
 * Auth Flow
 * Orchestrates Pi authentication without leaking SDK logic to UI
 */

import { authenticateWithPi } from "../pi/piAuth";
import {
  setPiUser,
  getCurrentPiUser,
} from "../adapters/piUserAdapter";
import {
  migrateGuestProgressToPiUser,
} from "../adapters/progressAdapter";

/**
 * Starts Pi authentication flow
 * - Authenticates with Pi SDK
 * - Stores Pi user contract
 * - Checks subscription from backend
 * - Migrates guest progress
 */
export async function startPiLogin() {
  // Prevent double login
  const existingUser = getCurrentPiUser();
  if (existingUser?.isAuthenticated) {
    return existingUser;
  }

  // 1️⃣ Authenticate via Pi SDK
  const piUser = await authenticateWithPi();
  // piUser = { uid, username }

  const uid = piUser.uid;

  // 2️⃣ Check subscription from backend
  let isSubscribed = false;

  try {
    const res = await fetch(`/api/check-subscription?uid=${uid}`);
    if (res.ok) {
      const data = await res.json();
      isSubscribed = data.active;
    }
  } catch (err) {
    console.error("Subscription check failed:", err);
  }

  // 3️⃣ Save Pi user contract (with subscription state)
  const storedUser = setPiUser({
    uid,
    username: piUser.username,
    isSubscribed,
  });

  // 4️⃣ Migrate guest progress (if any)
  migrateGuestProgressToPiUser(storedUser.uid);

  return storedUser;
}

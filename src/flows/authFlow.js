/**
 * Auth Flow
 * ----------
 * Orchestrates Pi authentication
 * - Authenticates with Pi SDK
 * - Checks subscription from backend
 * - Stores unified Pi user contract
 */

import { authenticateWithPi } from "../pi/piAuth";
import {
  setPiUser,
  getCurrentPiUser,
} from "../adapters/piUserAdapter";

/**
 * Starts Pi authentication flow
 */
export async function startPiLogin() {
  // Prevent double login
  const existingUser = getCurrentPiUser();
  if (existingUser?.isAuthenticated) {
    return existingUser;
  }

  // 1️⃣ Authenticate via Pi SDK
  const piUser = await authenticateWithPi();
  const uid = piUser.uid;

  // 2️⃣ Check subscription from backend
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
    console.error(
      "Subscription check failed:",
      err
    );
  }

  // 3️⃣ Store unified user contract
  const storedUser = setPiUser({
    uid,
    username: piUser.username,
    isSubscribed,
  });

  return storedUser;
}

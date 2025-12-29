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
 * - Migrates guest progress
 */
export async function startPiLogin() {
  // Prevent double login
  const existingUser = getCurrentPiUser();
  if (existingUser?.isAuthenticated) {
    return existingUser;
  }

  // 1. Authenticate via Pi SDK
  const piUser = await authenticateWithPi();

  // 2. Save Pi user contract
  const storedUser = setPiUser(piUser);

  // 3. Migrate guest progress (if any)
  migrateGuestProgressToPiUser(storedUser.pi_uid);

  return storedUser;
}

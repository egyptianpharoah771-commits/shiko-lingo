/**
 * Pi User Adapter
 * ----------------
 * Domain adapter responsible for Pi user identity.
 *
 * Principles:
 * - Does NOT talk to Pi SDK
 * - Does NOT know about UI
 * - Source of truth = stored Pi User Contract
 * - Storage layer = replaceable (LocalStorage for now)
 */

const STORAGE_KEY = "pi_user";

/**
 * Persist authenticated Pi user
 * ✅ متوافق مع Pi SDK (user.uid)
 */
export function setPiUser({ uid, username }) {
  if (!uid || typeof uid !== "string") {
    throw new Error("Invalid uid");
  }

  if (!username || typeof username !== "string") {
    throw new Error("Invalid username");
  }

  const userContract = {
    uid,
    username,
    isAuthenticated: true,
    authenticatedAt: Date.now(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(userContract)
  );

  return userContract;
}

/**
 * Retrieve current Pi user contract
 */
export function getCurrentPiUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Check authentication status
 */
export function isPiUserAuthenticated() {
  return Boolean(getCurrentPiUser()?.isAuthenticated);
}

/**
 * Clear Pi user contract (logout)
 */
export function clearPiUser() {
  localStorage.removeItem(STORAGE_KEY);
}

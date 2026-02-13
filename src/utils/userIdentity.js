/**
 * User Identity Utility
 * ---------------------
 * Resolves a stable userId across the app
 * Priority:
 * 1. Pi User (pi_uid)
 * 2. Guest ID (stored in localStorage)
 */

const GUEST_KEY = "shiko_guest_id";
const PI_USER_KEY = "shiko_pi_user";

/* ===== Guest ID ===== */
function generateGuestId() {
  return (
    "guest_" +
    Math.random().toString(36).substring(2, 10) +
    "_" +
    Date.now()
  );
}

export function getGuestId() {
  let guestId = localStorage.getItem(GUEST_KEY);

  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(GUEST_KEY, guestId);
  }

  return guestId;
}

/* ===== Pi User ===== */
export function setPiUser(user) {
  if (!user || !user.uid) return;
  localStorage.setItem(PI_USER_KEY, JSON.stringify(user));
}

export function getPiUser() {
  try {
    const raw = localStorage.getItem(PI_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ===== Unified User ID ===== */
export function getUserId() {
  const piUser = getPiUser();

  if (piUser && piUser.uid) {
    return `pi_${piUser.uid}`;
  }

  return getGuestId();
}

/* ===== Helpers ===== */
export function isPiUser() {
  return !!getPiUser();
}

export function clearUserIdentity() {
  localStorage.removeItem(GUEST_KEY);
  localStorage.removeItem(PI_USER_KEY);
}

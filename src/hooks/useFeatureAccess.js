/**
 * Feature Access Hook
 * -------------------
 * Centralized access logic
 * - Uses unified User Identity
 * - Handles FREE / PRO access
 * - Ready for Pi subscriptions later
 */

import {
  getUserId,
  getPiUser,
} from "../utils/userIdentity";

/**
 * Package resolution (TEMP – Phase 2)
 * Later: replace with real Pi subscription
 */
function getUserPackage() {
  const stored =
    localStorage.getItem("user_package");

  return stored === "PRO" ? "PRO" : "FREE";
}

export function useFeatureAccess({ skill, level }) {
  const piUser = getPiUser();
  const userId = getUserId();
  const userPackage = getUserPackage();

  /* ======================
     1️⃣ GUEST USER
  ====================== */
  if (!piUser) {
    const allowed = level === "A1";

    return {
      canAccess: allowed,
      requiresUpgrade: !allowed,

      // 🔑 Identity for backend / AI
      userId,
      packageName: "FREE",
    };
  }

  /* ======================
     2️⃣ PRO USER
  ====================== */
  if (userPackage === "PRO") {
    return {
      canAccess: true,
      requiresUpgrade: false,

      // 🔑 Identity for backend / AI
      userId,
      packageName: "PRO",
    };
  }

  /* ======================
     3️⃣ FREE Pi USER
  ====================== */
  const allowed = level === "A1";

  return {
    canAccess: allowed,
    requiresUpgrade: !allowed,

    // 🔑 Identity for backend / AI
    userId,
    packageName: "FREE",
  };
}

/**
 * Feature Access Hook
 * -------------------
 * Centralized access logic
 * - Uses unified User Identity
 * - Handles FREE / SUBSCRIBED access
 * - AI Feedback is an enhancement, not a paid feature
 */

import {
  getUserId,
  getPiUser,
} from "../utils/userIdentity";

/**
 * TEMP package resolution
 * Later: replaced by real Pi subscription
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

      // 🧠 AI Feedback is tied to lesson access
      canGetAIFeedback: allowed,

      requiresUpgrade: !allowed,
      userId,
      packageName: "FREE",
    };
  }

  /* ======================
     2️⃣ SUBSCRIBED USER
  ====================== */
  if (userPackage === "PRO") {
    return {
      canAccess: true,
      canGetAIFeedback: true,
      requiresUpgrade: false,

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
    canGetAIFeedback: allowed,
    requiresUpgrade: !allowed,

    userId,
    packageName: "FREE",
  };
}

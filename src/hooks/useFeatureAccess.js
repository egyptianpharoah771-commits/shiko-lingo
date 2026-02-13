/**
 * Feature Access Hook
 * -------------------
 * Centralized subscription-based access logic
 * - No free levels
 * - All content requires active PRO subscription
 */

import {
  getUserId,
  getPiUser,
} from "../utils/userIdentity";

/**
 * Temporary package resolution
 * Later replaced with real Pi subscription validation
 */
function getUserPackage() {
  return localStorage.getItem("user_package") === "PRO"
    ? "PRO"
    : "FREE";
}

export function useFeatureAccess() {
  const piUser = getPiUser();
  const userId = getUserId();
  const userPackage = getUserPackage();

  const isAuthenticated = !!piUser;
  const isPro = isAuthenticated && userPackage === "PRO";

  return {
    // 🔐 Full access only for PRO users
    canAccess: isPro,

    // 🤖 AI also requires PRO
    canGetAIFeedback: isPro,

    requiresUpgrade: !isPro,

    isAuthenticated,
    userId,
    packageName: isPro ? "PRO" : "FREE",
  };
}

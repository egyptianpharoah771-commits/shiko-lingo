/**
 * Feature Access Hook
 * -------------------
 * Centralized subscription-based access logic
 * - No free levels
 * - All content requires active PRO subscription
 * - Subscription state comes from backend (not localStorage)
 */

import {
  getUserId,
  getPiUser,
} from "../utils/userIdentity";

export function useFeatureAccess() {
  const piUser = getPiUser();
  const userId = getUserId();

  const isAuthenticated = !!piUser;
  const isPro = isAuthenticated && piUser?.isSubscribed === true;

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

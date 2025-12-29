/**
 * Subscription Adapter
 * --------------------
 * Domain adapter responsible for user subscription state.
 *
 * Principles:
 * - Does NOT talk to Pi SDK
 * - Does NOT know about UI
 * - Source of truth = stored Subscription Contract
 * - Storage layer = replaceable (LocalStorage for now)
 */

const STORAGE_PREFIX = "subscription_";

/**
 * Subscription Plans (Domain-level)
 */
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  MONTHLY: "monthly",
  LIFETIME: "lifetime",
};

/**
 * Create or update user subscription
 */
export function setUserSubscription({
  pi_uid,
  plan,
  expiresAt = null,
}) {
  if (!pi_uid || typeof pi_uid !== "string") {
    throw new Error("Invalid pi_uid");
  }

  if (!Object.values(SUBSCRIPTION_PLANS).includes(plan)) {
    throw new Error("Invalid subscription plan");
  }

  const subscriptionContract = {
    pi_uid,
    plan,
    isActive: plan !== SUBSCRIPTION_PLANS.FREE,
    startedAt: Date.now(),
    expiresAt, // null for lifetime
  };

  localStorage.setItem(
    STORAGE_PREFIX + pi_uid,
    JSON.stringify(subscriptionContract)
  );

  return subscriptionContract;
}

/**
 * Get current user subscription
 */
export function getUserSubscription(pi_uid) {
  if (!pi_uid) return null;

  const raw = localStorage.getItem(STORAGE_PREFIX + pi_uid);
  if (!raw) {
    return {
      pi_uid,
      plan: SUBSCRIPTION_PLANS.FREE,
      isActive: false,
      startedAt: null,
      expiresAt: null,
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Check if subscription is currently active
 */
export function isSubscriptionActive(pi_uid) {
  const sub = getUserSubscription(pi_uid);
  if (!sub || !sub.isActive) return false;

  if (sub.expiresAt === null) return true; // lifetime

  return Date.now() < sub.expiresAt;
}

/**
 * Feature gating helper
 * Central place to control Free vs Premium access
 */
export function canAccessFeature({
  pi_uid,
  skill,
  level,
}) {
  // Free users: A1 only
  if (!isSubscriptionActive(pi_uid)) {
    return level === "A1";
  }

  // Premium users: everything
  return true;
}

/**
 * Clear subscription (for testing / reset)
 */
export function clearUserSubscription(pi_uid) {
  if (!pi_uid) return;
  localStorage.removeItem(STORAGE_PREFIX + pi_uid);
}

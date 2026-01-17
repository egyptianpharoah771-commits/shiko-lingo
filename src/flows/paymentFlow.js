/**
 * Payment Flow
 * ------------
 * Orchestrates Pi payments and subscription activation
 * Single paid subscription (3 Pi)
 * AI Feedback included as enhancement
 */

import { createPiPayment } from "../pi/piPayments";
import {
  setUserSubscription,
  SUBSCRIPTION_PLANS,
} from "../adapters/subscriptionAdapter";

/**
 * Start subscription payment via Pi
 */
export async function startSubscriptionPayment({
  uid,   // Unified Pi User ID
  plan,
}) {
  let amount = 0;
  let expiresAt = null;

  // ✅ Single paid plan only (MONTHLY)
  if (plan === SUBSCRIPTION_PLANS.MONTHLY) {
    amount = 3; // ✅ Official price
    expiresAt =
      Date.now() + 30 * 24 * 60 * 60 * 1000;
  } else {
    throw new Error("Invalid subscription plan");
  }

  // 🔑 Trigger Pi Payment
  createPiPayment({
    amount,
    memo: "Shiko Lingo - Subscription",
  });

  // ✅ Local activation (until backend verification exists)
  return setUserSubscription({
    pi_uid: uid,
    plan,
    expiresAt,
  });
}

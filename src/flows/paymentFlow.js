/**
 * Payment Flow
 * ------------
 * Orchestrates Pi payments and subscription activation
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
  uid,   // ✅ توحيد الاسم مع PiUser (uid)
  plan,
}) {
  let amount = 0;
  let expiresAt = null;

  if (plan === SUBSCRIPTION_PLANS.MONTHLY) {
    amount = 1; // 1 Pi (Testnet / Example)
    expiresAt =
      Date.now() + 30 * 24 * 60 * 60 * 1000;
  }

  if (plan === SUBSCRIPTION_PLANS.LIFETIME) {
    amount = 10; // Example
    expiresAt = null;
  }

  if (!amount) {
    throw new Error("Invalid subscription plan");
  }

  // 🔑 Trigger Pi Payment
  createPiPayment({
    amount,
    memo: `Shiko Lingo - ${plan} subscription`,
  });

  // ✅ Local activation (until backend subscription verification exists)
  return setUserSubscription({
    pi_uid: uid,
    plan,
    expiresAt,
  });
}

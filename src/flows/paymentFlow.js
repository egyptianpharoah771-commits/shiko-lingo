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

export async function startSubscriptionPayment({
  pi_uid,
  plan,
}) {
  let amount = 0;
  let expiresAt = null;

  if (plan === SUBSCRIPTION_PLANS.MONTHLY) {
    amount = 1; // مثال: 1 Pi
    expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  }

  if (plan === SUBSCRIPTION_PLANS.LIFETIME) {
    amount = 10; // مثال
    expiresAt = null;
  }

  if (!amount) {
    throw new Error("Invalid subscription plan");
  }

  await createPiPayment({
    amount,
    memo: `Shiko Lingo - ${plan} subscription`,
    metadata: { plan },
  });

  // Temporary success (until backend exists)
  return setUserSubscription({
    pi_uid,
    plan,
    expiresAt,
  });
}

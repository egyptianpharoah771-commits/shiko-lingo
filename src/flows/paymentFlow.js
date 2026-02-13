import { createPiPayment } from "../pi/piPayments";
import { SUBSCRIPTION_PLANS } from "../adapters/subscriptionAdapter";

/**
 * Start subscription payment via Pi
 */
export async function startSubscriptionPayment({
  uid,
  plan,
}) {
  let amount = 0;

  if (plan === SUBSCRIPTION_PLANS.MONTHLY) {
    amount = 3;
  } else {
    throw new Error("Invalid subscription plan");
  }

  return new Promise((resolve, reject) => {

    createPiPayment({
      amount,
      memo: "Shiko Lingo - Subscription",

      onApprove: async (paymentId) => {
        try {
          const res = await fetch("/api/pi/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });

          if (!res.ok) throw new Error("Approve failed");
        } catch (err) {
          reject(err);
        }
      },

      onComplete: async (paymentId, txid) => {
        try {
          const res = await fetch("/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId,
              txid,
              uid,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error("Complete failed");
          }

          resolve(true);
        } catch (err) {
          reject(err);
        }
      },

      onCancel: () => {
        reject(new Error("Payment cancelled"));
      },

      onError: (err) => {
        reject(err);
      },
    });

  });
}

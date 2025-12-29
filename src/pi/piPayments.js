/**
 * Pi Payments Integration
 * -----------------------
 * Handles Pi SDK payment flow only.
 *
 * Principles:
 * - Talks to Pi SDK directly
 * - Does NOT touch LocalStorage
 * - Does NOT know about UI or Adapters
 * - Returns clean results to flows
 */

export async function createPiPayment({
  amount,
  memo,
  metadata = {},
}) {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid payment amount");
  }

  try {
    const payment = await window.Pi.createPayment(
      {
        amount,
        memo,
        metadata,
      },
      {
        onReadyForServerApproval(paymentId) {
          // Step 1: Server approval (later)
          console.log("Ready for approval:", paymentId);
        },

        onReadyForServerCompletion(paymentId, txid) {
          // Step 2: Server completion (later)
          console.log("Ready for completion:", paymentId, txid);
        },

        onCancel(paymentId) {
          console.warn("Payment cancelled:", paymentId);
        },

        onError(error, payment) {
          console.error("Payment error:", error, payment);
        },
      }
    );

    return payment;
  } catch (err) {
    console.error("Pi payment failed", err);
    throw err;
  }
}

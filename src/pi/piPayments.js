/**
 * Pi Payments Integration
 * -----------------------
 * Handles Pi SDK payment flow only.
 */

export function createPiPayment({ amount, memo }) {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid payment amount");
  }

  // ❗ createPayment is NOT async
  window.Pi.createPayment(
    {
      amount,
      memo,
    },
    {
      // ✅ STEP 1 — Server Approval
      async onReadyForServerApproval(paymentId) {
        console.log("✅ Ready for approval:", paymentId);

        await fetch("/api/pi?action=approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
      },

      // ✅ STEP 2 — Server Completion
      async onReadyForServerCompletion(paymentId, txid) {
        console.log(
          "✅ Ready for completion:",
          paymentId,
          txid
        );

        await fetch("/api/pi?action=complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
      },

      onCancel(paymentId) {
        console.warn("❌ Payment cancelled:", paymentId);
      },

      onError(error, payment) {
        console.error(
          "❌ Pi payment error:",
          error,
          payment
        );
      },
    }
  );
}

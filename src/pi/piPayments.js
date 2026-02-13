/**
 * Pi Payments Integration
 * -----------------------
 * Handles Pi SDK payment flow only.
 * Checklist-compliant & Production-ready
 */

export function createPiPayment({ amount, memo }) {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid payment amount");
  }

  try {
    // ❗ Pi.createPayment is NOT async by design
    window.Pi.createPayment(
      {
        amount,
        memo,
      },
      {
        /* =========================
           STEP 1 — Server Approval
        ========================= */
        onReadyForServerApproval: async (paymentId) => {
          console.log("✅ Ready for approval:", paymentId);

          const res = await fetch(
            "/api/pi?action=approve",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            }
          );

          if (!res.ok) {
            const err = await res.text();
            throw new Error(
              "Server approval failed: " + err
            );
          }
        },

        /* =========================
           STEP 2 — Server Completion
        ========================= */
        onReadyForServerCompletion: async (
          paymentId,
          txid
        ) => {
          console.log(
            "✅ Ready for completion:",
            paymentId,
            txid
          );

          const res = await fetch(
            "/api/pi?action=complete",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId, txid }),
            }
          );

          if (!res.ok) {
            const err = await res.text();
            throw new Error(
              "Server completion failed: " + err
            );
          }

          console.log(
            "🏁 Pi payment flow completed successfully"
          );
        },

        /* =========================
           User Actions / Errors
        ========================= */
        onCancel: (paymentId) => {
          console.warn(
            "❌ Payment cancelled:",
            paymentId
          );
        },

        onError: (error, payment) => {
          console.error(
            "❌ Pi payment error:",
            error,
            payment
          );
        },
      }
    );
  } catch (err) {
    console.error("❌ createPiPayment failed:", err);
    throw err;
  }
}

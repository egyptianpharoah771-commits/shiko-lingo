export async function createPiPayment({ amount, memo, uid }) {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid payment amount");
  }

  if (!uid) {
    throw new Error("User not authenticated");
  }

  return new Promise((resolve, reject) => {
    window.Pi.createPayment(
      {
        amount,
        memo,
        metadata: { plan: "MONTHLY" },
      },
      {
        /* ===== Approval ===== */
        onReadyForServerApproval: async (paymentId) => {
          try {
            const res = await fetch("/api/pi/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });

            if (!res.ok) {
              const err = await res.text();
              reject(new Error("Approve failed: " + err));
            }
          } catch (err) {
            reject(err);
          }
        },

        /* ===== Completion ===== */
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            const res = await fetch("/api/pi/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid, uid }),
            });

            if (!res.ok) {
              const err = await res.text();
              reject(new Error("Complete failed: " + err));
              return;
            }

            const data = await res.json();

            if (!data.success) {
              reject(new Error("Subscription activation failed"));
              return;
            }

            resolve(data);
          } catch (err) {
            reject(err);
          }
        },

        onCancel: () => {
          reject(new Error("Payment cancelled"));
        },

        onError: (err) => {
          reject(err || new Error("Payment failed"));
        },
      }
    );
  });
}
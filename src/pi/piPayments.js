export async function createPiPayment({ amount, memo }) {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid payment amount");
  }

  // 1️⃣ Authenticate first
  const auth = await window.Pi.authenticate(
    ["username", "payments"],
    () => {}
  );

  const uid = auth?.user?.uid;

  if (!uid) {
    throw new Error("Authentication failed");
  }

  localStorage.setItem("pi_uid", uid);

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
          const res = await fetch("/api/pi/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });

          if (!res.ok) {
            const err = await res.text();
            reject(new Error("Approve failed: " + err));
          }
        },

        /* ===== Completion ===== */
        onReadyForServerCompletion: async (paymentId, txid) => {
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
        },

        onCancel: () => {
          reject(new Error("Payment cancelled"));
        },

        onError: (err) => {
          reject(err);
        },
      }
    );
  });
}

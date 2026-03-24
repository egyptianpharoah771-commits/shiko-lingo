/* =========================
   💰 Pi Payment (FINAL SAFE VERSION)
========================= */
export async function createPiPayment({ amount, memo, uid }) {
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error("Pi SDK not available");
  }

  if (!amount || typeof amount !== "number") {
    throw new Error("Invalid payment amount");
  }

  if (!uid) {
    throw new Error("User not authenticated");
  }

  let settled = false;

  return new Promise((resolve, reject) => {
    const safeResolve = (data) => {
      if (settled) return;
      settled = true;

      // 🔥 Backend already activated subscription
      window.location.href = "/dashboard";

      resolve(data);
    };

    const safeReject = (error) => {
      if (settled) return;
      settled = true;
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    try {
      window.Pi.createPayment(
        {
          amount,
          memo,
          metadata: {
            plan: "MONTHLY",
          },
        },
        {
          /* =========================
             Server Approval
          ========================= */
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch("/api/pi/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId }),
              });

              if (!res.ok) {
                const errText = await res.text();
                return safeReject(
                  new Error("Approve failed: " + errText)
                );
              }
            } catch (err) {
              return safeReject(err);
            }
          },

          /* =========================
             Server Completion
          ========================= */
          onReadyForServerCompletion: async (paymentId, txid) => {
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

              if (!res.ok) {
                const errText = await res.text();
                return safeReject(
                  new Error("Complete failed: " + errText)
                );
              }

              const data = await res.json();

              if (!data.success) {
                return safeReject(
                  new Error("Subscription activation failed")
                );
              }

              // ✅ نجاح حقيقي
              safeResolve(data);
            } catch (err) {
              safeReject(err);
            }
          },

          onCancel: () => {
            safeReject(new Error("Payment cancelled"));
          },

          onError: (err) => {
            safeReject(err || new Error("Payment failed"));
          },
        }
      );
    } catch (err) {
      safeReject(err);
    }
  });
}
/* =========================
   💰 Pi Payment (FINAL SAFE VERSION)
========================= */

function apiOrigin() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

async function postApproveWithRetry(paymentId) {
  const url = `${apiOrigin()}/api/pi/approve`;
  let lastNetworkErr = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });

      const raw = await res.text();
      let parsed = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        return {
          ok: false,
          err: new Error(
            "Approve failed: server did not return JSON (check /api routes). First bytes: " +
              raw.slice(0, 120)
          ),
        };
      }

      const retryable =
        res.status === 502 || res.status === 503 || res.status === 504;

      if ((!res.ok || !parsed?.success) && retryable && attempt === 0) {
        await new Promise((r) => setTimeout(r, 450));
        continue;
      }

      if (!res.ok || !parsed?.success) {
        return {
          ok: false,
          err: new Error(
            "Approve failed: " +
              (parsed?.message || parsed?.error || raw.slice(0, 300))
          ),
        };
      }

      return { ok: true };
    } catch (e) {
      lastNetworkErr = e;
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 450));
        continue;
      }
    }
  }

  return {
    ok: false,
    err:
      lastNetworkErr ||
      new Error("Approve failed: could not reach your server (/api/pi/approve)."),
  };
}

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
              const result = await postApproveWithRetry(paymentId);
              if (!result.ok) {
                return safeReject(result.err);
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
              const res = await fetch(`${apiOrigin()}/api/pi/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  uid,
                }),
              });

              const raw = await res.text();
              let data = null;
              try {
                data = raw ? JSON.parse(raw) : null;
              } catch {
                return safeReject(
                  new Error(
                    "Complete failed: non-JSON response. First bytes: " +
                      raw.slice(0, 200)
                  )
                );
              }

              if (!res.ok || !data?.success) {
                return safeReject(
                  new Error(
                    "Complete failed: " +
                      (data?.message || data?.error || raw.slice(0, 300))
                  )
                );
              }

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



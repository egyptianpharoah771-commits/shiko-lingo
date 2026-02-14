import { useState } from "react";

function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (!window.Pi) {
      setError("Please open this app inside Pi Browser");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Authenticate
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        () => {}
      );

      const uid = auth?.user?.uid;

      if (!uid) {
        throw new Error("Authentication failed");
      }

      localStorage.setItem("pi_uid", uid);

      // 2️⃣ Wrap Pi.createPayment in Promise (important)
      await new Promise((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: 3,
            memo: "Shiko Lingo Monthly Subscription",
            metadata: { plan: "MONTHLY" },
          },
          {
            /* ===== Server Approval ===== */
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

            /* ===== Server Completion ===== */
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

      // 3️⃣ Redirect only AFTER full success
      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <h2>🔒 Subscription Required</h2>

      <p style={{ marginTop: "12px", color: "#555" }}>
        Access to Shiko Lingo requires an active PRO subscription.
      </p>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{
          marginTop: "25px",
          padding: "12px 20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing…" : "Subscribe Now"}
      </button>

      {error && (
        <p style={{ marginTop: "15px", color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Upgrade;

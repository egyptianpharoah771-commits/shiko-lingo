import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Strict Pi Environment Check
 */
function isInsideRealPi() {
  if (typeof window === "undefined") return false;
  if (!window.Pi) return false;
  if (window.self === window.top) return false;
  return true;
}

function Upgrade() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (loading) return;

    setError("");

    if (!isInsideRealPi()) {
      setError(
        "Subscriptions are only available inside the official Pi Browser."
      );
      return;
    }

    if (!user?.id) {
      setError("Authentication required before subscription.");
      return;
    }

    setLoading(true);

    try {
      const orderId = `order_${Date.now()}`;

      console.log("💳 Creating Pi payment:", orderId);

      window.Pi.createPayment(
        {
          amount: 3,
          memo: "Shiko Lingo Monthly Subscription",
          metadata: {
            orderId,
            plan: "MONTHLY",
          },
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch("/api/pi/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId }),
              });

              if (!res.ok) {
                throw new Error("Approval request failed");
              }
            } catch (err) {
              console.error("Approve error:", err);
              setError("Payment approval failed.");
              setLoading(false);
            }
          },

          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch("/api/pi/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  uid: user.id,
                }),
              });

              if (!res.ok) {
                throw new Error("Completion request failed");
              }

              // ننتظر شوية علشان السيرفر يحدّث الاشتراك
              setTimeout(() => {
                window.location.href = "/dashboard";
              }, 1000);

            } catch (err) {
              console.error("Completion error:", err);
              setError("Payment completion failed.");
              setLoading(false);
            }
          },

          onCancel: () => {
            setError("Payment was cancelled.");
            setLoading(false);
          },

          onError: (err) => {
            console.error("Payment error:", err);
            setError("Payment failed. Please try again.");
            setLoading(false);
          },
        }
      );
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "Subscription failed.");
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
          cursor: loading ? "not-allowed" : "pointer",
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
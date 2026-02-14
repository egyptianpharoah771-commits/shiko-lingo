import { useState } from "react";

function Upgrade() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (!window.Pi) {
      setError("Please open this app inside Pi Browser");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        () => {}
      );

      const uid = auth?.user?.uid;

      if (!uid) {
        throw new Error("Authentication failed");
      }

      localStorage.setItem("pi_uid", uid);

      window.Pi.createPayment(
        {
          amount: 3,
          memo: "Shiko Lingo Monthly Subscription",
          metadata: { type: "monthly_subscription" },
        },
        {
          onReadyForServerApproval: (paymentId) => {
            return fetch("/api/pi/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          },

          onReadyForServerCompletion: (paymentId, txid) => {
            return fetch("/api/pi/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid, uid }),
            }).then(() => {
              window.location.href = "/dashboard";
            });
          },

          onCancel: () => {
            setError("Payment cancelled");
            setLoading(false);
          },

          onError: () => {
            setError("Payment failed");
            setLoading(false);
          },
        }
      );
    } catch (err) {
      setError("Authentication failed");
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

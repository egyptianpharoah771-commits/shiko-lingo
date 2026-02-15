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
      /* ==============================
         1️⃣ Authenticate
      ============================== */
      console.log("🔐 Starting Pi authentication...");

      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        () => {}
      );

      const uid = auth?.user?.uid;

      if (!uid) {
        throw new Error("Authentication failed");
      }

      console.log("✅ Authenticated UID:", uid);
      localStorage.setItem("pi_uid", uid);

      /* ==============================
         2️⃣ Create Payment (Official Flow)
      ============================== */
      const orderId = `order_${Date.now()}`;

      console.log("💳 Creating payment with orderId:", orderId);

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
          /* ===== Server Approval ===== */
          onReadyForServerApproval: async (paymentId) => {
            console.log("🔥 APPROVAL CALLBACK FIRED:", paymentId);

            try {
              const res = await fetch("/api/pi/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId }),
              });

              const data = await res.json();
              console.log("✅ Approve response:", data);
            } catch (err) {
              console.error("❌ Approve request failed:", err);
            }
          },

          /* ===== Server Completion ===== */
          onReadyForServerCompletion: async (paymentId, txid) => {
            console.log("🔥 COMPLETION CALLBACK FIRED:", paymentId, txid);

            try {
              await fetch("/api/pi/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  uid,
                }),
              });

              console.log("✅ Complete request sent");
            } catch (err) {
              console.error("❌ Complete request failed:", err);
            }

            // Redirect after lifecycle reached completion stage
            window.location.href = "/dashboard";
          },

          onCancel: (paymentId) => {
            console.warn("⚠️ Payment cancelled:", paymentId);
            setError("Payment was cancelled");
            setLoading(false);
          },

          onError: (err) => {
            console.error("❌ Payment error:", err);
            setError("Payment failed. Please try again.");
            setLoading(false);
          },
        }
      );

    } catch (err) {
      console.error("❌ Subscription error:", err);
      setError(err.message || "Payment failed");
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

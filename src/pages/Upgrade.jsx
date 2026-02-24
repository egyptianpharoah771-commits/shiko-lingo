import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPiPayment } from "../pi/piPayments";

function isInsideRealPi() {
  if (typeof window === "undefined") return false;
  if (!window.Pi) return false;
  if (window.self === window.top) return false;
  return true;
}

function Upgrade() {
  const { user, loginWithPi } = useAuth();
  const navigate = useNavigate();

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

    if (!user?.pi_uid) {
      setError("Authentication required before subscription.");
      return;
    }

    setLoading(true);

    try {
      await createPiPayment({
        amount: 3,
        memo: "Shiko Lingo Monthly Subscription",
        uid: user.pi_uid, // 🔒 Use Pi UID only
      });

      // ✅ Let SubscriptionContext re-check naturally
      navigate("/dashboard");
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePiLogin = async () => {
    await loginWithPi();
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

      {!user && (
        <>
          <p>Please authenticate with Pi first.</p>
          <button
            onClick={handlePiLogin}
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              fontWeight: "bold",
            }}
          >
            🔐 Login with Pi
          </button>
        </>
      )}

      {user && (
        <>
          <p style={{ marginTop: "12px", color: "#555" }}>
            Access requires an active PRO subscription.
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
        </>
      )}

      {error && (
        <p style={{ marginTop: "15px", color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Upgrade;
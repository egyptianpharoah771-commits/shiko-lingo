import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
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
  const { isActive } = useSubscription();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uid = user?.id || null;

  const handleSubscribe = async () => {
    if (loading) return;
    setError("");

    if (!isInsideRealPi()) {
      setError("Subscriptions are only available inside the official Pi Browser.");
      return;
    }

    let currentUser = user;

    try {
      setLoading(true);

      if (!currentUser?.id) {
        currentUser = await loginWithPi();
      }

      if (!currentUser?.id) {
        throw new Error("Authentication failed.");
      }

      await createPiPayment({
        amount: 3,
        memo: "Shiko Lingo Monthly Subscription",
        uid: currentUser.id,
      });

      navigate("/dashboard");

    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || "Subscription failed.");
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
      <h2>🔒 Subscription</h2>

      {!uid && (
        <>
          <p>Please authenticate with Pi first.</p>
          <button
            onClick={() => loginWithPi()}
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

      {uid && isActive && (
        <>
          <h3 style={{ color: "green", marginTop: "20px" }}>
            ✅ Welcome back — Your PRO subscription is active
          </h3>
          <button
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              fontWeight: "bold",
            }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </>
      )}

      {uid && !isActive && (
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



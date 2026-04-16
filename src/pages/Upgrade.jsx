import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { createPiPayment } from "../pi/piPayments";
import { isPiAppContext } from "../lib/initPi";

function Upgrade() {
  const { user, loginWithPi } = useAuth();
  const { isActive } = useSubscription();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [piAuthLoading, setPiAuthLoading] = useState(false);

  const uid = user?.id || null;

  const handlePiLogin = async () => {
    if (piAuthLoading) return;
    setError("");
    try {
      setPiAuthLoading(true);
      await loginWithPi();
    } catch (err) {
      setError(err?.message || "Pi login failed.");
    } finally {
      setPiAuthLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (loading) return;
    setError("");

    if (!isPiAppContext()) {
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handlePiLogin();
            }}
            disabled={piAuthLoading}
            style={{
              position: "relative",
              zIndex: 2,
              marginTop: "20px",
              padding: "12px 20px",
              fontWeight: "bold",
              cursor: piAuthLoading ? "not-allowed" : "pointer",
            }}
          >
            {piAuthLoading ? "Connecting…" : "🔐 Login with Pi"}
          </button>
        </>
      )}

      {uid && isActive && (
        <>
          <h3 style={{ color: "green", marginTop: "20px" }}>
            ✅ Welcome back — Your PRO subscription is active
          </h3>
          <button
            type="button"
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
          <p style={{ marginTop: "6px", color: "#666", fontSize: 14 }}>
            Monthly plan: <strong>3 Pi / month</strong>. Payment is available only inside the official Pi Browser.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleSubscribe();
            }}
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



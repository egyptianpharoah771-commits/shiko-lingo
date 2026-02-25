/**
 * Locked Feature Component
 * ------------------------
 * Premium access gate (Unified Identity System)
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPiPayment } from "../pi/piPayments";
import { SUBSCRIPTION_PLANS } from "../adapters/subscriptionAdapter";

function LockedFeature({ title }) {
  const { user, loginWithPi, isPiBrowser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (loading) return;

    setError("");

    if (!isPiBrowser()) {
      setError("Please open the app inside Pi Browser.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Ensure authenticated via AuthContext only
      if (!user?.id) {
        await loginWithPi();
      }

      if (!user?.id) {
        throw new Error("Authentication failed.");
      }

      // 2️⃣ Start deterministic payment flow
      await createPiPayment({
        amount: 3,
        memo: "Shiko Lingo - Monthly Subscription",
        uid: user.id,
        plan: SUBSCRIPTION_PLANS.MONTHLY,
      });

      // 3️⃣ Reload after successful activation
      window.location.reload();

    } catch (err) {
      console.error("Subscription error:", err);
      setError("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        border: "1px dashed #ccc",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      <h3>🔒 {title}</h3>
      <p>This content is available for Premium users only.</p>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{ marginTop: "12px" }}
      >
        {loading ? "Processing..." : "🔓 Subscribe with Pi (3 Pi)"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}

export default LockedFeature;
/**
 * Locked Feature Component
 * ------------------------
 * Displayed when user tries to access premium content
 */

import { useState } from "react";
import { initPiSDK } from "../lib/initPi";
import { startPiLogin } from "../flows/authFlow";
import { startSubscriptionPayment } from "../flows/paymentFlow";
import { SUBSCRIPTION_PLANS } from "../adapters/subscriptionAdapter";

function LockedFeature({ title }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (loading) return;

    if (!window.Pi) {
      setError("Please open the app inside Pi Browser.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Ensure SDK initialized (extra safety)
      initPiSDK();

      // 2️⃣ Ensure user authenticated
      const user = await startPiLogin();

      if (!user || !user.uid) {
        throw new Error("Authentication failed.");
      }

      // 3️⃣ Start payment flow
      await startSubscriptionPayment({
        uid: user.uid,
        plan: SUBSCRIPTION_PLANS.MONTHLY,
      });

      // 4️⃣ Reload after activation
      window.location.reload();

    } catch (err) {
      console.error("Subscription error:", err);
      setError("Subscription failed. Please try again.");
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

/**
 * Locked Feature Component
 * ------------------------
 * Premium access gate (Deterministic Identity)
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPiPayment } from "../pi/piPayments";

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

    let currentUser = user;

    try {
      setLoading(true);

      // 🔐 Ensure authenticated
      if (!currentUser?.id) {
        currentUser = await loginWithPi(); // ✅ deterministic
      }

      if (!currentUser?.id) {
        throw new Error("Authentication failed.");
      }

      await createPiPayment({
        amount: 3,
        memo: "Shiko Lingo - Monthly Subscription",
        uid: currentUser.id, // ✅ unified identity
      });

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
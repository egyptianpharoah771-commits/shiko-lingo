import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPiPayment } from "../pi/piPayments";
import piLogo from "../assets/pi-logo.png";
import "./PI.css";

export default function PI() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (loading) return;

    setError("");
    setMessage("");

    // 🔒 Must be inside Pi
    if (typeof window === "undefined" || !window.Pi) {
      setError("❌ Please open this app in Pi Browser");
      return;
    }

    // 🔒 Must have Pi UID from AuthContext
    if (!user?.pi_uid) {
      setError("❌ Pi authentication required");
      return;
    }

    try {
      setLoading(true);

      await createPiPayment({
        amount: 3,
        memo: "Shiko Lingo - Monthly Subscription",
        uid: user.pi_uid, // 🔒 Always Pi UID
      });

      setMessage("✅ Subscription activated successfully!");
    } catch (err) {
      console.error("Pi payment error:", err);
      setError(err.message || "❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pi-container">
      <div className="logo-wrap">
        <img src={piLogo} alt="Pi Network" className="pi-logo" />
      </div>

      <h1 className="pi-title">Shiko Lingo — PRO Subscription</h1>

      <p style={{ marginBottom: "20px", color: "#555" }}>
        Monthly subscription: <strong>3 Pi</strong>
      </p>

      <button
        className="pi-button"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing…" : "Subscribe with Pi"}
      </button>

      {message && (
        <p style={{ color: "green", marginTop: "15px" }}>
          {message}
        </p>
      )}

      {error && (
        <p className="pi-error" style={{ marginTop: "15px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
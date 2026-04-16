import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createPiPayment } from "../pi/piPayments";
import piLogo from "../assets/pi-logo.png";
import "./PI.css";

export default function PI() {
  const { loginWithPi } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (loading) return;

    setError("");
    setMessage("");

    if (typeof window === "undefined" || !window.Pi) {
      setError("❌ Please open this app in Pi Browser");
      return;
    }

    try {
      setLoading(true);

      const sessionUser = await loginWithPi();
      if (!sessionUser?.id) {
        setError("❌ Pi authentication required");
        return;
      }

      await createPiPayment({
        amount: 3,
        memo: "Shiko Lingo - Monthly Subscription",
        uid: sessionUser.id,
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



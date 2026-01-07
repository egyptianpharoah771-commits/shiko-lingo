import { useState } from "react";
import piLogo from "../assets/pi-logo.png";
import "./PI.css";

/**
 * Backend URL
 * - Production: Render
 * - Dev/Test: Cloudflare Tunnel
 */
const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://shiko-lingo-api.onrender.com"
    : "https://your-tunnel-id.trycloudflare.com";

export default function PI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = () => {
    if (!window.Pi) {
      setError("❌ Please open this app in Pi Browser");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    window.Pi.createPayment(
      {
        amount: 0.01,
        memo: "Shiko Lingo – Pi Checklist Test",
        metadata: { checklist: true },
      },
      {
        // 1️⃣ Server Approval
        onReadyForServerApproval: async (paymentId) => {
          try {
            await fetch(`${BACKEND_URL}/api/pi/approve`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          } catch (err) {
            console.error("Approve failed", err);
            setError("❌ Server approval failed");
            setLoading(false);
          }
        },

        // 2️⃣ Server Completion
        onReadyForServerCompletion: async (paymentId, txid) => {
          try {
            await fetch(`${BACKEND_URL}/api/pi/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });

            setMessage("✅ Payment completed successfully");
          } catch (err) {
            console.error("Complete failed", err);
            setError("❌ Payment completion failed");
          } finally {
            setLoading(false);
          }
        },

        onCancel: () => {
          setError("⚠️ Payment cancelled");
          setLoading(false);
        },

        onError: (err) => {
          console.error("Pi Payment Error", err);
          setError("❌ Payment failed");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="pi-container">
      <div className="logo-wrap">
        <img src={piLogo} alt="Pi Network" className="pi-logo" />
      </div>

      <h1 className="pi-title">Shiko Lingo — Pi Network</h1>

      <button
        className="pi-button"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing…" : "Complete Pi Checklist Payment"}
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p className="pi-error">{error}</p>}
    </div>
  );
}

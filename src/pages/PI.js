import { useState } from "react";
import piLogo from "../assets/pi-logo.png";
import "./PI.css";

export default function PI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!window.Pi) {
      setError("❌ Please open this app in Pi Browser");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ✅ AUTHENTICATION IS REQUIRED BEFORE PAYMENT
      await window.Pi.authenticate(
        ["username", "payments"],
        () => {}
      );
    } catch (err) {
      console.error("Pi authentication failed", err);
      setError("❌ Pi authentication failed");
      setLoading(false);
      return;
    }

    window.Pi.createPayment(
      {
        amount: 0.01,
        memo: "Shiko Lingo – Pi Checklist Test",
        metadata: { checklist: true },
      },
      {
        /* =========================
           STEP 1 — Server Approval
        ========================= */
        onReadyForServerApproval: (paymentId) => {
          return fetch("/api/pi/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          }).then((res) => {
            if (!res.ok) {
              throw new Error("Approve failed");
            }
            return res.json();
          });
        },

        /* =========================
           STEP 2 — Server Completion
        ========================= */
        onReadyForServerCompletion: (paymentId, txid) => {
          return fetch("/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          }).then((res) => {
            if (!res.ok) {
              throw new Error("Complete failed");
            }
            setMessage("✅ Payment completed successfully");
            setLoading(false);
            return res.json();
          });
        },

        /* =========================
           User Actions / Errors
        ========================= */
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

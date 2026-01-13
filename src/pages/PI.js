import { useState } from "react";
import piLogo from "../assets/pi-logo.png";
import "./PI.css";

export default function PI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    console.log("🟡 handlePayment started");

    // 1️⃣ تأكيد بيئة Pi
    if (!window.Pi) {
      console.error("❌ Pi SDK not found");
      setError("❌ Please open this app in Pi Browser");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    // 2️⃣ AUTHENTICATION (إجباري)
    try {
      console.log("🟡 Pi.authenticate called");
      await window.Pi.authenticate(
        ["username", "payments"],
        (payment) => {
          console.warn("⚠️ Incomplete payment found:", payment);
        }
      );
      console.log("🟢 Pi.authenticate success");
    } catch (err) {
      console.error("❌ Pi authentication failed", err);
      setError("❌ Pi authentication failed");
      setLoading(false);
      return;
    }

    // 3️⃣ Safety Timeout (تشخيص فقط)
    const safetyTimeout = setTimeout(() => {
      console.error("⏱️ Payment timeout reached (no callbacks fired)");
      setError(
        "⏱️ Payment is taking too long. Please ensure Sandbox is authorized and reopen the app from Pi Browser."
      );
      setLoading(false);
    }, 15000);

    console.log("🟡 Pi.createPayment called");

    // 4️⃣ PAYMENT
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
          console.log(
            "🔥 CALLBACK onReadyForServerApproval:",
            paymentId
          );

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
          console.log(
            "🔥 CALLBACK onReadyForServerCompletion:",
            paymentId,
            txid
          );

          clearTimeout(safetyTimeout);

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
          console.warn("⚠️ CALLBACK onCancel");
          clearTimeout(safetyTimeout);
          setError("⚠️ Payment cancelled");
          setLoading(false);
        },

        onError: (err) => {
          console.error("❌ CALLBACK onError:", err);
          clearTimeout(safetyTimeout);
          setError("❌ Payment failed");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="pi-container">
      <div className="logo-wrap">
        <img
          src={piLogo}
          alt="Pi Network"
          className="pi-logo"
        />
      </div>

      <h1 className="pi-title">
        Shiko Lingo — Pi Network
      </h1>

      <button
        className="pi-button"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing…" : "Complete Pi Checklist Payment"}
      </button>

      {message && (
        <p style={{ color: "green" }}>{message}</p>
      )}
      {error && <p className="pi-error">{error}</p>}
    </div>
  );
}

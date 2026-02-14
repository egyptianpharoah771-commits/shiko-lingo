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

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    let uid = null;

    try {
      // ✅ Authenticate first
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        () => {}
      );

      uid = auth?.user?.uid;

      if (!uid) {
        throw new Error("Missing UID from Pi authentication");
      }

      // ✅ Save UID for subscription checks
      localStorage.setItem("pi_uid", uid);
    } catch (err) {
      console.error("Pi authentication failed", err);
      setError("❌ Pi authentication failed");
      setLoading(false);
      return;
    }

    try {
      window.Pi.createPayment(
        {
          amount: 3, // ✅ Monthly subscription price
          memo: "Shiko Lingo - Monthly Subscription",
          metadata: {
            plan: "MONTHLY",
          },
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
              body: JSON.stringify({
                paymentId,
                txid,
                uid,
              }),
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error("Complete failed");
                }
                return res.json();
              })
              .then((data) => {
                if (data.success) {
                  setMessage("✅ Subscription activated successfully!");
                } else {
                  throw new Error("Subscription activation failed");
                }
                setLoading(false);
                return data;
              });
          },

          /* =========================
             Cancel / Error
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
    } catch (err) {
      console.error("Payment initialization failed", err);
      setError("❌ Payment initialization failed");
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

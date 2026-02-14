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

    try {
      // 1️⃣ Authenticate
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        () => {}
      );

      const uid = auth?.user?.uid;

      if (!uid) {
        throw new Error("Missing UID from Pi authentication");
      }

      localStorage.setItem("pi_uid", uid);

      // 2️⃣ Wrap createPayment in Promise (important)
      await new Promise((resolve, reject) => {
        window.Pi.createPayment(
          {
            amount: 3,
            memo: "Shiko Lingo - Monthly Subscription",
            metadata: { plan: "MONTHLY" },
          },
          {
            /* ===== Server Approval ===== */
            onReadyForServerApproval: async (paymentId) => {
              try {
                const res = await fetch("/api/pi/approve", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentId }),
                });

                if (!res.ok) {
                  const err = await res.text();
                  reject(new Error("Approve failed: " + err));
                }
              } catch (err) {
                reject(err);
              }
            },

            /* ===== Server Completion ===== */
            onReadyForServerCompletion: async (paymentId, txid) => {
              try {
                const res = await fetch("/api/pi/complete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ paymentId, txid, uid }),
                });

                if (!res.ok) {
                  const err = await res.text();
                  reject(new Error("Complete failed: " + err));
                  return;
                }

                const data = await res.json();

                if (!data.success) {
                  reject(new Error("Subscription activation failed"));
                  return;
                }

                resolve(data);
              } catch (err) {
                reject(err);
              }
            },

            onCancel: () => {
              reject(new Error("Payment cancelled"));
            },

            onError: (err) => {
              reject(err || new Error("Payment failed"));
            },
          }
        );
      });

      // 3️⃣ Success UI
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

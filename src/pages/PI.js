import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import piLogo from "../assets/pi-logo.png";
import "./PI.css";

/* 🧠 User Identity */
import {
  setPiUser,
  getPiUser,
} from "../utils/userIdentity";

export default function PI() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  /* ===== Check existing Pi login ===== */
  useEffect(() => {
    const existingUser = getPiUser();
    if (existingUser) {
      setUser(existingUser);
    }
  }, []);

  /* ==================================================
     Login with Pi (WITH PAYMENTS SCOPE)
     + SERVER AUTH VERIFY (CHECKLIST REQUIRED)
  ================================================== */
  const handleLogin = async () => {
    if (!window.Pi) {
      setError("Please open this app using Pi Browser.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scopes = ["username", "payments"];

      const auth = await window.Pi.authenticate(
        scopes,
        (payment) => {
          console.warn(
            "⚠️ Incomplete payment found:",
            payment
          );
        }
      );

      /* 🔐 VERIFY ACCESS TOKEN WITH BACKEND */
      await fetch("/api/pi?action=auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: auth.accessToken,
        }),
      });

      const piUser = auth.user;

      setPiUser(piUser);
      setUser(piUser);

      navigate("/dashboard");
    } catch (err) {
      console.error("Pi Login Error:", err);
      setError("Login cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ==================================================
     Test Pi Payment (FINAL CHECKLIST STEP)
  ================================================== */
  const handleTestPayment = async () => {
    if (!window.Pi) {
      setError("Pi Browser required.");
      return;
    }

    setPaying(true);
    setError("");
    setMessage("");

    try {
      window.Pi.createPayment(
        {
          amount: 0.1,
          memo: "Shiko Lingo Test Payment",
        },
        {
          /* ===== Phase 1: Server Approval ===== */
          onReadyForServerApproval: async (paymentId) => {
            console.log("✅ Ready for approval:", paymentId);

            await fetch("/api/pi?action=approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            });
          },

          /* ===== Phase 3: Server Completion ===== */
          onReadyForServerCompletion: async (
            paymentId,
            txid
          ) => {
            console.log(
              "✅ Ready for completion:",
              paymentId,
              txid
            );

            await fetch("/api/pi?action=complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId, txid }),
            });

            setMessage("✅ Payment completed successfully!");
            setPaying(false);
          },

          onCancel: (paymentId) => {
            console.warn(
              "❌ Payment cancelled:",
              paymentId
            );
            setError("Payment cancelled.");
            setPaying(false);
          },

          onError: (err, payment) => {
            console.error(
              "❌ Pi Payment Error:",
              err,
              payment
            );
            setError("Payment failed.");
            setPaying(false);
          },
        }
      );
    } catch (err) {
      console.error(err);
      setError("Payment failed.");
      setPaying(false);
    }
  };

  return (
    <div className="pi-container">
      <div className="logo-wrap">
        <img
          src={piLogo}
          alt="Pi Logo"
          className="pi-logo"
        />
      </div>

      <h1 className="pi-title">
        Shiko Lingo — Pi Network
      </h1>
      <p className="pi-desc">
        Sign in with your Pi account to personalize
        your learning experience.
      </p>

      <div className="pi-box">
        <h2 className="pi-section-title">🔐 Login</h2>

        {user ? (
          <div className="pi-success">
            ✅ Logged in as{" "}
            <strong>{user.username}</strong>
          </div>
        ) : (
          <button
            className="pi-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading
              ? "Connecting…"
              : "Login with Pi"}
          </button>
        )}

        {user && (
          <>
            <hr style={{ margin: "20px 0" }} />

            <h2 className="pi-section-title">
              💰 Test Pi Payment
            </h2>

            <button
              className="pi-button"
              onClick={handleTestPayment}
              disabled={paying}
            >
              {paying
                ? "Processing…"
                : "Test Pi Payment"}
            </button>
          </>
        )}

        {message && (
          <p style={{ color: "green" }}>
            {message}
          </p>
        )}
        {error && (
          <p className="pi-error">{error}</p>
        )}
      </div>
    </div>
  );
}

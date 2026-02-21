import { useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, logout, loading } = useAuth();

  const isPiBrowser = useMemo(() => {
    return typeof window !== "undefined" && window.Pi;
  }, []);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("EMAIL");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  /* =========================
     PI LOGIN (Inside Pi Browser)
  ========================= */
  const handlePiLogin = async () => {
    if (!window.Pi) return;

    try {
      setMessage("Authenticating with Pi...");
      setSending(true);

      const scopes = ["username", "payments"];

      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.log("Incomplete payment found:", payment);
      });

      console.log("Pi Auth Success:", auth);

      setMessage("✅ Pi authentication successful.");
    } catch (err) {
      console.error("PI AUTH ERROR:", err);
      setMessage("Pi authentication failed.");
    }

    setSending(false);
  };

  /* =========================
     EMAIL OTP FLOW (Outside Pi)
  ========================= */
  const handleSendCode = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setSending(true);
    setMessage("Sending verification code...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    setSending(false);

    if (error) {
      console.error("OTP SEND ERROR:", error);
      setMessage(error.message);
      return;
    }

    setMessage("📩 Check your email for the verification code.");
    setStep("CODE");
  };

  const handleVerifyCode = async () => {
    if (!code) {
      setMessage("Please enter the verification code.");
      return;
    }

    setSending(true);
    setMessage("Verifying code...");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setSending(false);

    if (error) {
      console.error("OTP VERIFY ERROR:", error);
      setMessage(error.message);
      return;
    }

    setMessage("✅ Login successful.");
  };

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>🔐 Login</h2>

      {user ? (
        <>
          <p>Logged in as:</p>
          <strong>{user.email || user.id}</strong>
          <br /><br />
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          {/* ===== PI LOGIN ===== */}
          {isPiBrowser && (
            <>
              <button
                onClick={handlePiLogin}
                disabled={sending}
                style={{
                  padding: 12,
                  width: "100%",
                  marginBottom: 20,
                  backgroundColor: "#6C5CE7",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: "bold",
                }}
              >
                {sending ? "Connecting..." : "Continue with Pi"}
              </button>

              <hr style={{ margin: "20px 0" }} />
              <p style={{ fontSize: 14, color: "#666" }}>
                Or login with email
              </p>
            </>
          )}

          {/* ===== EMAIL OTP ===== */}
          {step === "EMAIL" && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                }}
              />

              <button onClick={handleSendCode} disabled={sending}>
                {sending ? "Sending..." : "Send Verification Code"}
              </button>
            </>
          )}

          {step === "CODE" && (
            <>
              <p>Enter the verification code sent to:</p>
              <strong>{email}</strong>
              <br /><br />

              <input
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  padding: 10,
                  width: "100%",
                  marginBottom: 10,
                  textAlign: "center",
                  letterSpacing: 2,
                }}
              />

              <button onClick={handleVerifyCode} disabled={sending}>
                {sending ? "Verifying..." : "Verify & Login"}
              </button>

              <br /><br />

              <button
                onClick={() => {
                  setStep("EMAIL");
                  setCode("");
                  setMessage("");
                }}
                style={{ fontSize: 12 }}
              >
                ← Change Email
              </button>
            </>
          )}

          {message && (
            <p style={{ marginTop: 15 }}>{message}</p>
          )}
        </>
      )}
    </div>
  );
}
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function isPiBrowser() {
  return typeof window !== "undefined" && !!window.Pi;
}

export default function Login() {
  const { user, logout, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("EMAIL");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // 🔒 Prevent Login UI inside Pi Browser completely
  if (isPiBrowser()) {
    return null;
  }

  /* =========================
     EMAIL OTP FLOW
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
      options: { shouldCreateUser: true },
    });

    setSending(false);

    if (error) {
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
          <p style={{ fontSize: 14, color: "#666" }}>
            Login with email
          </p>

          {step === "EMAIL" && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: 10, width: "100%", marginBottom: 10 }}
              />
              <button onClick={handleSendCode} disabled={sending}>
                {sending ? "Sending..." : "Send Verification Code"}
              </button>
            </>
          )}

          {step === "CODE" && (
            <>
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
                }}
              />
              <button onClick={handleVerifyCode} disabled={sending}>
                {sending ? "Verifying..." : "Verify & Login"}
              </button>
            </>
          )}

          {message && <p style={{ marginTop: 15 }}>{message}</p>}
        </>
      )}
    </div>
  );
}
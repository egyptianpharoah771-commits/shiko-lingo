import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { isPiBrowserEnvironment } from "../lib/initPi";

export default function Login() {
  const navigate = useNavigate();
  const { user, logout, loading, loginWithPi } = useAuth();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("EMAIL");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [piBusy, setPiBusy] = useState(false);

  if (loading) {
    return <div style={{ padding: 40, color: "#212529" }}>Loading...</div>;
  }

  /* Pi Browser: email OTP is not used; Pi Network authentication instead. */
  if (isPiBrowserEnvironment()) {
    return (
      <div
        style={{
          maxWidth: 420,
          margin: "50px auto",
          textAlign: "center",
          color: "#212529",
          padding: "0 16px",
        }}
      >
        <h2>Pi Network</h2>
        <p style={{ color: "#495057", fontSize: 15 }}>
          Sign in with your Pi account to use Shiko Lingo in Pi Browser.
        </p>

        {user ? (
          <>
            <p style={{ marginTop: 16 }}>
              Signed in as <strong>{user.username || user.id}</strong>
            </p>
            <button
              type="button"
              style={{ marginTop: 16, padding: "10px 20px" }}
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              Continue to app
            </button>
            <br />
            <button
              type="button"
              style={{ marginTop: 12, padding: "8px 16px" }}
              onClick={() => logout()}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={piBusy}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                fontWeight: 600,
                cursor: piBusy ? "wait" : "pointer",
                background: "#4A90E2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
              }}
              onClick={async () => {
                setMessage("");
                setPiBusy(true);
                try {
                  await loginWithPi();
                  navigate("/dashboard", { replace: true });
                } catch (e) {
                  setMessage(
                    e?.message ||
                      "Pi sign-in failed. Ensure the Pi SDK loaded and try again."
                  );
                } finally {
                  setPiBusy(false);
                }
              }}
            >
              {piBusy ? "Connecting…" : "Sign in with Pi"}
            </button>
            {message && (
              <p style={{ marginTop: 16, color: "#c92a2a" }}>{message}</p>
            )}
          </>
        )}
      </div>
    );
  }

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
    navigate("/dashboard", { replace: true });
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        textAlign: "center",
        color: "#212529",
      }}
    >
      <h2>🔐 Login</h2>

      {user ? (
        <>
          <p>Logged in as:</p>
          <strong>{user.email || user.id}</strong>
          <br />
          <br />
          <button type="button" onClick={() => logout()}>
            Logout
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, color: "#666" }}>Login with email</p>

          {step === "EMAIL" && (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: 10, width: "100%", marginBottom: 10 }}
              />
              <button type="button" onClick={handleSendCode} disabled={sending}>
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
              <button type="button" onClick={handleVerifyCode} disabled={sending}>
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

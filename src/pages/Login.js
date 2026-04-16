import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isPiBrowserEnvironment } from "../lib/initPi";

export default function Login() {
  const navigate = useNavigate();
  const { user, logout, loading, loginWithPi } = useAuth();

  const [message, setMessage] = useState("");
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
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => navigate("/admin/announcements")}>
              Go to Announcements
            </button>
            <button type="button" onClick={() => navigate("/dashboard", { replace: true })}>
              Enter App
            </button>
            <button type="button" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 14, color: "#666" }}>
            Full access and subscriptions are only available inside the official Pi Browser.
          </p>
          <p style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
            Please open <strong>Shiko Lingo</strong> from Pi Browser to sign in with Pi.
          </p>

          {message && <p style={{ marginTop: 15 }}>{message}</p>}
        </>
      )}
    </div>
  );
}

import { useState } from "react";

/* ===== CONFIG ===== */
const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || "1234";

function AdminGuard({ children }) {
  const [authorized, setAuthorized] = useState(() => {
    return sessionStorage.getItem("admin_authed") === "true";
  });

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const cleanPin = pin.trim();

    if (cleanPin === ADMIN_PIN) {
      sessionStorage.setItem("admin_authed", "true");
      setAuthorized(true);
      setError("");
    } else {
      setError("❌ Wrong PIN");
      setPin("");
    }
  };

  if (authorized) {
    return children;
  }

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        background: "#fff",
      }}
    >
      <h2>🔐 Admin Access</h2>

      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="PIN"
        style={{ width: "100%", padding: 10 }}
      />

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        style={{ marginTop: 10 }}
      >
        Unlock
      </button>
    </div>
  );
}

export default AdminGuard;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Upgrade() {
  const navigate = useNavigate();

  useEffect(() => {
    // 🔒 Upgrade page deprecated
    // App now uses a single subscription (3 Pi)
    // AI is a built-in lesson feedback enhancement

    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <h2>ℹ️ Subscription Update</h2>

      <p style={{ marginTop: "12px", color: "#555" }}>
        Shiko Lingo now uses a single simple subscription.
      </p>

      <p style={{ marginTop: "8px", color: "#777" }}>
        You are being redirected…
      </p>
    </div>
  );
}

export default Upgrade;

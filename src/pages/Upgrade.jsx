import { useNavigate } from "react-router-dom";

function Upgrade() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <h2>🔒 Subscription Required</h2>

      <p style={{ marginTop: "12px", color: "#555" }}>
        Access to Shiko Lingo requires an active PRO subscription.
      </p>

      <p style={{ marginTop: "8px", color: "#777" }}>
        Please subscribe to unlock all lessons and features.
      </p>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => navigate("/pi")}
      >
        Subscribe Now
      </button>
    </div>
  );
}

export default Upgrade;

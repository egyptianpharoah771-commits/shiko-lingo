import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Upgrade() {
  const navigate = useNavigate();
  const [currentPackage, setCurrentPackage] = useState("FREE");

  useEffect(() => {
    const stored =
      localStorage.getItem("user_package");
    if (stored === "PRO") {
      setCurrentPackage("PRO");
    }
  }, []);

  const handleUpgrade = () => {
    // 🔹 MOCK upgrade (Phase 2)
    localStorage.setItem("user_package", "PRO");
    setCurrentPackage("PRO");

    alert("🎉 You are now a PRO user!");
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2>🚀 Upgrade to PRO</h2>

      <p style={{ marginTop: "10px" }}>
        Unlock the full power of{" "}
        <strong>Shiko Lingo AI</strong>
      </p>

      {/* FREE */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          background: "#f9f9f9",
        }}
      >
        <h3>🆓 FREE Plan</h3>
        <ul>
          <li>✔️ Access to A1 lessons</li>
          <li>✔️ Progress tracking</li>
          <li>❌ Limited AI Tutor</li>
        </ul>
      </div>

      {/* PRO */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "12px",
          border: "2px solid #4A90E2",
          background: "#eef3ff",
        }}
      >
        <h3>💎 PRO Plan</h3>
        <ul>
          <li>✔️ All levels unlocked</li>
          <li>✔️ Unlimited AI Tutor</li>
          <li>✔️ Priority future features</li>
        </ul>

        {currentPackage === "PRO" ? (
          <button
            disabled
            style={{
              marginTop: "15px",
              padding: "12px",
              width: "100%",
              background: "#aaa",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            ✅ PRO Activated
          </button>
        ) : (
          <button
            onClick={handleUpgrade}
            style={{
              marginTop: "15px",
              padding: "12px",
              width: "100%",
              background: "#4A90E2",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🚀 Upgrade to PRO (Mock)
          </button>
        )}
      </div>
    </div>
  );
}

export default Upgrade;

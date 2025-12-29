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
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  /* ===== Check existing Pi login ===== */
  useEffect(() => {
    const existingUser = getPiUser();
    if (existingUser) {
      setUser(existingUser);
    }
  }, []);

  /* ===== Login with Pi ===== */
  const handleLogin = async () => {
    if (!window.Pi) {
      setError("Please open this app using Pi Browser.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scopes = ["username"]; // ✅ minimal & compliant

      const auth = await window.Pi.authenticate(scopes, () => {});
      const piUser = auth.user;

      // ✅ Store Pi user centrally
      setPiUser(piUser);
      setUser(piUser);

      // 👉 Go to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Pi Login Error:", err);
      setError("Login cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pi-container">
      <div className="logo-wrap">
        <img src={piLogo} alt="Pi Logo" className="pi-logo" />
      </div>

      <h1 className="pi-title">Shiko Lingo — Pi Network</h1>
      <p className="pi-desc">
        Sign in with your Pi account to personalize your learning experience.
      </p>

      <div className="pi-box">
        <h2 className="pi-section-title">🔐 Login</h2>

        {user ? (
          <div className="pi-success">
            ✅ Logged in as <strong>{user.username}</strong>
          </div>
        ) : (
          <button
            className="pi-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Connecting…" : "Login with Pi"}
          </button>
        )}

        {error && <p className="pi-error">{error}</p>}
      </div>
    </div>
  );
}

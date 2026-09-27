import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { readPiOAuthCallback } from "../pi/piOAuth";

export default function PiSignInCallback() {
  const navigate = useNavigate();
  const { completePiOAuthLogin } = useAuth();
  const [message, setMessage] = useState("Finishing Pi sign-in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const accessToken = readPiOAuthCallback();
        window.history.replaceState(null, "", window.location.pathname);
        await completePiOAuthLogin(accessToken);
        if (!cancelled) navigate("/dashboard", { replace: true });
      } catch (err) {
        if (!cancelled) {
          setMessage(err?.message || "Pi sign-in failed.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [completePiOAuthLogin, navigate]);

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
      <p>{message}</p>
    </div>
  );
}

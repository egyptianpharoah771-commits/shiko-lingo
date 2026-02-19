import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user, logout, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setMessage("Sending magic link...");

    try {
      const { error } = await login(email);

      if (error) {
        console.error("SUPABASE AUTH ERROR:", error);
        setMessage(error.message);
      } else {
        setMessage("📩 Check your email for login link.");
      }
    } catch (err) {
      console.error("UNEXPECTED LOGIN ERROR:", err);
      setMessage("Unexpected error occurred.");
    }
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
          <strong>{user.email}</strong>
          <br /><br />
          <button onClick={logout}>Logout</button>
        </>
      ) : (
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

          <button onClick={handleLogin}>
            Send Magic Link
          </button>

          {message && (
            <p style={{ marginTop: 10 }}>{message}</p>
          )}
        </>
      )}
    </div>
  );
}

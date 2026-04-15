import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitFeedback } from "../services/feedbackService";

function FeedbackBox() {
  const { user } = useAuth();
  const [section, setSection] = useState("General");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    setError("");

    const { error: submitError } = await submitFeedback({
      section,
      message: message.trim(),
      page: window.location.pathname,
      userId: user?.id || null,
    });

    setSending(false);

    if (submitError) {
      setError("Could not send feedback. Please try again.");
      return;
    }

    setMessage("");
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div style={wrapStyle}>
      <h3>💡 Have a suggestion?</h3>
      <p style={{ color: "#666" }}>Help us improve Shiko Lingo 💙</p>

      <select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        style={selectStyle}
        disabled={sending}
      >
        <option value="General">General</option>
        <option value="Listening">Listening</option>
        <option value="Reading">Reading</option>
        <option value="Speaking">Speaking</option>
        <option value="Writing">Writing</option>
        <option value="Grammar">Grammar</option>
        <option value="Vocabulary">Vocabulary</option>
      </select>

      <textarea
        rows={4}
        placeholder="Write your suggestion or issue here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={textareaStyle}
        disabled={sending}
      />

      <button onClick={handleSubmit} disabled={sending || !message.trim()} style={btnStyle}>
        {sending ? "Sending..." : "Send Feedback"}
      </button>

      {sent && (
        <p style={{ color: "green", marginTop: "10px" }}>
          ✅ Thank you! Your feedback was sent.
        </p>
      )}
      {error && (
        <p style={{ color: "crimson", marginTop: "10px" }}>{error}</p>
      )}
    </div>
  );
}

const wrapStyle = {
  marginTop: "30px",
  padding: "20px",
  borderRadius: "12px",
  background: "#f9f9ff",
  border: "1px solid #ddd",
};

const selectStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const textareaStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  marginBottom: "10px",
  boxSizing: "border-box",
  resize: "vertical",
};

const btnStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#4A90E2",
  color: "white",
  fontWeight: "bold",
};

export default FeedbackBox;

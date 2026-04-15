import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { submitFeedback } from "../services/feedbackService";

function detectSection(path) {
  if (path.startsWith("/listening")) return "Listening";
  if (path.startsWith("/reading"))   return "Reading";
  if (path.startsWith("/speaking"))  return "Speaking";
  if (path.startsWith("/writing"))   return "Writing";
  if (path.startsWith("/grammar"))   return "Grammar";
  if (path.startsWith("/vocabulary")) return "Vocabulary";
  return "General";
}

function FeedbackModal({ onClose }) {
  const { user } = useAuth();
  const [message, setMessage]   = useState("");
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState("");

  const section = detectSection(window.location.pathname);

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

    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>💡 Have a suggestion?</h3>

        <p style={{ color: "#666", marginBottom: 10 }}>
          Section: <strong>{section}</strong>
        </p>

        <textarea
          rows={5}
          placeholder="Write your feedback here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={textareaStyle}
          disabled={sending}
        />

        {error && (
          <p style={{ color: "crimson", marginTop: 8, marginBottom: 0 }}>
            {error}
          </p>
        )}

        <div style={actionsStyle}>
          <button onClick={onClose} disabled={sending} style={cancelBtn}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={sending || !message.trim()} style={sendBtn}>
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  width: "400px",
  maxWidth: "90%",
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
};

const textareaStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box",
  resize: "vertical",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "15px",
};

const cancelBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
};

const sendBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: "#4A90E2",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

export default FeedbackModal;

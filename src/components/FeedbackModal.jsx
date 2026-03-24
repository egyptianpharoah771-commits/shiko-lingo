import { useState } from "react";

/* ===== Auto-detect section from URL ===== */
function detectSection(path) {
  if (path.startsWith("/listening")) return "Listening";
  if (path.startsWith("/reading")) return "Reading";
  if (path.startsWith("/speaking")) return "Speaking";
  if (path.startsWith("/writing")) return "Writing";
  if (path.startsWith("/grammar")) return "Grammar";
  return "General";
}

function FeedbackModal({ onClose }) {
  const [message, setMessage] = useState("");

  const section = detectSection(window.location.pathname);

  const handleSubmit = () => {
    if (!message.trim()) return;

    const feedback = {
      section,
      message,
      page: window.location.pathname,
      date: new Date().toISOString(),
      isRead: false,
    };

    const stored =
      JSON.parse(localStorage.getItem("userFeedback")) || [];

    localStorage.setItem(
      "userFeedback",
      JSON.stringify([...stored, feedback])
    );

    alert("✅ Thanks! Your feedback was sent.");
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>💡 Have a suggestion?</h3>

        <p style={{ color: "#666", marginBottom: 10 }}>
          Section: <strong>{section}</strong>
        </p>

        <textarea
          rows={5}
          placeholder="Write your feedback here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Send</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "400px",
  maxWidth: "90%",
};

export default FeedbackModal;

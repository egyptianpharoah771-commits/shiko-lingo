import { useState } from "react";

function FeedbackBox() {
  const [section, setSection] = useState("General");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;

    const existing =
      JSON.parse(localStorage.getItem("userFeedback")) || [];

    existing.push({
      section,
      message,
      date: new Date().toISOString(),
    });

    localStorage.setItem(
      "userFeedback",
      JSON.stringify(existing)
    );

    setMessage("");
    setSent(true);

    setTimeout(() => setSent(false), 2000);
  };

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        borderRadius: "12px",
        background: "#f9f9ff",
        border: "1px solid #ddd",
      }}
    >
      <h3>💡 Have a suggestion?</h3>
      <p style={{ color: "#666" }}>
        Help us improve Shiko Lingo 💙
      </p>

      {/* Section selector */}
      <select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          borderRadius: "6px",
        }}
      >
        <option value="General">General</option>
        <option value="Listening">Listening</option>
        <option value="Reading">Reading</option>
        <option value="Speaking">Speaking</option>
        <option value="Writing">Writing</option>
        <option value="Grammar">Grammar</option>
      </select>

      {/* Message */}
      <textarea
        rows={4}
        placeholder="Write your suggestion or issue here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "10px",
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          backgroundColor: "#4A90E2",
          color: "white",
          fontWeight: "bold",
        }}
      >
        Send Feedback
      </button>

      {sent && (
        <p style={{ color: "green", marginTop: "10px" }}>
          ✅ Thank you! Your feedback was sent.
        </p>
      )}
    </div>
  );
}

export default FeedbackBox;

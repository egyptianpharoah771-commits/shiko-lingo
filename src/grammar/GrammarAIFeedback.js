import { useState } from "react";
import AIResponseModal from "../components/ai/AIResponseModal";

function GrammarAIFeedback({
  level,
  unit,
  score,
  total,
  lessonTitle,
  lessonText,
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("IDLE"); // IDLE | LOADING | SUCCESS | ERROR
  const [message, setMessage] = useState("");

  const handleOpen = async () => {
    if (status !== "IDLE") return;

    setOpen(true);
    setStatus("LOADING");
    setMessage("");

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: "Grammar",
          level,
          unit,
          score,
          total,
          lessonTitle,
          lessonText,
        }),
      });

      if (!res.ok) throw new Error("AI failed");

      const data = await res.json();

      const finalMessage = `
Grade: ${data.grade}

Feedback:
${data.feedback}

Recommendation:
${data.recommendation}
      `.trim();

      setMessage(finalMessage);
      setStatus("SUCCESS");
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setStatus("IDLE");
    setMessage("");
  };

  return (
    <>
      <button
        onClick={handleOpen}
        style={{
          marginTop: 16,
          padding: "12px 20px",
          fontWeight: "bold",
          background: "#4A90E2",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        🤖 Get AI Feedback
      </button>

      <AIResponseModal
        open={open}
        onClose={handleClose}
        status={status}
        message={message}
      />
    </>
  );
}

export default GrammarAIFeedback;
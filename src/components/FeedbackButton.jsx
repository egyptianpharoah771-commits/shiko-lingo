import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== Floating Feedback Button ===== */}
      <button
        onClick={() => setOpen(true)}
        style={buttonStyle}
        aria-label="Open feedback"
      >
        💡 Feedback
      </button>

      {/* ===== Modal ===== */}
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ===== Styles ===== */
const buttonStyle = {
  position: "fixed",
  bottom: 20,
  right: 20,
  padding: "12px 16px",
  borderRadius: 30,
  border: "none",
  backgroundColor: "#4A90E2",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  zIndex: 1001,
};

export default FeedbackButton;

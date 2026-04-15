import { useState } from "react";
import FeedbackModal from "./FeedbackModal";
import { useLocation } from "react-router-dom";

function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const inQuestionFlow = /^\/(listening|reading|speaking|writing|grammar|vocabulary)/.test(
    location.pathname
  );

  const buttonStyle = inQuestionFlow ? compactButtonStyle : defaultButtonStyle;

  return (
    <>
      {/* ===== Floating Feedback Button ===== */}
      <button
        onClick={() => setOpen(true)}
        style={buttonStyle}
        aria-label="Open feedback"
        title="Send feedback"
      >
        {inQuestionFlow ? "💬" : "💡 Feedback"}
      </button>

      {/* ===== Modal ===== */}
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ===== Styles ===== */
const defaultButtonStyle = {
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

const compactButtonStyle = {
  position: "fixed",
  top: 86,
  right: 14,
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: "none",
  backgroundColor: "#4A90E2",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
  zIndex: 1001,
  display: "grid",
  placeItems: "center",
  fontSize: 18,
};

export default FeedbackButton;



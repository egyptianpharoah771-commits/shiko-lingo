function AIResponseModal({
  open,
  onClose,
  status, // "IDLE" | "LOADING" | "SUCCESS" | "ERROR"
  message,
}) {
  if (!open || status === "IDLE") return null;

  const safeMessage =
    message && message.trim().length > 0
      ? message
      : "No feedback available.";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>
          ✖
        </button>

        {status === "LOADING" && (
          <>
            <h3>🤖 AI Lesson Feedback</h3>
            <p>Analyzing your answers… please wait.</p>
          </>
        )}

        {status === "SUCCESS" && (
          <>
            <h3>🧠 AI Lesson Feedback</h3>
            <p style={messageStyle}>{safeMessage}</p>
          </>
        )}

        {status === "ERROR" && (
          <>
            <h3 style={{ color: "#c0392b" }}>
              ❌ Feedback unavailable
            </h3>
            <p>
              Something went wrong while generating your lesson
              feedback.
              <br />
              Please try again in a moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ===== Styles ===== */
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  padding: "22px",
  borderRadius: "12px",
  width: "90%",
  maxWidth: "520px",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: "10px",
  right: "12px",
  border: "none",
  background: "transparent",
  fontSize: "18px",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "10px",
  lineHeight: "1.6",
};

export default AIResponseModal;

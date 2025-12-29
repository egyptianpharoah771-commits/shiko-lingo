import { useNavigate } from "react-router-dom";

function AIResponseModal({
  open,
  onClose,
  status, // "IDLE" | "LOADING" | "SUCCESS" | "LIMIT" | "ERROR"
  message,
}) {
  const navigate = useNavigate();

  if (!open || status === "IDLE") return null;

  const handleUpgrade = () => {
    onClose();
    navigate("/upgrade");
  };

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
            <h3>🤖 AI Tutor</h3>
            <p>Thinking… please wait</p>
          </>
        )}

        {status === "SUCCESS" && (
          <>
            <h3>🧠 AI Feedback</h3>
            <p style={messageStyle}>{safeMessage}</p>
          </>
        )}

        {status === "LIMIT" && (
          <>
            <h3 style={{ color: "#c0392b" }}>
              🚫 Daily AI limit reached
            </h3>

            <p style={{ marginTop: "8px" }}>
              You’re using the <strong>FREE</strong> plan.
              <br />
              Upgrade to <strong>PRO</strong> to unlock unlimited
              AI feedback.
            </p>

            <button onClick={handleUpgrade} style={upgradeBtn}>
              🚀 Upgrade to PRO
            </button>
          </>
        )}

        {status === "ERROR" && (
          <>
            <h3 style={{ color: "red" }}>❌ AI Error</h3>
            <p>
              Something went wrong while contacting the AI Tutor.
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

const upgradeBtn = {
  marginTop: "16px",
  padding: "12px",
  width: "100%",
  background: "#4A90E2",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "15px",
};

export default AIResponseModal;

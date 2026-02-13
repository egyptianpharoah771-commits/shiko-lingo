export const colors = {
  primary: "#4A90E2",
  secondary: "#e5e9ff",
  success: "#d4edda",
  muted: "#eee",
  text: "#333",
};

export const containerStyle = {
  maxWidth: "900px",
  margin: "0 auto",
};

export const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "20px",
};

export const buttonStyle = {
  padding: "10px 14px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: colors.secondary,
};

export const primaryButton = {
  ...buttonStyle,
  backgroundColor: colors.primary,
  color: "#fff",
};

export const successBadge = {
  color: "#155724",
  backgroundColor: colors.success,
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  display: "inline-block",
};

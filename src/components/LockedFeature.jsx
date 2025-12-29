/**
 * Locked Feature Component
 * ------------------------
 * Displayed when user tries to access premium content
 */

import { Link } from "react-router-dom";

function LockedFeature({ title }) {
  return (
    <div
      style={{
        padding: "24px",
        textAlign: "center",
        border: "1px dashed #ccc",
        borderRadius: "12px",
        marginTop: "20px",
      }}
    >
      <h3>🔒 {title}</h3>
      <p>
        This content is available for Premium users only.
      </p>

      <Link to="/upgrade">
        <button style={{ marginTop: "12px" }}>
          Upgrade with Pi
        </button>
      </Link>
    </div>
  );
}

export default LockedFeature;

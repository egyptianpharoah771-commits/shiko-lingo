import React from "react";
import "./success.css";

export default function Success() {
  return (
    <div className="success-container">
      <div className="success-card">
        <h1>🎉 Payment Successful!</h1>
        <p>Your Pi payment was completed successfully.</p>
        <a className="success-btn" href="/pi">Back to Pi Page</a>
      </div>
    </div>
  );
}

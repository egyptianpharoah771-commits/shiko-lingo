import React from "react";
import "./failure.css";

export default function Failure() {
  return (
    <div className="fail-container">
      <div className="fail-card">
        <h1>⚠️ Payment Failed</h1>
        <p>The transaction could not be completed.</p>
        <a className="fail-btn" href="/pi">Try Again</a>
      </div>
    </div>
  );
}

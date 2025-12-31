import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

/* ======================
   Pi SDK Initializer
   (runs once, before app)
====================== */
function PiInitializer({ children }) {
  useEffect(() => {
    if (window.Pi) {
      window.Pi.init({
        version: "2.0",
        sandbox: true,
      });
      console.log("✅ Pi SDK initialized (sandbox)");
    } else {
      console.warn("⚠️ Pi SDK not found");
    }
  }, []);

  return children;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <PiInitializer>
      <App />
    </PiInitializer>
  </React.StrictMode>
);

// Performance measuring (optional)
reportWebVitals();

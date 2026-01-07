import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

/* 🐞 Mobile Debug Console */
import VConsole from "vconsole";

/*
  ⚠️ ملاحظة:
  - التفعيل ده مؤقت للتشخيص فقط
  - هنشيله بعد ما نطلع الـ error
*/

// فعّل vConsole دايمًا
new VConsole();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

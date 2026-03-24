import { useState } from "react";

export default function useAITutor() {
  const [status, setStatus] = useState("IDLE"); // IDLE | LOADING | SUCCESS | ERROR
  const [message, setMessage] = useState("");

  const requestFeedback = async ({
    skill,        // "grammar" | "vocabulary" | ...
    level,
    unitTitle,
    score,
    total,
    wrongItems,   // array
    lessonText,   // explanation / description
  }) => {
    if (status === "LOADING") return;

    setStatus("LOADING");
    setMessage("");

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill,
          level,
          unitTitle,
          score,
          total,
          wrongItems,
          lessonText,
        }),
      });

      const data = await res.json();
      setMessage(data.answer || "");
      setStatus("SUCCESS");
    } catch (e) {
      setStatus("ERROR");
    }
  };

  const reset = () => {
    setStatus("IDLE");
    setMessage("");
  };

  return {
    status,
    message,
    requestFeedback,
    reset,
  };
}

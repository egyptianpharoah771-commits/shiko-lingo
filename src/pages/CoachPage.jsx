import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CoachPage() {
  const navigate = useNavigate();

  const [coach, setCoach] = useState({
    accuracy: 0,
    weakCount: 0,
    message: "",
    action: "",
    mode: "review"
  });

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("learning_profile") || "{}");

    let totalCorrect = 0;
    let totalWrong = 0;
    let weakCount = 0;

    Object.values(profile).forEach(data => {
      const c = data.correct || 0;
      const w = data.wrong || 0;

      totalCorrect += c;
      totalWrong += w;

      const strength = data.strength ?? (c / (c + w || 1));

      if (strength < 0.4) weakCount++;
    });

    const total = totalCorrect + totalWrong;
    const accuracy = total ? (totalCorrect / total) : 0;

    let message = "";
    let action = "";
    let mode = "review";

    // 🔥 Coach Logic (Upgraded)

    if (total < 10) {
      message = "🚀 Start learning first before using Coach";
      action = "Go to Vocabulary";
      mode = "vocab";
    }

    else if (accuracy < 0.5) {
      message = "🔴 You need strong basics — focus on Review";
      action = "Start Review";
      mode = "review";
    }

    else if (weakCount > 5) {
      message = "⚠️ You have weak words — let's train them in context";
      action = "Start Coach Training";
      mode = "coach";
    }

    else if (accuracy > 0.8) {
      message = "🔥 You're ready for advanced training";
      action = "Challenge Yourself (Coach)";
      mode = "coach";
    }

    else {
      message = "👍 Keep improving with Review";
      action = "Continue Review";
      mode = "review";
    }

    setCoach({
      accuracy: Math.round(accuracy * 100),
      weakCount,
      message,
      action,
      mode
    });

  }, []);

  function handleAction() {
    if (coach.mode === "coach") {
      navigate("/coach/session");
    } else if (coach.mode === "vocab") {
      navigate("/vocabulary");
    } else {
      navigate("/review");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <h2>🧠 Your AI Coach</h2>

      <h3>{coach.message}</h3>

      <p>Accuracy: {coach.accuracy}%</p>
      <p>Weak Words: {coach.weakCount}</p>

      <button
        style={{
          padding: "12px 20px",
          marginTop: "20px",
          background: "#4A90E2",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
        onClick={handleAction}
      >
        {coach.action}
      </button>
    </div>
  );
}

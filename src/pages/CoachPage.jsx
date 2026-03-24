import { useEffect, useState } from "react";

export default function CoachPage() {
  const [coach, setCoach] = useState({
    accuracy: 0,
    weakCount: 0,
    message: "",
    action: ""
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

    // 🔥 AI COACH LOGIC
    let message = "";
    let action = "";

    if (total < 10) {
      message = "🚀 Start practicing to build your memory";
      action = "Start Review";
    }

    else if (accuracy < 0.5) {
      message = "🔴 You're struggling — focus on typing questions";
      action = "Practice Basics";
    }

    else if (weakCount > 5) {
      message = "⚠️ You have many weak words — review them now";
      action = "Review Weak Words";
    }

    else if (accuracy > 0.8) {
      message = "🔥 You're doing great — increase difficulty";
      action = "Challenge Yourself";
    }

    else {
      message = "👍 Keep going — you're improving steadily";
      action = "Continue Practice";
    }

    setCoach({
      accuracy: Math.round(accuracy * 100),
      weakCount,
      message,
      action
    });

  }, []);

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
        onClick={() => window.location.href = "/review"}
      >
        {coach.action}
      </button>

    </div>
  );
}



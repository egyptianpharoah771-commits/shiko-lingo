import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CoachPage() {
  const navigate = useNavigate();
  const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

  const [coach, setCoach] = useState({
    accuracy: 0,
    weakCount: 0,
    message: "",
    action: "",
    mode: "review"
  });

  useEffect(() => {
    let progress = {};
    try {
      progress = JSON.parse(
        localStorage.getItem("coach_progress") || "{}"
      );
    } catch {
      progress = {};
    }

    let totalCorrect = 0;
    let totalWrong = 0;
    let weakCount = 0;

    Object.values(progress).forEach((data) => {
      const c = data.correct || 0;
      const w = data.wrong || 0;

      totalCorrect += c;
      totalWrong += w;

      const strength = c / (c + w || 1);

      if (strength < 0.4) weakCount++;
    });

    const total = totalCorrect + totalWrong;
    const accuracy = total ? totalCorrect / total : 0;

    // 🔥 check if any unit is done
    const hasFinishedUnits = Object.keys(localStorage).some((key) =>
      key.includes("_done")
    );

    let message = "";
    let action = "";
    let mode = "review";

    // 🔥 LOGIC FIX

    if (total < 5 && !hasFinishedUnits) {
      message = "🚀 Start learning first before using Coach";
      action = "Go to Vocabulary";
      mode = "vocab";
    }

    else if (total < 5 && hasFinishedUnits) {
      message = "🧠 Start your first Coach session";
      action = "Start Coach";
      mode = "coach";
    }

    else if (accuracy < 0.5) {
      message = "🔴 You need strong basics — focus on Review";
      action = "Start Review";
      mode = "review";
    }

    else if (weakCount > 3) {
      message = "⚠️ You have weak words — let's train them";
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
      navigate("/coach/session/A1"); // 🔥 مهم: لازم level
    } else if (coach.mode === "vocab") {
      navigate("/vocabulary");
    } else {
      navigate("/review");
    }
  }

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        color: "#1f2430",
        minHeight: 200,
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #ece8fb",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(45,37,89,0.08)",
          padding: 22,
          textAlign: "center",
        }}
      >
        <h2 style={{ marginTop: 0 }}>🧠 Your AI Coach</h2>
        <h3>{coach.message}</h3>

        <p>Accuracy: {coach.accuracy}%</p>
        <p>Weak Words: {coach.weakCount}</p>

        <button
          style={{
            padding: "12px 20px",
            marginTop: "20px",
            background: "#6c4de6",
            color: "#fff",
            border: "1px solid #583bc4",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={handleAction}
        >
          {coach.action}
        </button>

        <div style={{ marginTop: 20 }}>
          <p style={{ marginBottom: 10, color: "#5c6370" }}>Choose your training level:</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {LEVELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => navigate(`/coach/session/${item}`)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d8cbff",
                  borderRadius: 999,
                  background: "#f3efff",
                  color: "#3f2e95",
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {coach.mode === "vocab" && (
          <p style={{ marginTop: 20, fontSize: 14, color: "#6c757d" }}>
            <button
              type="button"
              onClick={() => navigate("/coach/session/A1")}
              style={{
                background: "none",
                border: "none",
                color: "#6c4de6",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit",
                padding: 0,
              }}
            >
              Try a Coach session anyway (A1)
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
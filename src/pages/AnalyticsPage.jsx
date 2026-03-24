import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0,
    weak: [],
    strong: []
  });

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("learning_profile") || "{}");

    let totalCorrect = 0;
    let totalWrong = 0;

    const weak = [];
    const strong = [];

    Object.entries(profile).forEach(([wordId, data]) => {
      const c = data.correct || 0;
      const w = data.wrong || 0;

      totalCorrect += c;
      totalWrong += w;

      const strength = data.strength ?? (c / (c + w || 1));

      if (strength < 0.4) weak.push({ wordId, ...data });
      if (strength > 0.8) strong.push({ wordId, ...data });
    });

    const total = totalCorrect + totalWrong;

    setStats({
      total,
      correct: totalCorrect,
      wrong: totalWrong,
      accuracy: total ? Math.round((totalCorrect / total) * 100) : 0,
      weak: weak.slice(0, 5),
      strong: strong.slice(0, 5)
    });

  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>

      <h2>📊 Your Learning Stats</h2>

      <p><strong>Accuracy:</strong> {stats.accuracy}%</p>
      <p>Correct: {stats.correct}</p>
      <p>Wrong: {stats.wrong}</p>

      <hr />

      <h3>🔴 Weak Words</h3>
      {stats.weak.length === 0 && <p>No weak words 🎉</p>}
      {stats.weak.map((w, i) => (
        <div key={i}>
          Word ID: {w.wordId} — Strength: {(w.strength * 100).toFixed(0)}%
        </div>
      ))}

      <hr />

      <h3>🟢 Strong Words</h3>
      {stats.strong.length === 0 && <p>Keep going 💪</p>}
      {stats.strong.map((w, i) => (
        <div key={i}>
          Word ID: {w.wordId} — Strength: {(w.strength * 100).toFixed(0)}%
        </div>
      ))}

    </div>
  );
}
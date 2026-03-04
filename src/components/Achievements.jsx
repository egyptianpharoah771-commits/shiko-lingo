import { useEffect, useState } from "react";
import { getAchievements } from "../utils/achievementEngine";

const ACHIEVEMENTS = {
  xp10: {
    title: "First XP",
    icon: "⭐",
    desc: "Earn 10 XP",
  },
  xp50: {
    title: "Learning Started",
    icon: "🔥",
    desc: "Earn 50 XP",
  },
  streak7: {
    title: "7 Day Streak",
    icon: "🏆",
    desc: "Learn 7 days in a row",
  },
};

function Achievements() {
  const [unlocked, setUnlocked] = useState({});

  useEffect(() => {
    setUnlocked(getAchievements());
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <h3>🏅 Achievements</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
        }}
      >
        {Object.entries(ACHIEVEMENTS).map(
          ([key, badge]) => {
            const isUnlocked = unlocked[key];

            return (
              <div
                key={key}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  textAlign: "center",
                  background: isUnlocked
                    ? "#f8f6ff"
                    : "#f3f3f3",
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 26 }}>
                  {badge.icon}
                </div>

                <strong>{badge.title}</strong>

                <p
                  style={{
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  {badge.desc}
                </p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default Achievements;
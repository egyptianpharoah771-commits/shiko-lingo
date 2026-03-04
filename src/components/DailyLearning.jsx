import { useEffect, useState } from "react";

const STORAGE_KEY = "DAILY_LEARNING_STATE";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          xp: 0,
          streak: 0,
          lastDate: null,
          todayXP: 0,
          goal: 20,
        };
  } catch {
    return {
      xp: 0,
      streak: 0,
      lastDate: null,
      todayXP: 0,
      goal: 20,
    };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function DailyLearning() {
  const [state, setState] = useState(loadState());

  useEffect(() => {
    const t = today();

    if (state.lastDate !== t) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const y = yesterday.toISOString().slice(0, 10);

      let streak = state.streak;

      if (state.lastDate === y) {
        streak = state.streak;
      } else {
        streak = 0;
      }

      const updated = {
        ...state,
        todayXP: 0,
        streak,
        lastDate: t,
      };

      setState(updated);
      saveState(updated);
    }
  }, []);

  const addXP = (amount) => {
    const updated = {
      ...state,
      xp: state.xp + amount,
      todayXP: state.todayXP + amount,
    };

    if (updated.todayXP >= updated.goal && state.todayXP < state.goal) {
      updated.streak = state.streak + 1;
    }

    setState(updated);
    saveState(updated);
  };

  const progress = Math.min(
    100,
    Math.round((state.todayXP / state.goal) * 100)
  );

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        background: "#fafafa",
      }}
    >
      <h3>🔥 Daily Learning</h3>

      <p>
        <strong>Streak:</strong> {state.streak} days
      </p>

      <p>
        <strong>Total XP:</strong> {state.xp}
      </p>

      <p>
        <strong>Today's XP:</strong> {state.todayXP} / {state.goal}
      </p>

      <div
        style={{
          height: 10,
          background: "#eee",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#4CAF50",
          }}
        />
      </div>

      <button onClick={() => addXP(5)} style={{ marginRight: 10 }}>
        +5 XP (Practice)
      </button>

      <button onClick={() => addXP(10)}>
        +10 XP (Lesson)
      </button>
    </div>
  );
}

export default DailyLearning;
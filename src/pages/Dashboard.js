import { Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";

import FeedbackBox from "../components/FeedbackBox";
import DailyLearning from "../components/DailyLearning";
import { getUserProgress } from "../adapters/progressAdapter";
import { supabase } from "../lib/supabaseClient";

/* ===== Mini Progress ===== */
function MiniProgress({ label, value = 0, total = 0 }) {
  const rawPercent = total === 0 ? 0 : Math.round((value / total) * 100);
  const percent = Math.min(100, Math.max(0, rawPercent));

  return (
    <div style={skillItem}>
      <div style={skillHeader}>
        <strong style={{ fontSize: 13 }}>{label}</strong>
        <small style={{ color: "#666" }}>
          {value} / {total}
        </small>
      </div>
      <div
        style={{
          height: 6,
          background: "#eee",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#7B61FF",
          }}
        />
      </div>
      <small style={{ color: "#666" }}>{percent}% completed</small>
    </div>
  );
}

/* ===== Helpers ===== */

function resolveUserId() {
  const piUid = localStorage.getItem("pi_uid");
  if (piUid) return piUid;
  try {
    const raw = localStorage.getItem("shiko_pi_user");
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.id) return u.id;
    }
  } catch {
    /* ignore */
  }
  return "dev-user";
}

function getContinueLink() {
  try {
    const completed =
      JSON.parse(localStorage.getItem("READING_COMPLETED")) || [];

    let nextLesson = 1;
    while (completed.includes(`A1-lesson${nextLesson}`)) nextLesson++;

    return `/reading/A1/lesson${nextLesson}`;
  } catch {
    return "/reading/A1/lesson1";
  }
}

function calculateDailyData() {
  const saved = JSON.parse(localStorage.getItem("daily_progress") || "{}");

  const today = new Date();
  let { streak = 0, lastDate, todayProgress = 0 } = saved;

  if (lastDate) {
    const last = new Date(lastDate);
    const diff = (today - last) / (1000 * 60 * 60 * 24);

    if (diff >= 2) streak = 0;
    else if (today.toDateString() !== last.toDateString()) {
      streak++;
      todayProgress = 0;
    }
  } else {
    streak = 1;
  }

  const updated = {
    streak,
    todayProgress,
    lastDate: today.toISOString(),
    goal: 20,
  };

  localStorage.setItem("daily_progress", JSON.stringify(updated));
  return updated;
}

function getCoachInsight(profile) {
  let correct = 0;
  let wrong = 0;
  let weak = 0;

  Object.values(profile).forEach((p) => {
    correct += p.correct || 0;
    wrong += p.wrong || 0;

    if ((p.strength || 0) < 0.4) weak++;
  });

  const total = correct + wrong;
  const acc = total ? correct / total : 0;

  if (total < 10) return "🚀 Start practicing";
  if (acc < 0.5) return "🔴 Focus on basics";
  if (weak > 5) return "⚠️ Review weak words";
  if (acc > 0.8) return "🔥 Increase difficulty";

  return "👍 Keep going";
}

/* ===== Dashboard ===== */

function Dashboard() {
  const progress = useMemo(() => getUserProgress(), []);
  const continueLink = useMemo(() => getContinueLink(), []);

  const [reviewCount, setReviewCount] = useState(0);
  const [daily, setDaily] = useState({
    streak: 0,
    todayProgress: 0,
    goal: 20,
  });
  const [coach, setCoach] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const dailyData = calculateDailyData();
        setDaily(dailyData);

        const userId = resolveUserId();
        if (userId) {
          const now = new Date().toISOString();

          const { data } = await supabase
            .from("vocab_progress")
            .select("id")
            .eq("user_id", userId)
            .lte("next_review", now);

          setReviewCount(data?.length || 0);
        }

        const profile =
          JSON.parse(localStorage.getItem("learning_profile") || "{}");

        setCoach(getCoachInsight(profile));
      } catch (e) {
        console.error(e);
        setReviewCount(0);
      }
    }

    init();
  }, []);

  const skills = {
    grammar: progress.skills?.grammar || [],
    vocabulary: progress.skills?.vocabulary || [],
    listening: progress.skills?.listening || [],
    reading: progress.skills?.reading || [],
    speaking: progress.skills?.speaking || [],
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <h2>🏠 Home</h2>

      {/* 🧠 COACH (FIXED FINAL) */}
      <Link to="/coach/session/A1" style={{ textDecoration: "none" }}>
        <div
          style={{
            ...card,
            position: "relative",
            zIndex: 10,
            cursor: "pointer",
            borderLeft: "4px solid #6c4de6",
          }}
        >
          <h3 style={{ pointerEvents: "none" }}>🧠 Coach</h3>
          <p style={{ pointerEvents: "none" }}>{coach}</p>
        </div>
      </Link>

      {/* 🔥 isolate component */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ color: "#666", marginTop: 0, marginBottom: 8 }}>
          Daily Learning tracks your streak and XP progress for today's goal.
        </p>
        <DailyLearning />
      </div>

      {/* 🔁 Review */}
      <div style={{ ...card, position: "relative", zIndex: 1 }}>
        <h3>🔁 Daily Review</h3>

        <p>
          {reviewCount > 0 ? (
            <>
              You have <strong>{reviewCount}</strong> reviews.
            </>
          ) : (
            "You're all caught up 🎉"
          )}
        </p>

        <Link to="/review">
          <button style={primaryBtn}>Start Review</button>
        </Link>
      </div>

      {/* ▶ Continue */}
      <div style={{ ...card, position: "relative", zIndex: 1 }}>
        <h3>▶ Continue Learning</h3>

        <Link to={continueLink}>
          <button style={primaryBtn}>Continue</button>
        </Link>
      </div>

      {/* 📚 Skills */}
      <div style={{ ...card, position: "relative", zIndex: 1 }}>
        <h3>📚 Skills</h3>
        <p style={{ color: "#666", marginTop: 0 }}>
          Progress by skill (completed lessons out of total lessons).
        </p>

        <div style={grid}>
          <MiniProgress label="Grammar" value={skills.grammar.length} total={5} />
          <MiniProgress label="Vocabulary" value={skills.vocabulary.length} total={20} />
          <MiniProgress label="Listening" value={skills.listening.length} total={42} />
          <MiniProgress label="Reading" value={skills.reading.length} total={17} />
          <MiniProgress label="Speaking" value={skills.speaking.length} total={17} />
        </div>
      </div>

      <FeedbackBox />
    </div>
  );
}

/* ===== Styles ===== */

const card = {
  background: "#fff",
  padding: 22,
  borderRadius: 14,
  marginBottom: 16,
  border: "1px solid #ece8fb",
  boxShadow: "0 6px 18px rgba(45,37,89,0.08)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: 16,
};

const skillItem = {
  border: "1px solid #ece8fb",
  borderRadius: 10,
  padding: 12,
  background: "#faf8ff",
};

const skillHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
};

const primaryBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #583bc4",
  fontWeight: "bold",
  cursor: "pointer",
  background: "#6c4de6",
  color: "#fff",
};

export default Dashboard;
import { Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";

import FeedbackBox from "../components/FeedbackBox";
import DailyLearning from "../components/DailyLearning";
import { getUserProgress } from "../adapters/progressAdapter";
import { supabase } from "../lib/supabaseClient";
import { isPiAvailable } from "../lib/initPi";

/* ===== Mini Progress ===== */
function MiniProgress({ value = 0, total }) {
  const percent =
    total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div>
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
      <small style={{ color: "#666" }}>{percent}%</small>
    </div>
  );
}

/* ===== Continue Learning Logic ===== */
function getContinueLink() {
  try {
    const completed =
      JSON.parse(localStorage.getItem("READING_COMPLETED")) || [];

    const level = "A1";

    let nextLesson = 1;

    while (
      completed.includes(`${level}-lesson${nextLesson}`)
    ) {
      nextLesson++;
    }

    return `/reading/${level}/lesson${nextLesson}`;
  } catch {
    return "/reading/A1/lesson1";
  }
}

function Dashboard() {

  const progress = useMemo(() => getUserProgress(), []);
  const continueLink = useMemo(() => getContinueLink(), []);

  const [reviewCount, setReviewCount] = useState(0);

  const assessment = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("level_assessment_result")
      );
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    loadReviewCount();
  }, []);

  async function loadReviewCount() {

    try {

      let userId;

      if (isPiAvailable()) {

        userId = localStorage.getItem("pi_uid");

        if (!userId) {
          setReviewCount(0);
          return;
        }

      } else {

        userId = "dev-user";

      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("vocab_progress")
        .select("id")
        .eq("user_id", userId)
        .lte("next_review", now);

      if (!error) {
        setReviewCount(data?.length || 0);
      }

    } catch (err) {

      console.warn("Review count load failed:", err);
      setReviewCount(0);

    }

  }

  const skills = {
    grammar: progress.skills?.grammar || [],
    vocabulary: progress.skills?.vocabulary || [],
    listening: progress.skills?.listening || [],
    reading: progress.skills?.reading || [],
    speaking: progress.skills?.speaking || [],
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      <h2>🏠 Home</h2>

      <p style={{ color: "#666", marginBottom: 24 }}>
        Welcome back. Let’s continue your journey.
      </p>

      <DailyLearning />

      {/* Daily Review */}
      <div style={card}>

        <h3>🔁 Daily Review</h3>

        <p>
          {reviewCount > 0
            ? <>You have <strong>{reviewCount}</strong> reviews waiting today.</>
            : "You're all caught up for now 🎉"}
        </p>

        <Link to="/review">
          <button style={primaryBtn}>
            Start Daily Review
          </button>
        </Link>

      </div>

      {/* Continue Learning */}
      <div style={card}>
        <h3>▶ Continue Learning</h3>

        <p>
          Jump back into your last lesson and keep improving.
        </p>

        <Link to={continueLink}>
          <button style={primaryBtn}>
            Continue Lesson
          </button>
        </Link>
      </div>

      {/* Assessment */}
      <div style={cardHero}>
        <h3>🎯 Level Assessment</h3>

        {assessment ? (
          <>
            <p>
              Your current level: <strong>{assessment.level}</strong>
            </p>

            <p style={{ color: "#555" }}>
              Based on {assessment.questionsAnswered} questions
            </p>

            <div style={{ display: "flex", gap: 10 }}>

              <Link to="/dashboard">
                <button style={primaryBtn}>
                  Start from your level
                </button>
              </Link>

              <Link to="/assessment">
                <button style={secondaryBtn}>
                  Re-assess
                </button>
              </Link>

            </div>
          </>
        ) : (
          <>
            <p>
              You haven’t taken the level assessment yet.
            </p>

            <Link to="/assessment">
              <button style={primaryBtn}>
                Take assessment
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Skills */}
      <div style={card}>

        <h3>📚 Your Skills</h3>

        <div style={grid}>

          <div>
            <strong>Grammar</strong>
            <MiniProgress value={skills.grammar.length} total={5} />
          </div>

          <div>
            <strong>Vocabulary</strong>
            <MiniProgress value={skills.vocabulary.length} total={20} />
          </div>

          <div>
            <strong>Listening</strong>
            <MiniProgress value={skills.listening.length} total={42} />
          </div>

          <div>
            <strong>Reading</strong>
            <MiniProgress value={skills.reading.length} total={17} />
          </div>

          <div>
            <strong>Speaking</strong>
            <MiniProgress value={skills.speaking.length} total={17} />
          </div>

        </div>

      </div>

      {/* Recommendation */}
      <div style={card}>
        <h3>➡️ What’s next?</h3>

        <p>
          We recommend continuing with <strong>Grammar</strong>.
        </p>

        <Link to="/grammar">
          <button style={primaryBtn}>
            Go to Grammar
          </button>
        </Link>
      </div>

      <FeedbackBox />

    </div>
  );
}

/* ===== Styles ===== */

const card = {
  background: "#fff",
  padding: 20,
  borderRadius: 14,
  marginBottom: 20,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const cardHero = {
  ...card,
  background: "linear-gradient(135deg,#f8f6ff,#ffffff)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: 16,
};

const primaryBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  background: "#4A90E2",
  color: "#fff",
};

const secondaryBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #4A90E2",
  fontWeight: "bold",
  cursor: "pointer",
  background: "#fff",
  color: "#4A90E2",
};

export default Dashboard;
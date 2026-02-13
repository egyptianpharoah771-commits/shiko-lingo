import { Link } from "react-router-dom";
import { useMemo } from "react";

import FeedbackBox from "../components/FeedbackBox";
import { getUserProgress } from "../adapters/progressAdapter";

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

function Dashboard() {
  const progress = useMemo(() => getUserProgress(), []);

  const assessment = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("level_assessment_result")
      );
    } catch {
      return null;
    }
  }, []);

  /* 🛡️ Defensive skills mapping */
  const skills = {
    grammar: progress.skills?.grammar || [],
    vocabulary: progress.skills?.vocabulary || [],
    listening: progress.skills?.listening || [],
    reading: progress.skills?.reading || [],
    speaking: progress.skills?.speaking || [],
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* ===== Header ===== */}
      <h2>🏠 Home</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Welcome back. Let’s continue your journey.
      </p>

      {/* ===== Assessment Hero ===== */}
      <div style={cardHero}>
        <h3>🎯 Level Assessment</h3>

        {assessment ? (
          <>
            <p>
              Your current level:{" "}
              <strong>{assessment.level}</strong>
            </p>
            <p style={{ color: "#555" }}>
              Based on {assessment.questionsAnswered}{" "}
              questions
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

      {/* ===== Skills Snapshot ===== */}
      <div style={card}>
        <h3>📚 Your Skills</h3>

        <div style={grid}>
          <div>
            <strong>Grammar</strong>
            <MiniProgress
              value={skills.grammar.length}
              total={5}
            />
          </div>

          <div>
            <strong>Vocabulary</strong>
            <MiniProgress
              value={skills.vocabulary.length}
              total={20}
            />
          </div>

          <div>
            <strong>Listening</strong>
            <MiniProgress
              value={skills.listening.length}
              total={42}
            />
          </div>

          <div>
            <strong>Reading</strong>
            <MiniProgress
              value={skills.reading.length}
              total={17}
            />
          </div>

          <div>
            <strong>Speaking</strong>
            <MiniProgress
              value={skills.speaking.length}
              total={17}
            />
          </div>
        </div>
      </div>

      {/* ===== What’s Next ===== */}
      <div style={card}>
        <h3>➡️ What’s next?</h3>
        <p>
          We recommend continuing with{" "}
          <strong>Grammar</strong> to strengthen your
          foundation.
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
  background:
    "linear-gradient(135deg,#f8f6ff,#ffffff)",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(160px,1fr))",
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

import { useNavigate } from "react-router-dom";

function SkillCard({ icon, title, description, path }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      style={{
        cursor: "pointer",
        border: "1px solid #ece8fb",
        borderRadius: 16,
        padding: 24,
        background: "#fff",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 12px rgba(45,37,89,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 10px 22px rgba(45,37,89,0.12)";
        e.currentTarget.style.borderColor = "#d8cbff";
        e.currentTarget.style.background = "#fcfbff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(45,37,89,0.06)";
        e.currentTarget.style.borderColor = "#ece8fb";
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>

      <div
        style={{
          fontWeight: "bold",
          fontSize: 18,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div style={{ fontSize: 14, color: "#666" }}>
        {description}
      </div>
    </div>
  );
}

function LearnPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 10 }}>Learn English</h1>

      <p style={{ marginBottom: 30, color: "#666" }}>
        Pick a skill and keep your progress moving every day.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <SkillCard
          icon="📚"
          title="Vocabulary"
          description="Learn new words and expressions."
          path="/vocabulary"
        />

        <SkillCard
          icon="📘"
          title="Grammar"
          description="Understand English grammar step by step."
          path="/grammar"
        />

        <SkillCard
          icon="📖"
          title="Reading"
          description="Improve comprehension through stories."
          path="/reading"
        />

        <SkillCard
          icon="🎧"
          title="Listening"
          description="Train your ears with real English."
          path="/listening"
        />

        <SkillCard
          icon="🗣"
          title="Speaking"
          description="Practice pronunciation and speaking."
          path="/speaking"
        />

        <SkillCard
          icon="✍️"
          title="Writing"
          description="Build your writing skills."
          path="/writing"
        />
      </div>
    </div>
  );
}

export default LearnPage;



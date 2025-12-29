import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ======================
   OpenAI Client
====================== */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ======================
   AI Packages & Limits
====================== */
/*
  FREE → 3 requests / day
  PRO  → unlimited
*/
const AI_LIMITS = {
  FREE: 3,
  PRO: Infinity,
};

/* ======================
   In-memory Usage Store
   (TEMP – later DB)
====================== */
// usage[userId_date] = count
const aiUsage = {};

const todayKey = () =>
  new Date().toISOString().slice(0, 10);

/* ======================
   Helpers
====================== */
function checkAndConsumeAI({
  userId,
  packageName,
}) {
  // PRO → unlimited
  if (packageName === "PRO") {
    return { allowed: true };
  }

  const key = `${userId}_${todayKey()}`;
  aiUsage[key] = aiUsage[key] || 0;

  if (aiUsage[key] >= AI_LIMITS.FREE) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  aiUsage[key] += 1;

  return {
    allowed: true,
    remaining: AI_LIMITS.FREE - aiUsage[key],
  };
}

/* ======================
   Health Check
====================== */
app.get("/", (req, res) => {
  res.send("✅ Shiko Lingo Backend is running");
});

/* ======================
   AI Tutor Endpoint
====================== */
app.post("/api/ai/tutor", async (req, res) => {
  const {
    skill,
    level,
    lessonTitle,
    prompt,
    studentText,
    text,
    score,
    total,
    bullets,

    // 🔑 Identity (Phase 3)
    userId = "guest",
    packageName = "FREE",
  } = req.body;

  /* ===== Validate ===== */
  if (
    !studentText &&
    !text &&
    typeof score === "undefined"
  ) {
    return res.status(400).json({
      status: "ERROR",
      error: "NO_INPUT_PROVIDED",
    });
  }

  const pkg =
    packageName === "PRO" ? "PRO" : "FREE";

  /* ===== Usage Limit ===== */
  const usage = checkAndConsumeAI({
    userId,
    packageName: pkg,
  });

  if (!usage.allowed) {
    return res.status(403).json({
      status: "LIMIT",
      error: "AI_LIMIT_REACHED",
      message:
        "You’ve reached your daily AI limit. Upgrade to PRO for unlimited access.",
      package: pkg,
    });
  }

  /* ===== Build Prompt ===== */
  const systemPrompt =
    "You are a friendly English tutor. Give simple, clear, and helpful feedback. Correct mistakes gently and suggest improvements.";

  const userPrompt = `
Skill: ${skill || ""}
Level: ${level || ""}
Lesson: ${lessonTitle || ""}

Prompt:
${prompt || ""}

Text:
${text || ""}

Student Answer:
${studentText || ""}

Score:
${score || ""}/${total || ""}

Guidelines:
${(bullets || []).join(", ")}

Give feedback:
- Correct mistakes
- Suggest improvements
- Keep it simple
`;

  /* ===== OpenAI Call ===== */
  try {
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
      });

    return res.json({
      status: "SUCCESS",
      message:
        completion.choices[0].message.content,
      remaining: usage.remaining,
      package: pkg,
    });
  } catch (error) {
    console.error("AI ERROR:", error);
    return res.status(500).json({
      status: "ERROR",
      error: "AI_SERVICE_ERROR",
      message: "AI service failed.",
    });
  }
});

/* ======================
   Start Server
====================== */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Shiko Lingo Backend running on http://localhost:${PORT}`
  );
});

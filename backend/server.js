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
const AI_LIMITS = {
  FREE: 3,
  PRO: Infinity,
};

/* ======================
   In-memory Usage Store
====================== */
const aiUsage = {};

const todayKey = () =>
  new Date().toISOString().slice(0, 10);

function checkAndConsumeAI({ userId, packageName }) {
  if (packageName === "PRO") {
    return { allowed: true };
  }

  const key = `${userId}_${todayKey()}`;
  aiUsage[key] = aiUsage[key] || 0;

  if (aiUsage[key] >= AI_LIMITS.FREE) {
    return { allowed: false, remaining: 0 };
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
    userId = "guest",
    packageName = "FREE",
  } = req.body;

  if (!studentText && !text && typeof score === "undefined") {
    return res.status(400).json({
      status: "ERROR",
      error: "NO_INPUT_PROVIDED",
    });
  }

  const pkg = packageName === "PRO" ? "PRO" : "FREE";

  const usage = checkAndConsumeAI({
    userId,
    packageName: pkg,
  });

  if (!usage.allowed) {
    return res.status(403).json({
      status: "LIMIT",
      error: "AI_LIMIT_REACHED",
      message:
        "You’ve reached your daily AI limit. Upgrade to PRO.",
      package: pkg,
    });
  }

  const systemPrompt =
    "You are a friendly English tutor. Give simple, clear, and helpful feedback.";

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
`;

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

    res.json({
      status: "SUCCESS",
      message: completion.choices[0].message.content,
      remaining: usage.remaining,
      package: pkg,
    });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({
      status: "ERROR",
      error: "AI_SERVICE_ERROR",
    });
  }
});

/* ======================================================
   Pi Network – Server Payments (FINAL CHECKLIST STEP)
====================================================== */

const PI_API_BASE = "https://api.minepi.com";

const PI_HEADERS = {
  Authorization: `Key ${process.env.PI_API_KEY}`,
  "Content-Type": "application/json",
};

/* ===== Approve Payment ===== */
app.post("/api/pi/approve", async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({
      error: "PAYMENT_ID_REQUIRED",
    });
  }

  try {
    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: PI_HEADERS,
      }
    );

    const data = await response.json();
    res.json({ status: "APPROVED", data });
  } catch (err) {
    console.error("PI APPROVE ERROR:", err);
    res.status(500).json({
      error: "PI_APPROVE_FAILED",
    });
  }
});

/* ===== Complete Payment ===== */
app.post("/api/pi/complete", async (req, res) => {
  const { paymentId, txid } = req.body;

  if (!paymentId || !txid) {
    return res.status(400).json({
      error: "PAYMENT_ID_AND_TXID_REQUIRED",
    });
  }

  try {
    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: PI_HEADERS,
        body: JSON.stringify({ txid }),
      }
    );

    const data = await response.json();
    res.json({ status: "COMPLETED", data });
  } catch (err) {
    console.error("PI COMPLETE ERROR:", err);
    res.status(500).json({
      error: "PI_COMPLETE_FAILED",
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

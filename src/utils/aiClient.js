// BUILD_ID_2026_01_17_04
import STORAGE_KEYS from "./storageKeys";

/**
 * AI Client
 * ---------
 * - Same-origin API ONLY
 * - No external base URLs
 * - No CORS
 * - Pi Browser safe
 * - Backend already verified
 * - AI used ONLY for lesson feedback enhancement
 */

function buildPrompt(payload) {
  const compactStudentText = (payload.studentText || payload.text || "")
    .toString()
    .trim()
    .slice(0, 800);

  const baseContext = `
Skill: ${payload.skill}
Level: ${payload.level}
Lesson: ${payload.lessonTitle}
Student Input:
${compactStudentText || "No student input provided."}
`.trim();

  switch (payload.skill) {
    case "Grammar":
      return `
${baseContext}

You are an English grammar tutor.

Return feedback in the following exact structure:

Overall Feedback:
- Brief summary of the student's grammar performance.

What You Did Well:
- One or two positive grammar points.

Common Grammar Mistakes:
- Mention common mistakes related to this lesson.

How to Improve:
- Clear and practical tips to improve grammar accuracy.

Rules:
- Do NOT ask questions.
- Do NOT start a conversation.
- Be clear, supportive, and educational.
`.trim();

    case "Reading":
      return `
${baseContext}

You are an English reading comprehension coach.

Return feedback in the following exact structure:

Overall Feedback:
- Brief summary of the student's reading performance.

What You Did Well:
- One or two strengths in comprehension or vocabulary.

Common Reading Mistakes:
- Typical comprehension or interpretation issues.

How to Improve:
- Practical tips to improve reading accuracy and speed.

Rules:
- Do NOT ask questions.
- Do NOT start a conversation.
- Be clear, supportive, and educational.
`.trim();

    case "Speaking":
      return `
${baseContext}

You are an English speaking coach.

Return feedback in the following exact structure:

Overall Feedback:
- Brief summary of the student's speaking performance.

What You Did Well:
- Positive points about pronunciation or fluency.

Common Speaking Mistakes:
- Typical pronunciation or fluency issues.

How to Improve:
- Simple and practical tips to improve spoken English.

Rules:
- Do NOT ask questions.
- Do NOT start a conversation.
- Be supportive and confidence-building.
`.trim();

    case "Writing":
      return `
${baseContext}

You are an English writing tutor.

Return feedback in the following exact structure:

Overall Feedback:
- Brief summary of the student's writing quality.

What You Did Well:
- Strengths in structure, clarity, or grammar.

Common Writing Mistakes:
- Typical sentence or organization issues.

How to Improve:
- Practical tips to improve writing quality and clarity.

Rules:
- Do NOT ask questions.
- Do NOT start a conversation.
- Be clear, supportive, and educational.
`.trim();

    default:
      return `
${baseContext}

Return feedback in the following exact structure:

Overall Feedback:
- Brief summary of the student's performance.

What You Did Well:
- One or two positive points.

Areas to Improve:
- Key areas that need improvement.

Next Steps:
- Practical advice for future lessons.

Rules:
- Do NOT ask questions.
- Do NOT start a conversation.
- Be clear, supportive, and educational.
`.trim();
  }
}

const LOCAL_AI_LIMITS = {
  DAILY_PER_SKILL: 3,
  COOLDOWN_MS: 60 * 1000,
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function checkLocalAiLimits(skill) {
  const key = STORAGE_KEYS.AI_FEEDBACK_USAGE;
  const today = getTodayKey();
  let usage = {};

  try {
    usage = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    usage = {};
  }

  const skillEntry = usage?.[today]?.[skill] || { count: 0, lastAt: 0 };
  const now = Date.now();

  if (now - skillEntry.lastAt < LOCAL_AI_LIMITS.COOLDOWN_MS) {
    return {
      allowed: false,
      reason: "cooldown",
      waitMs: LOCAL_AI_LIMITS.COOLDOWN_MS - (now - skillEntry.lastAt),
    };
  }

  if (skillEntry.count >= LOCAL_AI_LIMITS.DAILY_PER_SKILL) {
    return { allowed: false, reason: "daily_limit", waitMs: 0 };
  }

  return { allowed: true };
}

function registerLocalAiUsage(skill) {
  const key = STORAGE_KEYS.AI_FEEDBACK_USAGE;
  const today = getTodayKey();
  let usage = {};

  try {
    usage = JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    usage = {};
  }

  if (!usage[today]) usage[today] = {};
  if (!usage[today][skill]) usage[today][skill] = { count: 0, lastAt: 0 };

  usage[today][skill].count += 1;
  usage[today][skill].lastAt = Date.now();

  localStorage.setItem(key, JSON.stringify(usage));
}

export async function askAITutor(payload) {
  try {
    const localGate = checkLocalAiLimits(payload.skill || "General");
    if (!localGate.allowed) {
      if (localGate.reason === "cooldown") {
        const seconds = Math.ceil(localGate.waitMs / 1000);
        return {
          status: "LIMIT",
          message: `Please wait ${seconds}s before requesting AI feedback again.`,
        };
      }
      return {
        status: "LIMIT",
        message: "You reached today's AI feedback limit for this skill.",
      };
    }

    const question = buildPrompt(payload);

    const res = await fetch("/api/ai/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        question,
        userId: payload.userId,
        packageName: payload.packageName,
      }),
    });

    const data = await res.json();

    if (res.status === 403) {
      return {
        status: "LIMIT",
        message:
          data.message ||
          "AI feedback limit reached.",
        usage: data.usage || null,
      };
    }

    if (res.ok) {
      registerLocalAiUsage(payload.skill || "General");
      return {
        status: "SUCCESS",
        message:
          data.answer ||
          data.message ||
          "AI feedback is ready.",
        usage: data.usage || null,
      };
    }

    return {
      status: "ERROR",
      message:
        data.message ||
        "AI service error.",
    };
  } catch (err) {
    console.error("❌ AI CLIENT ERROR:", err);
    return {
      status: "ERROR",
      message:
        "Cannot connect to AI service.",
    };
  }
}



// BUILD_ID_2026_01_17_02

/**
 * AI Client
 * ---------
 * - Same-origin API ONLY
 * - No external base URLs
 * - No CORS
 * - Pi Browser safe
 * - Backend already verified
 */

export async function askAITutor(payload) {
  try {
    // 🔑 Build a single question for backend
    const question = `
Skill: ${payload.skill}
Level: ${payload.level}
Lesson: ${payload.lessonTitle}

Lesson Text:
${payload.text}

Score: ${payload.score}/${payload.total}

Please give helpful feedback to the student.
    `.trim();

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

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // 🔒 AI limit
    if (res.status === 403) {
      return {
        status: "LIMIT",
        message:
          data.message ||
          "AI limit reached for your plan.",
        usage: data.usage || null,
      };
    }

    // ✅ SUCCESS — guaranteed non-empty message
    if (res.ok) {
      return {
        status: "SUCCESS",
        message:
          data.answer ||
          data.message ||
          "AI feedback received successfully.",
        usage: data.usage || null,
      };
    }

    // ❌ Known backend error
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

/**
 * AI Client
 * ---------
 * - Same-origin API (/api/ai/tutor)
 * - Safe JSON parsing
 * - Supports multiple backend response formats
 * - Pi Browser & Production safe
 */

export async function askAITutor(payload) {
  try {
    const res = await fetch("/api/ai/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // 🔐 AI limit
    if (res.status === 403) {
      return {
        status: "LIMIT",
        message:
          data.message ||
          data.error ||
          "AI limit reached for your plan.",
        usage: data.usage || null,
      };
    }

    // ✅ Success
    if (res.ok) {
      return {
        status: "SUCCESS",
        message:
          data.message ||
          data.answer || // 👈 ده المهم
          data.text ||
          "",
        usage: data.usage || null,
      };
    }

    // ❌ Known error
    return {
      status: "ERROR",
      message:
        data.message ||
        data.error ||
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

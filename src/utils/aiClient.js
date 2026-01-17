// BUILD_ID_2026_01_17_02

/**
 * AI Client
 * ---------
 * - Same-origin API ONLY
 * - No external base URLs
 * - No CORS
 * - Cache-bust enforced
 * - Pi Browser safe
 */

export async function askAITutor(payload) {
  try {
    const res = await fetch("/api/ai/tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

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

    if (res.ok) {
      return {
        status: "SUCCESS",
        message:
          data.answer ||
          data.message ||
          data.text ||
          "",
        usage: data.usage || null,
      };
    }

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

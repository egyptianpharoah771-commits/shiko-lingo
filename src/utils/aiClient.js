/**
 * AI Client
 * ---------
 * - Centralized API base URL
 * - Handles AI limits & responses
 * - Identity passed explicitly (from useFeatureAccess)
 * - Cloudflare / Pi Browser safe
 */

import { API_BASE_URL } from "./apiConfig";

/**
 * Ask AI Tutor
 * -------------
 * payload must include:
 * - skill
 * - level
 * - lessonTitle
 * - prompt / text / studentText / bullets / etc
 * - userId
 * - packageName
 */
export async function askAITutor(payload) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/ai/tutor`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // 🔐 Safely parse JSON
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    /* ===== AI limit reached ===== */
    if (res.status === 403) {
      return {
        status: "LIMIT",
        message:
          data.message ||
          "AI limit reached for your plan.",
        usage: data.usage || null,
      };
    }

    /* ===== Success ===== */
    if (res.ok) {
      return {
        status: "SUCCESS",
        message: data.message || "OK",
        usage: data.usage || null,
      };
    }

    /* ===== Known error ===== */
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

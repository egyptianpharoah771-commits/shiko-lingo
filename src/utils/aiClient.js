/**
 * AI Client
 * ---------
 * - Centralized API base URL
 * - Handles AI limits & responses
 * - Identity passed explicitly (from useFeatureAccess)
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

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
        message: data.message,
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
    return {
      status: "ERROR",
      message:
        "Cannot connect to AI service.",
    };
  }
}

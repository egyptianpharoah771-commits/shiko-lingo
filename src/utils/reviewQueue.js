import { supabase } from "../lib/supabaseClient";

/* =========================
   Daily Review Queue
========================= */

export async function getDailyReviewQueue(userId, limit = 20) {
  const uid = userId || "dev-user";

  const now = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from("vocab_progress")
      .select("*")
      .eq("user_id", uid)
      .lte("next_review", now)
      .order("stage", { ascending: true })
      .order("next_review", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Review queue error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Review queue exception:", err);
    return [];
  }
}
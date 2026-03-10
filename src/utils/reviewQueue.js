import { supabase } from "../lib/supabaseClient";

export async function getDailyReviewQueue(userId) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review", now)
    .order("next_review", { ascending: true })
    .limit(20);

  if (error) {
    console.error("Review queue error:", error);
    return [];
  }

  return data || [];
}
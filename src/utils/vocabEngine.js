import { supabase } from "../lib/supabaseClient";

/* =========================
   Vocabulary Engine
   Supabase Version
========================= */

export async function saveWordToDB(userId, word) {
  if (!userId || !word) return;

  const cleanWord = word.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("word", cleanWord)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("vocab_progress")
    .insert([
      {
        user_id: userId,
        word: cleanWord,
        stage: 0,
        review_count: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Save word error:", error);
    return null;
  }

  return data;
}

/* =========================
   Get User Words
========================= */

export async function getUserWords(userId) {
  const { data, error } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Get words error:", error);
    return [];
  }

  return data || [];
}

/* =========================
   Update Word Stage
========================= */

export async function updateWordStage(userId, word, delta) {
  const cleanWord = word.toLowerCase().trim();

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("word", cleanWord)
    .maybeSingle();

  if (!existing) return;

  let newStage = existing.stage + delta;

  if (newStage < 0) newStage = 0;
  if (newStage > 3) newStage = 3;

  const { error } = await supabase
    .from("vocab_progress")
    .update({
      stage: newStage,
      review_count: existing.review_count + 1,
      updated_at: new Date(),
    })
    .eq("id", existing.id);

  if (error) {
    console.error("Stage update error:", error);
  }
}

/* =========================
   Get Words For Review
========================= */

export async function getWordsForReview(userId, limit = 10) {
  const { data, error } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", userId)
    .order("stage", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Review fetch error:", error);
    return [];
  }

  return data || [];
}
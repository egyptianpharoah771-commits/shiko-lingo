import { supabase } from "../lib/supabaseClient";
import { getNextReview } from "../vocabulary/spacedRepetition";

/* =========================
Vocabulary Engine
Supabase Version
========================= */

/* =========================
Normalize Word Data
Guarantees usable prompt
========================= */

function normalizeWord(row) {
  if (!row) return row;

  const definition =
    row.definition ||
    row.meaning ||
    row.translation ||
    row.word;

  const example =
    row.example ||
    `${row.word} means "${definition}".`;

  return {
    ...row,
    definition,
    example
  };
}

/* =========================
Safe Fallback (CRITICAL FIX)
========================= */

function safeNextReview(stage, isCorrect) {
  try {
    return getNextReview(stage, isCorrect);
  } catch (e) {
    console.warn("Fallback spaced repetition used");

    const nextStage = isCorrect
      ? Math.min((stage || 0) + 1, 4)
      : 0;

    const delayMinutes = [0, 5, 30, 180, 1440][nextStage] || 5;

    const nextReview = new Date(
      Date.now() + delayMinutes * 60000
    ).toISOString();

    return { nextStage, nextReview };
  }
}

/* =========================
Save Word
========================= */

export async function saveWordToDB(userId, word, definition = "") {

  if (!word) return null;

  const cleanWord = word.toLowerCase().trim();
  if (!cleanWord) return null;

  const uid = userId || "dev-user";

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("id")
    .eq("user_id", uid)
    .eq("word", cleanWord)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const immediateReview =
    new Date(Date.now() - 1000).toISOString();

  const { data, error } = await supabase
    .from("vocab_progress")
    .insert([
      {
        user_id: uid,
        word: cleanWord,
        definition: definition || cleanWord,
        stage: 0,
        review_count: 0,
        correct_count: 0,
        wrong_count: 0,
        next_review: immediateReview,
        last_review: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Save word error:", error);
    return null;
  }

  return normalizeWord(data);
}

/* =========================
Get User Words
========================= */

export async function getUserWords(userId) {

  const uid = userId || "dev-user";

  const { data, error } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Get words error:", error);
    return [];
  }

  return (data || []).map(normalizeWord);
}

/* =========================
Update Word Stage
========================= */

export async function updateWordStage(userId, word, isCorrect) {

  if (!word) return;

  const cleanWord = word.toLowerCase().trim();
  const uid = userId || "dev-user";

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", uid)
    .eq("word", cleanWord)
    .maybeSingle();

  if (!existing) return;

  const { nextStage, nextReview } =
    safeNextReview(existing.stage, isCorrect);

  const { error } = await supabase
    .from("vocab_progress")
    .update({
      stage: nextStage,
      review_count: existing.review_count + 1,
      correct_count: isCorrect
        ? existing.correct_count + 1
        : existing.correct_count,
      wrong_count: !isCorrect
        ? existing.wrong_count + 1
        : existing.wrong_count,
      next_review: nextReview,
      last_review: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", existing.id);

  if (error) {
    console.error("Stage update error:", error);
  }

}

/* =========================
Get Words For Review
========================= */

export async function getWordsForReview(userId, limit = 20) {

  const uid = userId || "dev-user";

  const now =
    new Date(Date.now() + 60000).toISOString();

  const { data, error } = await supabase
    .from("vocab_progress")
    .select("*")
    .eq("user_id", uid)
    .lte("next_review", now)
    .order("next_review", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Review fetch error:", error);
    return [];
  }

  return (data || []).map(normalizeWord);
}
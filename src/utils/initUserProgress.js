import { supabase } from "../lib/supabaseClient";

export async function initUserProgress(userId) {
  if (!userId) return;

  try {
    console.log("🚀 INIT START for:", userId);

    // =========================
    // 1️⃣ Check existing
    // =========================
    const { count, error: countError } = await supabase
      .from("vocab_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("❌ COUNT ERROR:", countError);
      return;
    }

    if (count > 0) {
      console.log("✅ Already initialized:", count);
      return;
    }

    // =========================
    // 2️⃣ Load words
    // =========================
    const { data: words, error: wordsError } = await supabase
      .from("words")
      .select("id")
      .limit(50);

    if (wordsError || !words || words.length === 0) {
      console.error("❌ WORD LOAD ERROR:", wordsError);
      return;
    }

    console.log("📚 WORDS:", words.length);

    const now = new Date().toISOString();

    const rows = words.map((w) => ({
      user_id: userId,
      word_id: w.id,
      stage: 0,
      interval: 0,
      ease_factor: 2.5,
      next_review: now,
      created_at: now,
      updated_at: now,
    }));

    // =========================
    // 3️⃣ Insert with protection
    // =========================
    const { data: inserted, error: insertError } = await supabase
      .from("vocab_progress")
      .insert(rows, { ignoreDuplicates: true })
      .select();

    console.log("🧪 INSERT RESULT:", inserted);
    console.log("🧪 INSERT ERROR:", insertError);

    // =========================
    // 4️⃣ Hard fallback (لو insert فشل)
    // =========================
    if (insertError) {
      console.warn("⚠️ Trying fallback single insert...");

      const safeRows = rows.slice(0, 5); // عدد صغير

      const fallback = await supabase
        .from("vocab_progress")
        .insert(safeRows)
        .select();

      console.log("🧪 FALLBACK RESULT:", fallback.data);
      console.log("🧪 FALLBACK ERROR:", fallback.error);
    }

    console.log("🔥 INIT DONE");

  } catch (err) {
    console.error("❌ INIT CRASH:", err);
  }
}



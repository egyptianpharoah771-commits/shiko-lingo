import { supabase } from "../lib/supabaseClient";

function resolveUserId(user) {
  if (user?.id) return user.id;

  const piUid = localStorage.getItem("pi_uid");
  if (piUid) return piUid;

  try {
    const raw = localStorage.getItem("shiko_pi_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || null;
  } catch {
    return null;
  }
}

export async function saveCoachSessionResult({
  user,
  level,
  score,
  totalQuestions,
}) {
  const userId = resolveUserId(user);
  if (!userId) return { skipped: true };

  const payload = {
    user_id: userId,
    level: (level || "A1").toUpperCase(),
    score,
    total_questions: totalQuestions,
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("coach_session_results").insert(payload);

  if (error) {
    console.error("saveCoachSessionResult error:", error);
    return { error };
  }

  return { ok: true };
}

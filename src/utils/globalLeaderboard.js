import { supabase } from "../lib/supabaseClient";

export async function updateGlobalXP(userId, xp) {
  if (!userId) return;

  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(error);
      return;
    }

    if (data) {
      await supabase
        .from("leaderboard")
        .update({
          xp,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("leaderboard")
        .insert({
          user_id: userId,
          xp,
          updated_at: new Date().toISOString()
        });
    }

  } catch (e) {
    console.error("Global XP error:", e);
  }
}

export async function getGlobalLeaderboard() {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("xp", { ascending: false })
      .limit(50);

    if (error) {
      console.error(error);
      return [];
    }

    return data || [];

  } catch (e) {
    console.error(e);
    return [];
  }
}



import { supabase } from "../lib/supabaseClient";

const ANNOUNCEMENTS_TABLE = "announcements";

function isMissingTableError(error) {
  return error?.code === "42P01";
}

export async function fetchActiveAnnouncements(limit = 3) {
  const { data, error } = await supabase
    .from(ANNOUNCEMENTS_TABLE)
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTableError(error)) {
      return { data: [], error: null, missingTable: true };
    }
    return { data: [], error, missingTable: false };
  }

  const nowMs = Date.now();
  const activeByTime = (data || []).filter((row) => {
    const startsAtMs = row?.starts_at ? Date.parse(row.starts_at) : null;
    const endsAtMs = row?.ends_at ? Date.parse(row.ends_at) : null;

    const startsOk = startsAtMs == null || startsAtMs <= nowMs;
    const endsOk = endsAtMs == null || endsAtMs >= nowMs;
    return startsOk && endsOk;
  });

  return {
    data: activeByTime.slice(0, limit),
    error: null,
    missingTable: false,
  };
}

export async function fetchAllAnnouncements() {
  const { data, error } = await supabase
    .from(ANNOUNCEMENTS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      return { data: [], error: null, missingTable: true };
    }
    return { data: [], error, missingTable: false };
  }

  return { data: data || [], error: null, missingTable: false };
}

export async function createAnnouncement(payload) {
  const { data, error } = await supabase
    .from(ANNOUNCEMENTS_TABLE)
    .insert([payload])
    .select()
    .single();

  return { data, error };
}

export async function updateAnnouncement(id, patch) {
  const { data, error } = await supabase
    .from(ANNOUNCEMENTS_TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase
    .from(ANNOUNCEMENTS_TABLE)
    .delete()
    .eq("id", id);

  return { error };
}

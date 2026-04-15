import { supabase } from "../lib/supabaseClient";

const TABLE = "user_feedback";

export async function submitFeedback({ section, message, page, userId }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([
      {
        section: section || "General",
        message,
        page: page || null,
        user_id: userId || null,
        is_read: false,
      },
    ])
    .select()
    .single();

  return { data, error };
}

export async function fetchAllFeedback() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data || [], error };
}

export async function markFeedbackRead(id) {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_read: true })
    .eq("id", id);

  return { error };
}

export async function markAllFeedbackRead() {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_read: true })
    .eq("is_read", false);

  return { error };
}

export async function updateAdminNote(id, adminNote) {
  const { error } = await supabase
    .from(TABLE)
    .update({ admin_note: adminNote })
    .eq("id", id);

  return { error };
}

export async function deleteFeedback(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}

export async function deleteAllFeedback() {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  return { error };
}

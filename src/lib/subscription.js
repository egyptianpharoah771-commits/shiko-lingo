import { supabase } from "./supabaseClient";

export async function activateSubscription(user_id) {
  const expires_at = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id,
        plan: "MONTHLY",
        expires_at,
        updated_at: new Date(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Subscription error:", error);
    throw error;
  }
}



import { supabase } from "../lib/supabaseClient";

/*
Daily Review Queue
Stable Version
*/

export async function getDailyReviewQueue(userId, limit = 20) {

if (!userId) {
return [];
}

const now = new Date(Date.now() + 5 * 60 * 1000).toISOString();

const { data, error } = await supabase
.from("vocab_progress")
.select("*")
.eq("user_id", userId)
.lte("next_review", now)
.order("next_review", { ascending: true })
.limit(limit);

if (error) {
console.error(error);
return [];
}

return data || [];
}

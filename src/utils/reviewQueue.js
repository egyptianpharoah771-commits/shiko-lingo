import { supabase } from "../lib/supabaseClient";

/*
Daily Review Queue
Production Safe Version
*/

export async function getDailyReviewQueue(userId, limit = 20) {

if (!userId) {
console.warn("ReviewQueue: Missing userId");
return [];
}

const now = new Date().toISOString();

const { data, error } = await supabase
.from("vocab_progress")
.select("*")
.eq("user_id", userId)
.lte("next_review", now)
.order("next_review", { ascending: true })
.limit(limit);

if (error) {
console.error("ReviewQueue Error:", error);
return [];
}

if (!data || data.length === 0) {
console.log("ReviewQueue: No due words");
}

return data || [];
}
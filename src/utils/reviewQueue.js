import { supabase } from "../lib/supabaseClient";

/* =========================
Daily Review Queue
Production Version
========================= */

export async function getDailyReviewQueue(userId, limit = 20) {

/* Require authenticated user */
if (!userId) {
console.warn("Review queue requested without userId");
return [];
}

/* 5-minute buffer prevents timezone / seconds drift issues */
const reviewWindow = new Date(Date.now() + 5 * 60 * 1000).toISOString();

try {

```
const result = await supabase
  .from("vocab_progress")
  .select("*")
  .eq("user_id", userId)
  .lte("next_review", reviewWindow)
  .order("next_review", { ascending: true })
  .order("stage", { ascending: true })
  .limit(limit);

if (result.error) {
  console.error("Review queue error:", result.error);
  return [];
}

if (!result.data || result.data.length === 0) {
  return [];
}

return result.data;
```

} catch (err) {
console.error("Review queue exception:", err);
return [];
}
}

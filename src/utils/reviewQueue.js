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
const { data, error } = await supabase
.from("vocab_progress")
.select("*")
.eq("user_id", userId)
.lte("next_review", reviewWindow)
.order("next_review", { ascending: true })
.order("stage", { ascending: true })
.limit(limit);

```
if (error) {
  console.error("Review queue error:", error);
  return [];
}

if (!data || data.length === 0) {
  return [];
}

return data;
```

} catch (err) {
console.error("Review queue exception:", err);
return [];
}
}

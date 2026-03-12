import { supabase } from "../lib/supabaseClient";

/* =========================
Daily Review Queue
Production Version
========================= */

export async function getDailyReviewQueue(userId, limit = 20) {

if (!userId) {
console.warn("Review queue requested without userId");
return [];
}

try {

```
const now = new Date(Date.now() + 5 * 60 * 1000).toISOString();

const response = await supabase
  .from("vocab_progress")
  .select("*")
  .eq("user_id", userId)
  .lte("next_review", now)
  .order("next_review", { ascending: true })
  .order("stage", { ascending: true })
  .limit(limit);

if (response.error) {
  console.error("Review queue error:", response.error);
  return [];
}

return response.data || [];
```

} catch (err) {
console.error("Review queue exception:", err);
return [];
}
}

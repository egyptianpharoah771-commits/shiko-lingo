import { supabase } from "../lib/supabaseClient";

/* =========================
Daily Review Queue
Stable Version
========================= */

export async function getDailyReviewQueue(userId, limit = 20) {
const uid = userId || "dev-user";

/* Buffer to avoid timezone edge cases */
const now = new Date(Date.now() + 60000).toISOString();

try {
const response = await supabase
.from("vocab_progress")
.select("*")
.eq("user_id", uid)
.lte("next_review", now)
.order("next_review", { ascending: true })
.order("stage", { ascending: true })
.limit(limit);

```
if (response.error) {
  console.error("Review queue error:", response.error);
  return [];
}

if (!response.data || response.data.length === 0) {
  return [];
}

return response.data;
```

} catch (err) {
console.error("Review queue exception:", err);
return [];
}
}

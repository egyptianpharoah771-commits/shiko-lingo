import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getDailyReviewQueue } from "../utils/reviewQueue";

export default function ReviewWordsPage() {

const [words, setWords] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
loadWords();
}, []);

async function loadWords() {

```
try {

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error);
    setWords([]);
    return;
  }

  const user = data?.user;

  if (!user) {
    console.warn("User not logged in");
    setWords([]);
    return;
  }

  const queue = await getDailyReviewQueue(user.id);

  console.log("Review queue:", queue);

  setWords(queue || []);

} catch (err) {

  console.error("Load review error:", err);
  setWords([]);

} finally {

  setLoading(false);

}
```

}

if (loading) {
return <div>Loading review words...</div>;
}

if (!words.length) {
return (
<div style={{ padding: 40, textAlign: "center" }}>
No words to review today </div>
);
}

return (
<div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>

```
  <h2>Daily Vocabulary Review</h2>

  {words.map((w) => (
    <div
      key={w.id}
      style={{
        padding: 12,
        borderBottom: "1px solid #eee"
      }}
    >
      <strong>{w.word}</strong>
      <div style={{ color: "#666" }}>
        {w.definition}
      </div>
    </div>
  ))}

</div>
```

);
}

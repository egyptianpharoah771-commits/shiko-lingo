function normalize(text) {
  return text?.toLowerCase().trim();
}

/**
 * Fisher-Yates Shuffle (Stable)
 */
function shuffle(arr) {
  const array = [...arr];

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

/**
 * Deduplicate definitions safely
 */
function getUniqueDefinitions(words) {
  const map = new Map();

  for (const w of words) {
    if (!w?.definition) continue;

    const norm = normalize(w.definition);
    if (!norm) continue;

    // keep first occurrence only
    if (!map.has(norm)) {
      map.set(norm, w.definition);
    }
  }

  return Array.from(map.values());
}

/**
 * MCQ Generator — Stable, Deterministic Fallback, No Empty State
 */
export function generateMCQOptions(currentWord, words) {
  if (!currentWord || !currentWord.definition || !words?.length) return [];

  const correct = currentWord.definition;
  const normalizedCorrect = normalize(correct);

  // 🟢 Clean pool
  const filtered = words.filter((w) => {
    if (!w || !w.definition) return false;
    if (w.id === currentWord.id) return false;

    return normalize(w.definition) !== normalizedCorrect;
  });

  // 🧠 Unique pool
  const uniquePool = getUniqueDefinitions(filtered);

  // 🔥 Fallback: لو مفيش بيانات كفاية → رجع سؤال TYPE بدل crash
  if (uniquePool.length < 3) {
    return [correct]; // 👈 signal للـ engine إنه مش MCQ
  }

  const distractors = shuffle(uniquePool).slice(0, 3);

  const options = shuffle([correct, ...distractors]);

  // 🛡 Safety guard
  if (options.length !== 4) {
    return [correct];
  }

  return options;
}
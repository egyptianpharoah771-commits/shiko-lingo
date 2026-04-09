// src/utils/mcqGenerator.js

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
 * Deduplicate definitions safely (supports simple_definition)
 */
function getUniqueDefinitions(words) {
  const map = new Map();

  for (const w of words) {
    const def = w?.simple_definition || w?.definition;
    if (!def) continue;

    const norm = normalize(def);
    if (!norm) continue;

    if (!map.has(norm)) {
      map.set(norm, def);
    }
  }

  return Array.from(map.values());
}

/**
 * MCQ Generator — Stable, Supports DB schema, No Empty State
 */
export function generateMCQOptions(currentWord, words) {
  if (!currentWord || !words?.length) return [];

  const correct =
    currentWord.simple_definition || currentWord.definition;

  if (!correct) return [];

  const normalizedCorrect = normalize(correct);

  // 🟢 Clean pool
  const filtered = words.filter((w) => {
    if (!w) return false;

    const def = w.simple_definition || w.definition;
    if (!def) return false;

    if (w.id === currentWord.id) return false;

    return normalize(def) !== normalizedCorrect;
  });

  // 🧠 Unique pool
  const uniquePool = getUniqueDefinitions(filtered);

  // 🔥 Fallback: لو مفيش distractors كفاية → TYPE mode
  if (uniquePool.length < 3) {
    return [correct];
  }

  const distractors = shuffle(uniquePool).slice(0, 3);

  const options = shuffle([correct, ...distractors]);

  // 🛡 Safety guard
  if (options.length !== 4) {
    return [correct];
  }

  return options;
}

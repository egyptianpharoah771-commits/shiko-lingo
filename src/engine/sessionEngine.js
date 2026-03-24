// src/engine/sessionEngine.js

function normalize(text) {
  return text?.toLowerCase().trim();
}

/**
 * Filter invalid words (no definition)
 */
function filterValidWords(words) {
  return words.filter((w) => {
    if (!w) return false;

    const def = w.definition || w.meaning;

    if (!def || typeof def !== "string") return false;
    if (def.trim().length < 3) return false;

    return true;
  });
}

/**
 * Rank words by weakness (memory system hook)
 */
function rankWords(words, weakMap = {}) {
  return [...words].sort((a, b) => {
    const wa = weakMap[a.id] || 0;
    const wb = weakMap[b.id] || 0;
    return wb - wa;
  });
}

/**
 * Build fixed-size session (guaranteed)
 */
function buildSession(words, weakMap = {}, sessionSize = 10) {
  if (!Array.isArray(words) || words.length === 0) return [];

  const ranked = rankWords(words, weakMap);
  const session = [];

  // Fill once
  for (let i = 0; i < ranked.length && session.length < sessionSize; i++) {
    session.push(ranked[i]);
  }

  // Repeat if needed
  let i = 0;
  while (session.length < sessionSize) {
    session.push(ranked[i % ranked.length]);
    i++;
  }

  return session;
}

/**
 * Generate MCQ options (safe version)
 */
function generateMCQOptions(currentWord, words) {
  if (!currentWord) return [];

  const correct = currentWord.definition;

  if (!correct) return [];

  const pool = words
    .map((w) => w.definition)
    .filter((d) => d && normalize(d) !== normalize(correct));

  // 🔥 FIX: لازم 3 distractors على الأقل
  if (pool.length < 3) return [];

  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const wrong = pool.slice(0, 3);

  const options = [correct, ...wrong];

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options;
}

/**
 * MAIN ENGINE (WITH DEBUG + FAIL-SAFE)
 */
export function prepareSession(rawWords, weakMap = {}, sessionSize = 10) {
  console.log("🔹 RAW WORDS:", rawWords);

  if (!Array.isArray(rawWords) || rawWords.length === 0) {
    console.log("❌ No raw words received");
    return [];
  }

  // 1. Filter valid data
  const validWords = filterValidWords(rawWords);

  console.log("🔹 VALID WORDS:", validWords);

  if (validWords.length === 0) {
    console.log("❌ All words invalid (no definitions)");
    return [];
  }

  // 2. Build session (guaranteed size)
  const session = buildSession(validWords, weakMap, sessionSize);

  console.log("🔹 SESSION BASE:", session);

  // 3. Attach MCQ options
  const finalSession = session
    .map((word) => {
      const options = generateMCQOptions(word, validWords);

      if (options.length !== 4) {
        console.log("❌ Not enough options for:", word.word);
        return null;
      }

      return {
        id: word.id,
        word: word.word,
        definition: word.definition,
        topic: word.topic,
        level: word.level,
        options
      };
    })
    .filter(Boolean);

  console.log("🔹 FINAL SESSION:", finalSession);

  return finalSession;
}
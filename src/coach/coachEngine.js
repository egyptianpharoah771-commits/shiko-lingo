// ===============================
// 🧠 COACH ENGINE (SUPABASE V3)
// ===============================

import { supabase } from "../lib/supabaseClient";

const SESSION_SIZE = 10;

// ===============================
// 🧠 LOCAL CACHE (PER SESSION)
// ===============================
let profileCache = null;

// ===============================
// 📊 LOAD PROFILE (SUPABASE)
// ===============================
async function loadProfile() {
  if (profileCache) return profileCache;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return {};

  const { data, error } = await supabase
    .from("learning_progress")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Load profile error:", error);
    return {};
  }

  const profile = {};

  data.forEach((row) => {
    profile[row.word_id] = {
      correct: row.correct,
      wrong: row.wrong,
      lastSeen: row.last_seen
        ? new Date(row.last_seen).getTime()
        : null,
    };
  });

  profileCache = profile;

  return profile;
}

// ===============================
// 💾 UPSERT WORD STATS (SUPABASE)
// ===============================
export async function updateWordStats(wordId, isCorrect) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const profile = await loadProfile();

  let current = profile[wordId] || {
    correct: 0,
    wrong: 0,
    lastSeen: null,
  };

  if (isCorrect) current.correct += 1;
  else current.wrong += 1;

  current.lastSeen = Date.now();

  const strength =
    current.correct + current.wrong === 0
      ? 0
      : current.correct / (current.correct + current.wrong);

  // ✅ Update cache immediately (optimistic)
  profileCache[wordId] = current;

  const { error } = await supabase.from("learning_progress").upsert(
    {
      user_id: user.id,
      word_id: wordId,
      correct: current.correct,
      wrong: current.wrong,
      last_seen: new Date(current.lastSeen).toISOString(),
      strength,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,word_id",
    }
  );

  if (error) {
    console.error("Update stats error:", error);
  }
}

// ===============================
// 📊 STRENGTH SCORE
// ===============================
function getWordStrength(data) {
  const correct = data.correct || 0;
  const wrong = data.wrong || 0;

  const total = correct + wrong;
  if (total === 0) return 0;

  return correct / total;
}

// ===============================
// ⏱️ RECENCY SCORE
// ===============================
function getRecencyScore(lastSeen) {
  if (!lastSeen) return 1;

  const hours = (Date.now() - lastSeen) / (1000 * 60 * 60);
  return Math.min(hours / 24, 1);
}

// ===============================
// 🎯 PRIORITY SCORE
// ===============================
function getPriorityScore(word, profile) {
  const data = profile[word.id];

  if (!data) return 1;

  const strength = getWordStrength(data);
  const recency = getRecencyScore(data.lastSeen);

  return (1 - strength) * 0.7 + recency * 0.3;
}

// ===============================
// 📊 SORT BY PRIORITY
// ===============================
function sortByPriority(words, profile) {
  return [...words].sort(
    (a, b) =>
      getPriorityScore(b, profile) - getPriorityScore(a, profile)
  );
}

// ===============================
// 🧠 PICK: WEAK
// ===============================
function pickWeakWords(words, profile) {
  return words
    .filter((w) => {
      const data = profile[w.id];
      if (!data) return false;
      return getWordStrength(data) < 0.6;
    })
    .sort((a, b) => getPriorityScore(b, profile) - getPriorityScore(a, profile))
    .slice(0, SESSION_SIZE);
}

// ===============================
// 🆕 PICK: NEW
// ===============================
function pickNewWords(words, profile) {
  return words
    .filter((w) => !profile[w.id])
    .slice(0, SESSION_SIZE);
}

// ===============================
// 🎯 PICK: MIXED
// ===============================
function pickMixedWords(words, profile) {
  const sorted = sortByPriority(words, profile);

  const selected = [];

  for (let i = 0; i < sorted.length && selected.length < SESSION_SIZE; i++) {
    const w = sorted[i];

    if (!selected.find((s) => s.id === w.id)) {
      selected.push(w);
    }
  }

  return selected;
}

// ===============================
// 🧩 OPTIONS
// ===============================
function generateOptions(correctWord, allWords) {
  const options = [correctWord.definition];

  const shuffled = [...allWords].sort(() => 0.5 - Math.random());

  for (let w of shuffled) {
    if (options.length >= 4) break;

    if (w.definition !== correctWord.definition) {
      options.push(w.definition);
    }
  }

  return options.sort(() => 0.5 - Math.random());
}

// ===============================
// 🎯 QUESTIONS
// ===============================
function generateQuestions(words, allWords) {
  return words.map((word) => ({
    wordId: word.id,
    question: `What is the meaning of "${word.word}"?`,
    correctAnswer: word.definition,
    options: generateOptions(word, allWords),
  }));
}

// ===============================
// 🚀 MAIN (ASYNC)
// ===============================
export async function generateCoachSession(allWords, config = {}) {
  if (!allWords || !allWords.length) return [];

  const profile = await loadProfile();

  const { type = "mixed" } = config;

  let selectedWords = [];

  if (type === "weak") {
    selectedWords = pickWeakWords(allWords, profile);

    if (selectedWords.length < SESSION_SIZE) {
      const fallback = pickMixedWords(allWords, profile);
      selectedWords = [...new Set([...selectedWords, ...fallback])].slice(
        0,
        SESSION_SIZE
      );
    }
  } else if (type === "new") {
    selectedWords = pickNewWords(allWords, profile);

    if (selectedWords.length < SESSION_SIZE) {
      const fallback = pickMixedWords(allWords, profile);
      selectedWords = [...new Set([...selectedWords, ...fallback])].slice(
        0,
        SESSION_SIZE
      );
    }
  } else {
    selectedWords = pickMixedWords(allWords, profile);
  }

  return generateQuestions(selectedWords, allWords);
}
// ===============================
// 🧠 COACH ENGINE (ADVANCED V2)
// ===============================

const SESSION_SIZE = 10;

// ===============================
// 📊 LOAD PROFILE
// ===============================
function getProfile() {
  return JSON.parse(localStorage.getItem("learning_profile") || "{}");
}

// ===============================
// 💾 SAVE PROFILE
// ===============================
function saveProfile(profile) {
  localStorage.setItem("learning_profile", JSON.stringify(profile));
}

// ===============================
// 📈 UPDATE WORD STATS
// ===============================
export function updateWordStats(wordId, isCorrect) {
  const profile = getProfile();

  if (!profile[wordId]) {
    profile[wordId] = {
      correct: 0,
      wrong: 0,
      lastSeen: Date.now(),
    };
  }

  if (isCorrect) {
    profile[wordId].correct += 1;
  } else {
    profile[wordId].wrong += 1;
  }

  profile[wordId].lastSeen = Date.now();

  saveProfile(profile);
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

  if (!data) return 1; // unseen أعلى أولوية

  const strength = getWordStrength(data);
  const recency = getRecencyScore(data.lastSeen);

  return (1 - strength) * 0.7 + recency * 0.3;
}

// ===============================
// 📊 SORT BY PRIORITY
// ===============================
function sortByPriority(words) {
  const profile = getProfile();

  return [...words].sort(
    (a, b) =>
      getPriorityScore(b, profile) - getPriorityScore(a, profile)
  );
}

// ===============================
// 🧠 PICK: WEAK WORDS
// ===============================
function pickWeakWords(words) {
  const profile = getProfile();

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
// 🆕 PICK: NEW WORDS
// ===============================
function pickNewWords(words) {
  const profile = getProfile();

  return words
    .filter((w) => !profile[w.id])
    .slice(0, SESSION_SIZE);
}

// ===============================
// 🎯 PICK: MIXED (DEFAULT)
// ===============================
function pickMixedWords(words) {
  const sorted = sortByPriority(words);

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
// 🧩 GENERATE OPTIONS
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
// 🎯 GENERATE QUESTIONS
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
// 🚀 MAIN FUNCTION (UPGRADED)
// ===============================
export function generateCoachSession(allWords, config = {}) {
  if (!allWords || !allWords.length) return [];

  const { type = "mixed" } = config;

  let selectedWords = [];

  if (type === "weak") {
    selectedWords = pickWeakWords(allWords);

    // fallback لو مفيش كلمات weak كفاية
    if (selectedWords.length < SESSION_SIZE) {
      const fallback = pickMixedWords(allWords);
      selectedWords = [...new Set([...selectedWords, ...fallback])].slice(
        0,
        SESSION_SIZE
      );
    }
  } else if (type === "new") {
    selectedWords = pickNewWords(allWords);

    // fallback
    if (selectedWords.length < SESSION_SIZE) {
      const fallback = pickMixedWords(allWords);
      selectedWords = [...new Set([...selectedWords, ...fallback])].slice(
        0,
        SESSION_SIZE
      );
    }
  } else {
    selectedWords = pickMixedWords(allWords);
  }

  return generateQuestions(selectedWords, allWords);
}
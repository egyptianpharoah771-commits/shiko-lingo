// ===============================
// 🧠 COACH ENGINE (PRO VERSION)
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
// 🧠 CALCULATE WORD STRENGTH
// ===============================
function getWordStrength(data) {
  const correct = data.correct || 0;
  const wrong = data.wrong || 0;

  const total = correct + wrong;
  if (total === 0) return 0;

  return correct / total;
}

// ===============================
// 📊 CLASSIFY WORDS
// ===============================
function classifyWords(words) {
  const profile = getProfile();

  const weak = [];
  const medium = [];
  const strong = [];
  const unseen = [];

  words.forEach((word) => {
    const data = profile[word.id];

    if (!data) {
      unseen.push(word);
      return;
    }

    const strength = getWordStrength(data);

    if (strength < 0.4) weak.push(word);
    else if (strength < 0.75) medium.push(word);
    else strong.push(word);
  });

  return { weak, medium, strong, unseen };
}

// ===============================
// 🎯 PICK WORDS SMARTLY
// ===============================
function pickWords({ weak, medium, strong, unseen }) {
  let selected = [];

  // Priority system
  selected = [
    ...weak.slice(0, 5),
    ...medium.slice(0, 3),
    ...unseen.slice(0, 2),
  ];

  // fallback
  if (selected.length < SESSION_SIZE) {
    selected = [
      ...selected,
      ...strong.slice(0, SESSION_SIZE - selected.length),
    ];
  }

  return selected.slice(0, SESSION_SIZE);
}

// ===============================
// 🧩 GENERATE OPTIONS
// ===============================
function generateOptions(correctWord, allWords) {
  const options = [correctWord.meaning];

  const shuffled = [...allWords].sort(() => 0.5 - Math.random());

  for (let w of shuffled) {
    if (options.length >= 4) break;
    if (w.meaning !== correctWord.meaning) {
      options.push(w.meaning);
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
    correctAnswer: word.meaning,
    options: generateOptions(word, allWords),
  }));
}

// ===============================
// 🚀 MAIN FUNCTION
// ===============================
export function generateCoachSession(allWords) {
  const { weak, medium, strong, unseen } = classifyWords(allWords);

  const selectedWords = pickWords({
    weak,
    medium,
    strong,
    unseen,
  });

  const questions = generateQuestions(selectedWords, allWords);

  return questions;
}
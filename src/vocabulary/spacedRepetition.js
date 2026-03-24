// Simple Spaced Repetition Engine for Vocabulary

const STORAGE_KEY = "VOCAB_REVIEW_STATE";

export function loadReviewState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveReviewState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getWordStage(word) {
  const state = loadReviewState();
  return state[word]?.stage || 0;
}

export function updateWordStage(word, correct) {
  const state = loadReviewState();

  const current = state[word]?.stage || 0;

  let nextStage = current;

  if (correct) {
    nextStage = Math.min(current + 1, 4);
  } else {
    nextStage = 0;
  }

  state[word] = {
    stage: nextStage,
    lastReviewed: Date.now(),
  };

  saveReviewState(state);
}

export function getWordsForReview(words) {
  const state = loadReviewState();

  const result = [];

  words.forEach((word) => {
    const stage = state[word]?.stage || 0;

    if (stage <= 1) result.push(word);
    else if (stage === 2 && Math.random() < 0.7) result.push(word);
    else if (stage === 3 && Math.random() < 0.4) result.push(word);
    else if (stage === 4 && Math.random() < 0.2) result.push(word);
  });

  return result.length ? result : words.slice(0, 5);
}
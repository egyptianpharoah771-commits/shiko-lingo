import { evaluateAchievements } from "./achievementEngine";

const STORAGE_KEY = "DAILY_LEARNING_STATE";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    xp: 0,
    streak: 0,
    todayXP: 0,
    goal: 20,
    lastDate: today(),
    _goalCompletedToday: false,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);

    return {
      ...defaultState(),
      ...parsed,
    };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================
   XP Engine
========================= */

export function addXP(amount = 5) {
  const state = loadState();
  const t = today();

  /* Reset daily XP if new day */

  if (state.lastDate !== t) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const y = yesterday.toISOString().slice(0, 10);

    if (state.lastDate !== y) {
      state.streak = 0;
    }

    state.todayXP = 0;
    state.lastDate = t;
    state._goalCompletedToday = false;
  }

  state.xp += amount;
  state.todayXP += amount;

  /* Trigger XP animation */

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("xp-earned", { detail: amount })
    );
  }

  /* Streak logic */

  if (state.todayXP >= state.goal) {
    if (!state._goalCompletedToday) {
      state.streak += 1;
      state._goalCompletedToday = true;
    }
  }

  /* Achievement evaluation */

  try {
    evaluateAchievements({
      xp: state.xp,
      streak: state.streak,
    });
  } catch (err) {
    console.warn("Achievement evaluation failed:", err);
  }

  saveState(state);

  return state;
}

/* =========================
   XP Helpers
========================= */

export function addLessonXP() {
  return addXP(10);
}

export function addQuizXP() {
  return addXP(5);
}

export function addReviewXP() {
  return addXP(3);
}

/* =========================
   State Getters
========================= */

export function getLearningState() {
  return loadState();
}



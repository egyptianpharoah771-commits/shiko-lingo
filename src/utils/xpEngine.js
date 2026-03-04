const STORAGE_KEY = "DAILY_LEARNING_STATE";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        xp: 0,
        streak: 0,
        todayXP: 0,
        goal: 20,
        lastDate: today(),
      };
    }

    return JSON.parse(raw);
  } catch {
    return {
      xp: 0,
      streak: 0,
      todayXP: 0,
      goal: 20,
      lastDate: today(),
    };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addXP(amount = 5) {
  const state = loadState();
  const t = today();

  if (state.lastDate !== t) {
    state.todayXP = 0;
    state.lastDate = t;
  }

  state.xp += amount;
  state.todayXP += amount;

  if (state.todayXP >= state.goal && state.streak === 0) {
    state.streak += 1;
  }

  saveState(state);
}

export function addLessonXP() {
  addXP(10);
}

export function addQuizXP() {
  addXP(5);
}

export function addReviewXP() {
  addXP(3);
}
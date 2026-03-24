const STORAGE_KEY = "USER_ACHIEVEMENTS";

function loadAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAchievements(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function unlockAchievement(key) {
  const data = loadAchievements();

  if (!data[key]) {
    data[key] = {
      unlocked: true,
      date: Date.now(),
    };

    saveAchievements(data);
  }
}

export function getAchievements() {
  return loadAchievements();
}

export function evaluateAchievements({ xp, streak }) {
  if (xp >= 10) unlockAchievement("xp10");
  if (xp >= 50) unlockAchievement("xp50");
  if (streak >= 7) unlockAchievement("streak7");
}
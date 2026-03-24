const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function calculateDynamicLevel(profile, currentLevel) {
  if (!profile) return currentLevel;

  const stats = Object.values(profile);

  if (!stats.length) return currentLevel;

  const totalCorrect = stats.reduce((sum, s) => sum + (s.correct || 0), 0);
  const totalWrong = stats.reduce((sum, s) => sum + (s.wrong || 0), 0);

  const total = totalCorrect + totalWrong;

  if (total < 10) return currentLevel; // 🔒 لسه بدري

  const accuracy = totalCorrect / total;

  const currentIndex = LEVELS.indexOf(currentLevel);

  if (accuracy > 0.8 && currentIndex < LEVELS.length - 1) {
    return LEVELS[currentIndex + 1];
  }

  if (accuracy < 0.5 && currentIndex > 0) {
    return LEVELS[currentIndex - 1];
  }

  return currentLevel;
}
export function getEconomy() {
  return JSON.parse(localStorage.getItem("economy") || "{}");
}

export function saveEconomy(data) {
  localStorage.setItem("economy", JSON.stringify(data));
}

export function addXP(isCorrect) {
  const econ = getEconomy();

  const xpGain = isCorrect ? 10 : 2;

  econ.xp = (econ.xp || 0) + xpGain;

  const level = Math.floor(econ.xp / 100) + 1;

  econ.level = level;

  saveEconomy(econ);

  return { xp: econ.xp, level };
}



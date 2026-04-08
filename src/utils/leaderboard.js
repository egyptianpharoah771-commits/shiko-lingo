export function getLeaderboard() {
  return JSON.parse(localStorage.getItem("leaderboard") || "[]");
}

export function saveLeaderboard(data) {
  localStorage.setItem("leaderboard", JSON.stringify(data));
}

export function updateLeaderboard(userId, xp) {
  let board = getLeaderboard();

  const existing = board.find(u => u.userId === userId);

  if (existing) {
    existing.xp = xp;
  } else {
    board.push({ userId, xp });
  }

  // 🔥 sort descending
  board.sort((a, b) => b.xp - a.xp);

  saveLeaderboard(board);

  return board;
}



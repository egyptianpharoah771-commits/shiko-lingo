export function getUserTopic(level) {
  const topics = {
    A1: ["food", "daily", "people", "places"],
    A2: ["travel", "shopping", "work", "health"],
    B1: ["education", "technology", "communication"]
  };

  const pool = topics[level] || topics["A1"];

  return pool[Math.floor(Math.random() * pool.length)];
}



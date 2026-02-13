export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { uid } = req.query;

  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "UID_REQUIRED" });
  }

  // Ensure global storage exists
  if (!global.subscriptions) {
    global.subscriptions = {};
  }

  const sub = global.subscriptions[uid];

  if (!sub) {
    return res.status(200).json({
      active: false,
      expiresAt: null,
    });
  }

  // Safety check
  if (!sub.expiresAt || typeof sub.expiresAt !== "number") {
    return res.status(200).json({
      active: false,
      expiresAt: null,
    });
  }

  const now = Date.now();
  const active = now < sub.expiresAt;

  return res.status(200).json({
    active,
    expiresAt: sub.expiresAt,
  });
}

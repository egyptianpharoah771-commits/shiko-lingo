export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { uid } = req.query;

  if (!uid) {
    return res.status(400).json({ error: "UID_REQUIRED" });
  }

  // نفس التخزين المستخدم في complete.js
  global.subscriptions = global.subscriptions || {};

  const sub = global.subscriptions[uid];

  if (!sub) {
    return res.status(200).json({ active: false });
  }

  const active = Date.now() < sub.expiresAt;

  return res.status(200).json({
    active,
    expiresAt: sub.expiresAt,
  });
}

const PI_API_BASE = "https://api.minepi.com/v2";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    const { accessToken } = req.body || {};
    if (!accessToken) {
      return res.status(400).json({ error: "MISSING_ACCESS_TOKEN" });
    }

    const response = await fetch(`${PI_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "INVALID_PI_TOKEN" });
    }

    const me = await response.json();
    if (!me?.uid) {
      return res.status(401).json({ error: "INVALID_PI_USER" });
    }

    return res.status(200).json({
      uid: me.uid,
      username: me.username || "",
    });
  } catch (err) {
    console.error("PI OAUTH ME ERROR:", err);
    return res.status(500).json({ error: "PI_OAUTH_ME_FAILED" });
  }
}

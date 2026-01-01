export default async function handler(req, res) {
  /* =========================
     CORS (Pi Browser iframe)
  ========================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  /* =========================
     BASIC HEALTH CHECK
     GET /api/pi
  ========================= */
  if (req.method === "GET" && !req.query.action) {
    return res.status(200).json({
      ok: true,
      service: "pi-backend",
      env: process.env.PI_API_KEY ? "ready" : "missing_api_key",
    });
  }

  /* =========================
     ENV
  ========================= */
  const PI_API_KEY = process.env.PI_API_KEY;
  const PI_API_URL = "https://api-testnet.minepi.com/v2";

  if (!PI_API_KEY) {
    console.error("❌ PI_API_KEY_NOT_SET");
    return res.status(500).json({
      error: "PI_API_KEY_NOT_SET",
    });
  }

  const { method, query, body } = req;

  console.log("🔥 PI API HIT:", method, query.action);

  /* =========================
     AUTH VERIFY
     POST /api/pi?action=auth
  ========================= */
  if (method === "POST" && query.action === "auth") {
    const { accessToken } = body || {};

    if (!accessToken) {
      return res.status(400).json({
        error: "ACCESS_TOKEN_REQUIRED",
      });
    }

    try {
      const meRes = await fetch(`${PI_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!meRes.ok) {
        return res.status(401).json({
          error: "INVALID_ACCESS_TOKEN",
        });
      }

      const user = await meRes.json();

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      console.error("❌ AUTH FAILED:", err);
      return res.status(500).json({
        error: "PI_AUTH_FAILED",
      });
    }
  }

  /* =========================
     APPROVE PAYMENT
     POST /api/pi?action=approve
  ========================= */
  if (method === "POST" && query.action === "approve") {
    const { paymentId } = body || {};

    if (!paymentId) {
      return res.status(400).json({
        error: "PAYMENT_ID_REQUIRED",
      });
    }

    try {
      const piRes = await fetch(
        `${PI_API_URL}/payments/${paymentId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await piRes.json();

      if (!piRes.ok) {
        console.error("❌ APPROVE FAILED:", data);
        return res.status(piRes.status).json(data);
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error("❌ APPROVE FAILED:", err);
      return res.status(500).json({
        error: "PI_APPROVE_FAILED",
      });
    }
  }

  /* =========================
     COMPLETE PAYMENT
     POST /api/pi?action=complete
  ========================= */
  if (method === "POST" && query.action === "complete") {
    const { paymentId, txid } = body || {};

    if (!paymentId || !txid) {
      return res.status(400).json({
        error: "PAYMENT_ID_AND_TXID_REQUIRED",
      });
    }

    try {
      const piRes = await fetch(
        `${PI_API_URL}/payments/${paymentId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ txid }),
        }
      );

      const data = await piRes.json();

      if (!piRes.ok) {
        console.error("❌ COMPLETE FAILED:", data);
        return res.status(piRes.status).json(data);
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error("❌ COMPLETE FAILED:", err);
      return res.status(500).json({
        error: "PI_COMPLETE_FAILED",
      });
    }
  }

  /* =========================
     FALLBACK
  ========================= */
  return res.status(404).json({
    error: "NOT_FOUND",
  });
}

/* 
=====================================================
 VERCEL FRESH DEPLOY MARKER
 (do not remove – used to force new deployment)
=====================================================
*/

export default async function handler(req, res) {
  const { method, query, body } = req;

  /* =========================
     CORS (Pi Browser iframe)
  ========================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  const PI_API_KEY = process.env.PI_API_KEY;

  if (!PI_API_KEY) {
    return res.status(500).json({
      error: "PI_API_KEY_NOT_SET",
    });
  }

  /* =========================
     AUTH VERIFY (LOGIN)
     REQUIRED BY PI CHECKLIST
  ========================= */
  if (method === "POST" && query.action === "auth") {
    const { accessToken } = body;

    if (!accessToken) {
      return res.status(400).json({
        error: "ACCESS_TOKEN_REQUIRED",
      });
    }

    try {
      const meRes = await fetch(
        "https://api.minepi.com/v2/me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!meRes.ok) {
        return res.status(401).json({
          error: "INVALID_ACCESS_TOKEN",
        });
      }

      const user = await meRes.json();
      console.log("✅ PI AUTH VERIFIED:", user);

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      console.error("PI AUTH ERROR:", err);
      return res.status(500).json({
        error: "PI_AUTH_FAILED",
      });
    }
  }

  /* =========================
     APPROVE PAYMENT
  ========================= */
  if (method === "POST" && query.action === "approve") {
    const { paymentId } = body;

    if (!paymentId) {
      return res.status(400).json({
        error: "PAYMENT_ID_REQUIRED",
      });
    }

    try {
      const piRes = await fetch(
        `https://api.minepi.com/v2/payments/${paymentId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Key ${PI_API_KEY}`,
          },
        }
      );

      const data = await piRes.json();
      console.log("✅ PI APPROVE:", data);

      return res.status(200).json(data);
    } catch (err) {
      console.error("PI APPROVE ERROR:", err);
      return res.status(500).json({
        error: "PI_APPROVE_FAILED",
      });
    }
  }

  /* =========================
     COMPLETE PAYMENT
  ========================= */
  if (method === "POST" && query.action === "complete") {
    const { paymentId, txid } = body;

    if (!paymentId || !txid) {
      return res.status(400).json({
        error: "PAYMENT_ID_AND_TXID_REQUIRED",
      });
    }

    try {
      const piRes = await fetch(
        `https://api.minepi.com/v2/payments/${paymentId}/complete`,
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
      console.log("✅ PI COMPLETE:", data);

      return res.status(200).json(data);
    } catch (err) {
      console.error("PI COMPLETE ERROR:", err);
      return res.status(500).json({
        error: "PI_COMPLETE_FAILED",
      });
    }
  }

  return res.status(404).json({
    error: "NOT_FOUND",
  });
}

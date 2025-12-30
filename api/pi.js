export default async function handler(req, res) {
  const { method, query } = req;

  // Enable CORS (important for Pi iframe)
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
  ========================= */
  if (method === "POST" && query.action === "auth") {
    // Pi just needs the server hit
    return res.status(200).json({ success: true });
  }

  /* =========================
     APPROVE PAYMENT
  ========================= */
  if (method === "POST" && query.action === "approve") {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res
        .status(400)
        .json({ error: "PAYMENT_ID_REQUIRED" });
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
      console.log("PI APPROVE:", data);

      return res.status(200).json(data);
    } catch (err) {
      console.error("APPROVE ERROR:", err);
      return res
        .status(500)
        .json({ error: "PI_APPROVE_FAILED" });
    }
  }

  /* =========================
     COMPLETE PAYMENT
  ========================= */
  if (method === "POST" && query.action === "complete") {
    const { paymentId, txid } = req.body;

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
      console.log("PI COMPLETE:", data);

      return res.status(200).json(data);
    } catch (err) {
      console.error("COMPLETE ERROR:", err);
      return res
        .status(500)
        .json({ error: "PI_COMPLETE_FAILED" });
    }
  }

  return res.status(404).json({ error: "NOT_FOUND" });
}

const PI_API_BASE = "https://api.minepi.com";

/**
 * ⚠️ Temporary in-memory subscription store
 * NOTE:
 * This will reset if the server restarts.
 * Later we can move this to DB or Vercel KV.
 */
global.subscriptions = global.subscriptions || {};

function piHeaders() {
  return {
    Authorization: `Key ${process.env.PI_API_KEY}`,
    "Content-Type": "application/json",
    "X-Pi-Platform": "true",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { paymentId, txid, uid } = req.body;

  if (!paymentId || !txid || !uid) {
    return res
      .status(400)
      .json({ error: "PAYMENT_ID_TXID_UID_REQUIRED" });
  }

  try {
    // 1️⃣ Confirm payment with Pi
    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 2️⃣ Activate subscription (30 days)
    const expiresAt =
      Date.now() + 30 * 24 * 60 * 60 * 1000;

    global.subscriptions[uid] = {
      plan: "MONTHLY",
      expiresAt,
      paymentId,
    };

    console.log("Subscription activated for:", uid);

    return res.status(200).json({
      status: "COMPLETED",
      subscription: {
        active: true,
        expiresAt,
      },
    });
  } catch (err) {
    console.error("PI COMPLETE ERROR:", err);
    return res.status(500).json({ error: "PI_COMPLETE_ERROR" });
  }
}

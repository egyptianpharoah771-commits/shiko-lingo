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

/**
 * Add one calendar month safely
 * Handles edge cases like Jan 31 → Feb
 */
function addOneMonth(date) {
  const d = new Date(date);
  const originalDay = d.getDate();

  d.setMonth(d.getMonth() + 1);

  // Handle month overflow (e.g. Jan 31 → Feb 28/29)
  if (d.getDate() < originalDay) {
    d.setDate(0);
  }

  return d;
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
      console.error("PI API ERROR:", data);
      return res.status(response.status).json(data);
    }

    // 2️⃣ Subscription calculation (Rolling Monthly)

    const now = new Date();

    const existing = global.subscriptions[uid];
    const currentExpiry = existing
      ? new Date(existing.expiresAt)
      : null;

    let baseDate;

    if (currentExpiry && now < currentExpiry) {
      // Renew before expiration → extend from expiry
      baseDate = currentExpiry;
    } else {
      // New subscription OR expired → start from now
      baseDate = now;
    }

    const newExpiry = addOneMonth(baseDate);

    global.subscriptions[uid] = {
      plan: "MONTHLY",
      expiresAt: newExpiry.getTime(),
      paymentId,
    };

    console.log("Subscription activated/extended for:", uid);
    console.log("New expiry:", newExpiry.toISOString());

    // ⚠️ CRITICAL: Pi expects success:true
    return res.status(200).json({
      success: true,
      expiresAt: newExpiry.toISOString(),
    });

  } catch (err) {
    console.error("PI COMPLETE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "PI_COMPLETE_ERROR",
    });
  }
}

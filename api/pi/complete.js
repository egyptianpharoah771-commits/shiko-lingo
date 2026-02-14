export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { paymentId, txid } = req.body;

  try {
    await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json",
          "X-Pi-Platform": "true",
        },
        body: JSON.stringify({ txid }),
      }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "FAIL" });
  }
}

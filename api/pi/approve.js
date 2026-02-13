const PI_API_BASE = "https://api.minepi.com";

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

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "PAYMENT_ID_REQUIRED" });
  }

  try {
    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: piHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ status: "APPROVED" });
  } catch (err) {
    console.error("PI APPROVE ERROR:", err);
    return res.status(500).json({ error: "PI_APPROVE_ERROR" });
  }
}

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

  if (!process.env.PI_API_KEY) {
    console.error("PI_API_KEY is missing in server environment");
    return res.status(500).json({
      success: false,
      error: "SERVER_MISCONFIGURED",
      message: "PI_API_KEY is not set on the host (e.g. Vercel env).",
    });
  }

  const { paymentId } = req.body || {};

  if (!paymentId) {
    return res.status(400).json({ error: "PAYMENT_ID_REQUIRED" });
  }

  try {
    console.log("Approving Pi payment:", paymentId);

    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: piHeaders(),
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      console.error("PI APPROVE API ERROR:", data);
      return res.status(response.status).json({
        success: false,
        error: "PI_APPROVE_FAILED",
        details: data,
      });
    }

    console.log("Pi payment approved:", paymentId);

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error("PI APPROVE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "PI_APPROVE_ERROR",
    });
  }
}
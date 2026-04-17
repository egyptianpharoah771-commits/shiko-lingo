/**
 * Diagnostic endpoint — helps verify PI_API_KEY and Pi API connectivity.
 * Remove or protect this endpoint once the issue is resolved.
 * Access: GET https://shikolingo.site/api/pi-diag
 */
export default async function handler(req, res) {
  const hasKey = !!process.env.PI_API_KEY;
  const keySnippet = hasKey
    ? process.env.PI_API_KEY.slice(0, 6) + "..." + process.env.PI_API_KEY.slice(-4)
    : "NOT SET";

  if (!hasKey) {
    return res.status(500).json({
      ok: false,
      PI_API_KEY: keySnippet,
      message: "PI_API_KEY is not set in Vercel environment variables.",
    });
  }

  // Try to call Pi API with this key — get incomplete server payments (safe read-only call)
  let piResponse = null;
  let piStatus = null;
  let piError = null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);

    const piRes = await fetch(
      "https://api.minepi.com/v2/payments/incomplete_server_payments",
      {
        method: "GET",
        headers: {
          Authorization: `Key ${process.env.PI_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: ctrl.signal,
      }
    );
    clearTimeout(t);

    piStatus = piRes.status;
    const raw = await piRes.text();
    try {
      piResponse = JSON.parse(raw);
    } catch {
      piResponse = raw.slice(0, 300);
    }
  } catch (err) {
    piError = String(err?.message || err);
  }

  return res.status(200).json({
    ok: piStatus === 200,
    PI_API_KEY: keySnippet,
    pi_api_status: piStatus,
    pi_api_response: piResponse,
    pi_api_error: piError,
    hint:
      piStatus === 401
        ? "API key is INVALID or belongs to a different app/network."
        : piStatus === 200
        ? "API key is valid and Pi API is reachable."
        : piStatus === 403
        ? "API key rejected — likely Testnet key used on Mainnet or vice versa."
        : "Check pi_api_error for details.",
  });
}

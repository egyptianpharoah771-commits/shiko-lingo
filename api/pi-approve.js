/**
 * Pi Payment — Server-Side APPROVE
 * Runs as a Vercel Edge Function: zero cold start, instant response.
 * Only needs fetch + PI_API_KEY — no Node.js modules required.
 */
export const config = { runtime: "edge" };

const PI_API_BASE = "https://api.minepi.com/v2";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "METHOD_NOT_ALLOWED" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ success: false, error: "SERVER_MISCONFIGURED", message: "PI_API_KEY not set." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "INVALID_JSON" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { paymentId } = body;
  if (!paymentId || typeof paymentId !== "string") {
    return new Response(
      JSON.stringify({ success: false, error: "PAYMENT_ID_REQUIRED" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const piRes = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: "{}",
      }
    );

    const raw = await piRes.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

    if (!piRes.ok) {
      console.error("PI APPROVE API ERROR:", piRes.status, data);
      return new Response(
        JSON.stringify({ success: false, error: "PI_APPROVE_FAILED", status: piRes.status, details: data }),
        { status: piRes.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("PI APPROVE ERROR:", err);
    return new Response(
      JSON.stringify({ success: false, error: "PI_APPROVE_ERROR", message: String(err?.message || err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

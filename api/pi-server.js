/**
 * Single serverless entry for Pi approve + complete (one cold pool on Vercel).
 * Client: POST { step: "approve", paymentId } | { step: "complete", paymentId, txid }
 *
 * Supabase is loaded lazily (only for "complete") to keep cold-start fast for "approve".
 */

const PI_API_BASE = "https://api.minepi.com/v2";

function piHeaders() {
  return {
    Authorization: `Key ${process.env.PI_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Pi-Platform": "true",
  };
}

let supabaseSingleton = null;
async function getSupabase() {
  if (supabaseSingleton) return supabaseSingleton;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  const { createClient } = await import("@supabase/supabase-js");
  supabaseSingleton = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  return supabaseSingleton;
}

function minepiFetchTimeoutMs() {
  const n = Number(process.env.PI_MINEPI_FETCH_TIMEOUT_MS);
  return Number.isFinite(n) && n > 3000 ? n : 25000;
}

async function fetchMinepiJson(url, options = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), minepiFetchTimeoutMs());
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { _raw: text?.slice(0, 500) };
    }
    return { res, data };
  } finally {
    clearTimeout(t);
  }
}

function approveResponseLooksValid(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.identifier === "string" && data.identifier.length > 0) {
    return true;
  }
  if (data.status && data.status.developer_approved === true) {
    return true;
  }
  return false;
}

async function handleApprove(res, paymentId) {
  if (!paymentId || typeof paymentId !== "string") {
    return res.status(400).json({
      success: false,
      error: "PAYMENT_ID_REQUIRED",
    });
  }

  try {
    const { res: piRes, data } = await fetchMinepiJson(
      `${PI_API_BASE}/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: piHeaders(),
        body: "{}",
      }
    );

    if (!piRes.ok) {
      console.error("PI APPROVE API ERROR:", data);
      return res.status(piRes.status).json({
        success: false,
        error: "PI_APPROVE_FAILED",
        details: data,
      });
    }

    if (!approveResponseLooksValid(data)) {
      console.error("PI APPROVE UNEXPECTED BODY:", data);
      return res.status(502).json({
        success: false,
        error: "PI_APPROVE_INVALID_RESPONSE",
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("PI APPROVE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "PI_APPROVE_ERROR",
      message: err?.name === "AbortError" ? "Pi API request timed out" : String(err?.message || err),
    });
  }
}

async function handleComplete(res, paymentId, txid) {
  if (!paymentId || !txid) {
    return res.status(400).json({
      success: false,
      error: "PAYMENT_ID_TXID_REQUIRED",
    });
  }

  const supabase = await getSupabase();
  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: "SERVER_MISCONFIGURED",
      message: "Supabase env vars are missing on the host.",
    });
  }

  try {
    const { res: completeRes, data: completeData } = await fetchMinepiJson(
      `${PI_API_BASE}/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    );

    if (!completeRes.ok) {
      const alreadyCompleted =
        completeData?.error?.code === "PAYMENT_ALREADY_COMPLETED" ||
        completeData?.error?.message?.toLowerCase?.()?.includes("already");

      if (!alreadyCompleted) {
        console.error("PI COMPLETE ERROR:", completeData);
        return res.status(completeRes.status).json({
          success: false,
          error: "PI_COMPLETE_FAILED",
          details: completeData,
        });
      }
    }

    const { res: paymentRes, data: paymentData } = await fetchMinepiJson(
      `${PI_API_BASE}/payments/${paymentId}`,
      { method: "GET", headers: piHeaders() }
    );

    if (!paymentRes.ok) {
      console.error("FAILED TO FETCH PAYMENT:", paymentData);
      return res.status(paymentRes.status).json({
        success: false,
        error: "PAYMENT_FETCH_FAILED",
      });
    }

    const userUid = paymentData?.user_uid;
    if (!userUid) {
      console.error("USER UID NOT FOUND IN PAYMENT:", paymentData);
      return res.status(500).json({
        success: false,
        error: "USER_UID_NOT_FOUND",
      });
    }

    /* Ensure a profile row exists for this uid.
       Pi gives each app a different uid per user (mainnet uid ≠ testnet uid),
       so we auto-create the profile if it doesn't exist yet.
       profiles.id now has gen_random_uuid() as default — no need to supply it. */
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ pi_uid: userUid }, { onConflict: "pi_uid", ignoreDuplicates: true });
    if (profileError) {
      console.error("PROFILE UPSERT ERROR:", profileError);
      return res.status(500).json({
        success: false,
        error: "PROFILE_CREATE_FAILED",
        message: profileError?.message || String(profileError),
      });
    }

    const { error: rpcError } = await supabase.rpc("process_payment", {
      p_payment_id: paymentId,
      p_uid: userUid,
      p_months: 1,
    });

    if (rpcError) {
      console.error("RPC FAILED:", rpcError);
      return res.status(500).json({
        success: false,
        error: "RPC_PROCESS_FAILED",
        rpc_message: rpcError?.message || String(rpcError),
        rpc_code: rpcError?.code,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("UNHANDLED PI COMPLETE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: err?.name === "AbortError" ? "Pi API request timed out" : String(err?.message || err),
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });
  }

  if (!process.env.PI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "SERVER_MISCONFIGURED",
      message: "PI_API_KEY is not set on the host (e.g. Vercel env).",
    });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const step = body.step || body.intent;

  /* Pre-warm ping — client fires this when page loads to avoid cold-start during payment */
  if (step === "ping") {
    return res.status(200).json({ ok: true, warm: true });
  }

  if (step === "approve") {
    return handleApprove(res, body.paymentId);
  }
  if (step === "complete") {
    return handleComplete(res, body.paymentId, body.txid);
  }

  return res.status(400).json({
    success: false,
    error: "INVALID_STEP",
    message: 'Expected body.step "approve", "complete", or "ping".',
  });
}

import { createClient } from "@supabase/supabase-js";

const PI_API_BASE = "https://api.minepi.com/v2";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

function piHeaders() {
  return {
    Authorization: `Key ${process.env.PI_API_KEY}`,
    "Content-Type": "application/json",
    "X-Pi-Platform": "true",
  };
}

export default async function handler(req, res) {
  console.log("===== PI COMPLETE ENDPOINT HIT =====");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { paymentId, txid } = req.body || {};

  if (!paymentId || !txid) {
    return res.status(400).json({
      success: false,
      error: "PAYMENT_ID_TXID_REQUIRED",
    });
  }

  if (!process.env.PI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "SERVER_MISCONFIGURED",
      message: "PI_API_KEY is not set on the host.",
    });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      success: false,
      error: "SERVER_MISCONFIGURED",
      message: "Supabase env vars are missing on the host.",
    });
  }

  try {
    /* =========================
       STEP 1 — Complete on Pi
    ========================= */
    const completeRes = await fetch(
      `${PI_API_BASE}/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    );

    const completeData = await completeRes.json();

    if (!completeRes.ok) {
      const alreadyCompleted =
        completeData?.error?.code === "PAYMENT_ALREADY_COMPLETED" ||
        completeData?.error?.message?.toLowerCase()?.includes("already");

      if (!alreadyCompleted) {
        console.error("PI COMPLETE ERROR:", completeData);
        return res.status(completeRes.status).json({
          success: false,
          error: "PI_COMPLETE_FAILED",
          details: completeData,
        });
      }

      console.log("Payment already completed. Continuing...");
    }

    /* =========================
       STEP 2 — Fetch Payment Details
    ========================= */
    const paymentRes = await fetch(
      `${PI_API_BASE}/payments/${paymentId}`,
      {
        method: "GET",
        headers: piHeaders(),
      }
    );

    const paymentData = await paymentRes.json();

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

    console.log("Processing subscription for UID:", userUid);

    /* =========================
       STEP 3 — Call RPC
    ========================= */
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
      });
    }

    console.log("Subscription activated for:", userUid);

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error("UNHANDLED PI COMPLETE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
    });
  }
}
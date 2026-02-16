const PI_API_BASE = "https://api.minepi.com";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

  const { paymentId, txid, uid } = req.body;

  console.log("REQUEST BODY:", req.body);

  if (!paymentId || !txid || !uid) {
    console.error("MISSING DATA:", { paymentId, txid, uid });
    return res.status(400).json({
      error: "PAYMENT_ID_TXID_UID_REQUIRED",
    });
  }

  try {
    /* =========================
       STEP 1 — Confirm with Pi
    ========================= */
    console.log("CONFIRMING WITH PI:", paymentId);

    const response = await fetch(
      `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: piHeaders(),
        body: JSON.stringify({ txid }),
      }
    );

    const data = await response.json();
    console.log("PI RESPONSE:", data);

    if (!response.ok) {
      if (
        data?.error?.code === "PAYMENT_ALREADY_COMPLETED" ||
        data?.error?.message?.toLowerCase()?.includes("already")
      ) {
        console.log("Payment already completed. Continuing...");
      } else {
        console.error("PI API ERROR:", data);
        return res.status(response.status).json(data);
      }
    }

    /* =========================
       STEP 2 — Call RPC
    ========================= */
    console.log("CALLING RPC process_payment:", {
      paymentId,
      uid,
    });

    const { error: rpcError } = await supabase.rpc(
      "process_payment",
      {
        p_payment_id: paymentId,
        p_uid: uid,
        p_months: 1,
      }
    );

    if (rpcError) {
      console.error("RPC ERROR:", rpcError);
      return res.status(500).json({
        success: false,
        error: "RPC_PROCESS_FAILED",
      });
    }

    console.log("RPC SUCCESS");

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error("PI COMPLETE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "PI_COMPLETE_ERROR",
    });
  }
}

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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { paymentId, txid, uid } = req.body;

  if (!paymentId || !txid || !uid) {
    return res.status(400).json({
      error: "PAYMENT_ID_TXID_UID_REQUIRED",
    });
  }

  try {
    /* =========================
       STEP 1 — Confirm with Pi
    ========================= */
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
      if (
        data?.error?.code === "PAYMENT_ALREADY_COMPLETED" ||
        data?.error?.message?.toLowerCase()?.includes("already")
      ) {
        console.log("Payment already completed on Pi. Continuing...");
      } else {
        console.error("PI API ERROR:", data);
        return res.status(response.status).json(data);
      }
    }

    /* =========================
       STEP 2 — DIRECT INSERT TEST
       (Bypass RPC completely)
    ========================= */
    const { data: insertData, error } = await supabase
      .from("payments")
      .insert({
        payment_id: "killer_test_" + Date.now(),
        uid: "debug_user",
        plan: "MONTHLY",
        status: "completed",
      });

    if (error) {
      console.error("DIRECT INSERT ERROR:", error);
      return res.status(500).json({
        success: false,
        error,
      });
    }

    console.log("DIRECT INSERT SUCCESS:", insertData);

    return res.status(200).json({
      success: true,
      debug: "DIRECT_INSERT_OK",
    });

  } catch (err) {
    console.error("PI COMPLETE ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "PI_COMPLETE_ERROR",
    });
  }
}

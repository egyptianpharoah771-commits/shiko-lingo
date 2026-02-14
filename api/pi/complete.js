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

function addOneMonth(date) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + 1);
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
    return res.status(400).json({
      error: "PAYMENT_ID_TXID_UID_REQUIRED",
    });
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

    const now = new Date();

    // 2️⃣ Check if payment already processed (IDEMPOTENCY)
    const { data: existingPayment, error: paymentCheckError } =
      await supabase
        .from("payments")
        .select("payment_id")
        .eq("payment_id", paymentId)
        .maybeSingle();

    if (paymentCheckError) {
      console.error("PAYMENT CHECK ERROR:", paymentCheckError);
      return res.status(500).json({
        success: false,
        error: "PAYMENT_CHECK_FAILED",
      });
    }

    if (existingPayment) {
      // Payment already recorded → don't extend again
      return res.status(200).json({
        success: true,
        note: "PAYMENT_ALREADY_PROCESSED",
      });
    }

    // 3️⃣ Record payment FIRST (critical step)
    const { error: insertPaymentError } = await supabase
      .from("payments")
      .insert({
        payment_id: paymentId,
        uid,
        plan: "MONTHLY",
        status: "completed",
      });

    if (insertPaymentError) {
      console.error("PAYMENT INSERT ERROR:", insertPaymentError);
      return res.status(500).json({
        success: false,
        error: "PAYMENT_RECORD_FAILED",
      });
    }

    // 4️⃣ Get existing subscription
    const { data: existingSub, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("uid", uid)
      .maybeSingle();

    if (fetchError) {
      console.error("DB READ ERROR:", fetchError);
      return res.status(500).json({
        success: false,
        error: "DB_READ_FAILED",
      });
    }

    let baseDate;

    if (existingSub && new Date(existingSub.expires_at) > now) {
      baseDate = new Date(existingSub.expires_at);
    } else {
      baseDate = now;
    }

    const newExpiry = addOneMonth(baseDate);

    // 5️⃣ Upsert subscription
    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          uid,
          plan: "MONTHLY",
          expires_at: newExpiry.toISOString(),
          updated_at: now.toISOString(),
        },
        { onConflict: "uid" }
      );

    if (upsertError) {
      console.error("SUBSCRIPTION UPSERT ERROR:", upsertError);
      return res.status(500).json({
        success: false,
        error: "DB_WRITE_FAILED",
      });
    }

    console.log("Payment + Subscription processed for:", uid);

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

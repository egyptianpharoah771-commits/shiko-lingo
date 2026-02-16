import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
       DEBUG MODE — BYPASS PI
       Direct insert into payments
    ========================= */

    const { data, error } = await supabase
      .from("payments")
      .insert({
        payment_id: "killer_test_" + Date.now(),
        uid: uid,
        plan: "MONTHLY",
        status: "completed",
      });

    if (error) {
      console.error("DIRECT INSERT ERROR:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log("DIRECT INSERT SUCCESS:", data);

    return res.status(200).json({
      success: true,
      debug: "DIRECT_INSERT_OK",
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
    });
  }
}

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  const { uid } = req.query;

  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "UID_REQUIRED" });
  }

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("plan, expires_at")
      .eq("uid", uid)
      .maybeSingle();

    if (error) {
      console.error("DB READ ERROR:", error);
      return res.status(500).json({
        active: false,
        error: "DB_READ_FAILED",
      });
    }

    if (!subscription) {
      return res.status(200).json({
        active: false,
        plan: null,
        expiresAt: null,
      });
    }

    const now = new Date();
    const expiryDate = new Date(subscription.expires_at);
    const active = expiryDate > now;

    return res.status(200).json({
      active,
      plan: active ? subscription.plan : null,
      expiresAt: active ? subscription.expires_at : null,
    });

  } catch (err) {
    console.error("CHECK SUBSCRIPTION ERROR:", err);
    return res.status(500).json({
      active: false,
      error: "SERVER_ERROR",
    });
  }
}

let initialized = false;

export async function initPiSDK() {
  if (!window.Pi) {
    console.warn("Pi SDK not detected");
    return;
  }

  if (initialized) return;

  console.log("Pi SDK detected (no auth here)");

  try {
    // 🔥 Only handle incomplete payments
    window.Pi.onIncompletePaymentFound(async (payment) => {
      console.log("⚠ Incomplete payment detected:", payment);

      try {
        await fetch("/api/pi/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: payment.identifier,
            txid: payment.transaction?.txid,
            uid: payment.user_uid || payment.user_id,
          }),
        });

        console.log("✅ Incomplete payment recovered");
      } catch (err) {
        console.error("❌ Recovery failed:", err);
      }
    });
  } catch (err) {
    console.error("Pi init error:", err);
  }

  initialized = true;
}
let initialized = false;

export async function initPiSDK() {
  if (!window.Pi) {
    console.error("Pi SDK not loaded");
    return;
  }

  // 🚫 Prevent double execution
  if (initialized) return;

  console.log("Pi SDK detected (init handled in index.html)");

  try {
    /* ==============================
       🔐 Authenticate + Recovery Gate
    ============================== */

    const auth = await window.Pi.authenticate(
      ["username", "payments"],
      async (payment) => {
        // 🔥 SDK found an incomplete payment
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
      }
    );

    const uid = auth?.user?.uid;

    if (uid) {
      localStorage.setItem("pi_uid", uid);
      console.log("✅ User authenticated:", uid);
    } else {
      console.warn("⚠ Authentication returned no UID");
    }

  } catch (err) {
    console.error("❌ Authentication failed:", err);
  }

  initialized = true;
}

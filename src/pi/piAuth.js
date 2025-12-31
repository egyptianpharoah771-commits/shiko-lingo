export async function authenticateWithPi() {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  // ✅ REQUIRED scopes for payments
  const scopes = ["username", "payments"];

  const auth = await window.Pi.authenticate(
    scopes,
    (payment) => {
      console.warn(
        "⚠️ Incomplete payment found:",
        payment
      );
      // لاحقًا نكمّلها لو احتجنا
    }
  );

  return {
    pi_uid: auth.user.uid,
    username: auth.user.username,
  };
}

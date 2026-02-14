export async function authenticateWithPi() {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  const scopes = ["username", "payments"];

  const auth = await window.Pi.authenticate(
    scopes,
    (payment) => {
      console.warn("⚠️ Incomplete payment found:", payment);
    }
  );

  const uid = auth.user.uid;
  const username = auth.user.username;

  // 🔐 Persist identity for subscription checks
  localStorage.setItem("pi_uid", uid);
  localStorage.setItem("pi_username", username);

  return {
    uid,
    username,
  };
}

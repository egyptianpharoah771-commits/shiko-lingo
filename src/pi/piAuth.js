export async function authenticateWithPi() {
  if (!window.Pi) {
    throw new Error("Pi SDK not available");
  }

  const scopes = ["username"];

  const auth = await window.Pi.authenticate(scopes);

  return {
    pi_uid: auth.user.uid,
    username: auth.user.username,
  };
}

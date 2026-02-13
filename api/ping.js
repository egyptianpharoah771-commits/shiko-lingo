export default function handler(req, res) {
  console.log("PING HIT");
  res.status(200).json({ ok: true });
}

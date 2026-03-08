export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    res.status(400).json({ error: "Missing text parameter" });
    return;
  }

  const url =
    "https://translate.google.com/translate_tts" +
    "?client=gtx&ie=UTF-8&tl=en&q=" +
    encodeURIComponent(text);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");

    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: "TTS proxy failed" });
  }
}
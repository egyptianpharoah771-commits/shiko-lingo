import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, level, lessonTitle, lessonDescription } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const systemPrompt = `
You are an English AI Tutor helping a student at CEFR level ${level || "A1"}.

Lesson title: ${lessonTitle || "General English"}
Lesson description: ${lessonDescription || "Basic English conversation practice"}

Rules:
- Explain simply and clearly
- Use short sentences
- Give examples when useful
- Correct mistakes gently
- Do NOT be verbose
- Speak like a friendly tutor, not a chatbot
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.4,
    });

    const answer = completion.choices[0].message.content;

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("AI Tutor error:", err);
    return res.status(500).json({ error: "AI Tutor failed" });
  }
}

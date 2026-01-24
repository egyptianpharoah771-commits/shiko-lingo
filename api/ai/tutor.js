import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      question,
      level,
      lessonTitle,
      text,
    } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const systemPrompt = `
You are an English AI Tutor helping a student at CEFR level ${level || "A1"}.

Lesson title: ${lessonTitle || "Grammar lesson"}
Lesson content:
${text || "English grammar practice"}

VERY IMPORTANT RULES:
- Always structure your answer EXACTLY like this:

Strengths:
- One clear strength the student showed

Weak point:
- One thing to improve (only if needed, otherwise say "No major issues noticed")

Practical tip:
- One concrete, practical study tip related to THIS lesson

- Use simple English
- Be specific, not generic
- Do NOT praise without explanation
- Max 6 short lines total
- After the English feedback, add ONE short Arabic encouragement sentence (Egyptian Arabic)
- Do NOT translate the English part to Arabic
- Do NOT ask questions
- Do NOT start a conversation
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.6,
    });

    const answer =
      completion?.choices?.[0]?.message?.content?.trim() ||
      `Strengths:
- You completed the lesson successfully.

Weak point:
- No major issues noticed.

Practical tip:
- Review the examples once more and practice them.

شغل ممتاز، كمل بنفس الحماس 💪`;

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("AI Tutor error:", err);
    return res.status(500).json({ error: "AI Tutor failed" });
  }
}
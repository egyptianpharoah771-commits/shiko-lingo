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
      skill = "Grammar",
      level = "A1",
      unit,
      score,
      total,
      lessonTitle,
      lessonText,
    } = req.body;

    if (typeof score !== "number" || typeof total !== "number") {
      return res
        .status(400)
        .json({ error: "Score and total are required" });
    }

    const percentage = Math.round((score / total) * 100);

    const systemPrompt = `
You are an English AI tutor.

You are giving feedback for a completed ${skill} lesson.

Student level: CEFR ${level}
Lesson: ${lessonTitle || "English Lesson"}
Unit: ${unit || "Unknown"}
Score: ${score} out of ${total} (${percentage}%)

Lesson content:
${lessonText || "N/A"}

Your task:
- Give a short final evaluation of the student's performance
- Assign a grade using ONLY one letter: A, B, or C
- Give 2–3 short sentences of feedback
- Give one clear recommendation

Rules:
- Be concise
- Be encouraging
- Do NOT ask questions
- Do NOT mention being an AI
- Do NOT use markdown
- Output MUST be valid JSON exactly in this format:

{
  "grade": "A | B | C",
  "feedback": "short feedback text",
  "recommendation": "short recommendation text"
}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.3,
    });

    const raw =
      completion?.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        grade: percentage >= 85 ? "A" : percentage >= 65 ? "B" : "C",
        feedback:
          "You completed the lesson successfully. Keep practicing to improve accuracy.",
        recommendation:
          "Review this lesson once more before moving to the next unit.",
      };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("AI Tutor error:", err);
    return res
      .status(500)
      .json({ error: "AI Tutor failed" });
  }
}
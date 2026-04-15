import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===== RETRY LOGIC (SAFE) =====
async function createChatCompletionWithRetry(client, options, retries = 1) {
  try {
    return await client.chat.completions.create(options);
  } catch (err) {
    if (retries > 0) {
      console.warn("⚠️ OpenAI failed, retrying...");
      return await createChatCompletionWithRetry(
        client,
        options,
        retries - 1
      );
    }
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const systemPrompt = `
You are an English learning coach.
You must follow the exact sections requested in the user prompt.
Keep output short, practical, and specific.
Do not ask questions and do not start conversation.
`.trim();

    const completion = await createChatCompletionWithRetry(
      client,
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.3,
        max_tokens: 170,
      },
      1 // 👈 محاولة إضافية واحدة فقط
    );

    const aiAnswer =
      completion?.choices?.[0]?.message?.content?.trim();

    // ===== SAFE FALLBACK (GUARANTEED FORMAT) =====
    const fallbackCommon = `Encouragement:
- You are making steady progress. Keep going.

Focus Point:
- Focus on applying the main rule more consistently.

Weak Areas:
- Some answers show confusion in key lesson patterns.

Next Practice Step:
- Review two examples from this lesson, then retry one exercise carefully.`;

    return res.status(200).json({
      answer: aiAnswer || fallbackCommon,
    });
  } catch (err) {
    console.error("AI Tutor error:", err);

    return res.status(500).json({
      answer: `Encouragement:
- You are doing well. Keep practicing.

Focus Point:
- Focus on one target skill before moving on.

Weak Areas:
- Feedback is temporarily unavailable.

Next Practice Step:
- Retry this lesson once and review the model examples.`,
    });
  }
}
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
    const {
      question,
      level,
      lessonTitle,
      text,
      passed,
      wrongSkills = [],
    } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const skillsLine =
      wrongSkills.length > 0
        ? `The student struggled with these skills: ${wrongSkills.join(", ")}.`
        : "No specific weak skills were detected.";

    const systemPrompt = `
You are an English AI Tutor helping a student at CEFR level ${level || "A1"}.

Lesson title: ${lessonTitle || "Grammar lesson"}
Lesson content:
${text || "English grammar practice"}

Student result: ${passed ? "PASSED" : "NOT PASSED"}
${skillsLine}

VERY IMPORTANT RULES:
- Always structure your answer EXACTLY like this:

Strengths:
- Mention ONE specific thing the student did well (related to this lesson)

Weak point:
- ${
      passed
        ? 'Say exactly: "No major issues noticed."'
        : "Mention ONE clear grammar weakness, preferably linked to the listed weak skills"
    }

Practical tip:
- Give ONE concrete, practical tip related to THIS lesson
- ${
      passed
        ? "The tip should prepare the student for the NEXT lesson"
        : "The tip should help the student RETRY and improve"
    }

STRICT RULES:
- Use simple English
- Be specific, not generic
- Max 6 short lines total
- Do NOT ask questions
- Do NOT start a conversation
- Do NOT add extra sections
- After the English feedback, add ONE short encouragement sentence in Egyptian Arabic
- Do NOT translate the English part to Arabic
`.trim();

    const completion = await createChatCompletionWithRetry(
      client,
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.5,
      },
      1 // 👈 محاولة إضافية واحدة فقط
    );

    const aiAnswer =
      completion?.choices?.[0]?.message?.content?.trim();

    // ===== SAFE FALLBACK (GUARANTEED FORMAT) =====
    const fallbackPassed = `Strengths:
- You applied the main grammar rule correctly.

Weak point:
- No major issues noticed.

Practical tip:
- Focus on how this grammar point connects to the next lesson.

كمّل كده، مستواك بيتقدم 👏`;

    const fallbackFailed = `Strengths:
- You understand the main idea of the lesson.

Weak point:
- You made mistakes in applying the grammar rule correctly.

Practical tip:
- Review the lesson examples and redo the exercise carefully.

ولا يهمك، المحاولة الجاية أحسن 💪`;

    return res.status(200).json({
      answer: aiAnswer || (passed ? fallbackPassed : fallbackFailed),
    });
  } catch (err) {
    console.error("AI Tutor error:", err);

    return res.status(500).json({
      answer: `Strengths:
- You completed the lesson.

Weak point:
- No feedback could be generated.

Practical tip:
- Review the lesson once more before continuing.

حصلت مشكلة بسيطة، بس كمل وإنت تمام 👍`,
    });
  }
}
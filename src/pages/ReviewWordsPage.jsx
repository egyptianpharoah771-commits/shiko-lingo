import { useEffect, useState, useMemo } from "react";
import { getDailyReviewQueue } from "../utils/reviewQueue";
import { getNextReview } from "../utils/spacedRepetition";
import { addReviewXP } from "../utils/xpEngine";
import { supabase } from "../lib/supabaseClient";
import { isPiAvailable } from "../lib/initPi";

export default function ReviewWordsPage() {

  const [words, setWords] = useState([]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [questionType, setQuestionType] = useState("type");

  const currentWord = words.length > 0 ? words[0] : null;

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {

    if (!currentWord) return;

    const types = ["type", "mcq", "listen"];

    const random =
      types[Math.floor(Math.random() * types.length)];

    setQuestionType(random);

  }, [currentWord]);

  useEffect(() => {

    if (questionType === "listen" && currentWord) {
      speakWord(currentWord.word);
    }

  }, [questionType, currentWord]);

  async function loadWords() {

    try {

      setLoading(true);

      let userId;

      if (isPiAvailable()) {

        userId = localStorage.getItem("pi_uid");

        if (!userId) {
          setWords([]);
          return;
        }

      } else {

        userId = "dev-user";

      }

      const queue = await getDailyReviewQueue(userId);

      setWords(queue || []);

    } catch (error) {

      console.error("Error loading review words:", error);

      setWords([]);

    } finally {

      setLoading(false);

    }

  }

  function speakWord(word) {

    if (!word) return;

    const utter = new SpeechSynthesisUtterance(word);

    utter.lang = "en-US";

    window.speechSynthesis.speak(utter);

  }

  const options = useMemo(() => {

    if (!currentWord || questionType !== "mcq") return [];

    const pool = words
      .slice(1)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const combined = [
      currentWord.definition,
      ...pool.map((w) => w.definition),
    ];

    return combined.sort(() => Math.random() - 0.5);

  }, [words, questionType, currentWord]);

  async function handleAnswer(selected) {

    if (!currentWord || checking) return;

    setChecking(true);

    const correctWord =
      currentWord.word.toLowerCase();

    const isCorrect =
      selected.trim().toLowerCase() === correctWord;

    setFeedback(
      isCorrect
        ? "✅ Excellent!"
        : `❌ Correct word: ${currentWord.word}`
    );

    if (isCorrect) {
      addReviewXP();
    }

    try {

      const { nextStage, nextReview } =
        getNextReview(currentWord.stage, isCorrect);

      await supabase
        .from("vocab_progress")
        .update({
          stage: nextStage,
          next_review: nextReview,
          last_review: new Date().toISOString(),
        })
        .eq("id", currentWord.id);

    } catch (error) {

      console.error("Update error:", error);

    }

    setTimeout(() => {

      const remaining = words.slice(1);

      setWords(remaining);

      setAnswer("");
      setFeedback("");

      setChecking(false);

    }, 700);

  }

  if (loading) {

    return (
      <div style={{ padding: 40 }}>
        Loading review...
      </div>
    );

  }

  if (!currentWord) {

    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <h2>🎉 Great Job!</h2>
        <p>You finished today's review.</p>
      </div>
    );

  }

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 20,
        textAlign: "center"
      }}
    >

      <h2>Daily Review</h2>

      {questionType === "type" && (
        <>
          <p><strong>Definition:</strong></p>
          <p style={{ fontSize: 22 }}>
            {currentWord.definition}
          </p>
        </>
      )}

      {questionType === "listen" && (
        <>
          <p>Listen and type the word</p>
          <button onClick={() => speakWord(currentWord.word)}>
            🔊 Play
          </button>
        </>
      )}

      {(questionType === "type" || questionType === "listen") && (
        <>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleAnswer(answer)
            }
            placeholder="Type here..."
            autoFocus
          />

          <button
            onClick={() => handleAnswer(answer)}
            disabled={checking}
          >
            Check
          </button>
        </>
      )}

      {questionType === "mcq" && (
        <div>

          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() =>
                handleAnswer(
                  opt === currentWord.definition
                    ? currentWord.word
                    : "wrong"
                )
              }
            >
              {opt}
            </button>
          ))}

        </div>
      )}

      {feedback && <p>{feedback}</p>}

      <p style={{ marginTop: 20 }}>
        Remaining: {words.length}
      </p>

    </div>
  );

}
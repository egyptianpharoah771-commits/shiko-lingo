import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getDailyReviewQueue } from "../utils/reviewQueue";
import { getNextReview } from "../utils/spacedRepetition";

export default function ReviewWordsPage() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  const currentWord = words[currentIndex];

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      const userId = user?.id || "dev-user";

      const queue = await getDailyReviewQueue(userId);

      setWords(queue || []);
    } catch (error) {
      console.error("Error loading review words:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkAnswer() {
    if (!currentWord) return;

    const isCorrect =
      answer.trim().toLowerCase() === currentWord.word.toLowerCase();

    setFeedback(
      isCorrect ? "✅ Correct" : `❌ Correct word: ${currentWord.word}`
    );

    try {
      const { nextStage, nextReview } = getNextReview(
        currentWord.stage,
        isCorrect
      );

      await supabase
        .from("vocab_progress")
        .update({
          stage: nextStage,
          next_review: nextReview,
          last_review: new Date().toISOString(),
        })
        .eq("id", currentWord.id);
    } catch (error) {
      console.error("Error updating review progress:", error);
    }

    setTimeout(() => {
      setAnswer("");
      setFeedback("");
      setCurrentIndex((i) => i + 1);
    }, 1000);
  }

  if (loading) {
    return <div>Loading review words...</div>;
  }

  if (!currentWord) {
    return <div>No words to review today 🎉</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Daily Vocabulary Review</h2>

      <p>
        Definition: <strong>{currentWord.definition}</strong>
      </p>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type the word..."
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
          fontSize: 16,
        }}
      />

      <button
        onClick={checkAnswer}
        style={{
          padding: "10px 16px",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Check
      </button>

      <p style={{ marginTop: 10 }}>{feedback}</p>

      <p>
        Word {currentIndex + 1} / {words.length}
      </p>
    </div>
  );
}
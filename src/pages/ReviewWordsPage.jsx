import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getDailyReviewQueue } from "../utils/reviewQueue";
import { getNextReview } from "../utils/spacedRepetition";
import { addReviewXP } from "../utils/xpEngine";

export default function ReviewWordsPage() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const [questionType, setQuestionType] = useState("type");

  const currentWord = words[currentIndex];

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    generateQuestionType();
  }, [currentIndex]);

  function generateQuestionType() {
    const types = ["type", "mcq", "listen"];
    const random = types[Math.floor(Math.random() * types.length)];
    setQuestionType(random);
  }

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

  function speakWord(word) {
    if (!word) return;

    if (window.location.hostname === "localhost") {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "en-US";
      speechSynthesis.speak(utter);
      return;
    }

    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(word)}`
    );

    audio.play().catch(() => {});
  }

  function generateOptions() {
    if (!currentWord) return [];

    const pool = words
      .filter((w) => w.id !== currentWord.id)
      .slice(0, 3);

    const options = [
      currentWord.definition,
      ...pool.map((w) => w.definition),
    ];

    return options.sort(() => Math.random() - 0.5);
  }

  async function handleAnswer(selected) {
    if (!currentWord || checking) return;

    setChecking(true);

    const correctWord = currentWord.word.toLowerCase();

    const isCorrect =
      selected.trim().toLowerCase() === correctWord;

    setFeedback(
      isCorrect ? "✅ Correct" : `❌ Correct word: ${currentWord.word}`
    );

    if (isCorrect) {
      addReviewXP();
    }

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
      setChecking(false);
    }, 900);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleAnswer(answer);
    }
  }

  if (loading) {
    return <div>Loading review words...</div>;
  }

  if (!currentWord) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        🎉 No words to review today
      </div>
    );
  }

  const options = generateOptions();

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 20,
        textAlign: "center",
      }}
    >
      <h2>Daily Vocabulary Review</h2>

      <div
        style={{
          background: "#fff",
          padding: 25,
          borderRadius: 12,
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          marginBottom: 20,
        }}
      >
        {questionType === "type" && (
          <>
            <p><strong>Definition:</strong></p>
            <p style={{ fontSize: 20 }}>
              {currentWord.definition || "Definition not available"}
            </p>
          </>
        )}

        {questionType === "mcq" && (
          <>
            <p><strong>Word:</strong></p>
            <p style={{ fontSize: 22 }}>{currentWord.word}</p>
          </>
        )}

        {questionType === "listen" && (
          <>
            <p><strong>Listen and type the word</strong></p>

            <button
              onClick={() => speakWord(currentWord.word)}
              style={{
                padding: "10px 16px",
                fontSize: 18,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              🔊 Play
            </button>
          </>
        )}
      </div>

      {(questionType === "type" || questionType === "listen") && (
        <>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the word..."
            autoFocus
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => handleAnswer(answer)}
            disabled={checking}
            style={{
              padding: "10px 18px",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 8,
              border: "none",
              background: "#4A2F6E",
              color: "white",
            }}
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
              style={{
                display: "block",
                width: "100%",
                marginBottom: 10,
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#fafafa",
                cursor: "pointer",
              }}
            >
              {opt || "Definition not available"}
            </button>
          ))}
        </div>
      )}

      <p style={{ marginTop: 12 }}>{feedback}</p>

      <p style={{ marginTop: 20 }}>
        Word {currentIndex + 1} / {words.length}
      </p>
    </div>
  );
}
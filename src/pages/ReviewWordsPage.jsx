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

  const [initialCount, setInitialCount] = useState(0);
  const [xpFlash, setXpFlash] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentWord = words.length > 0 ? words[0] : null;

  useEffect(() => {
    loadWords();
    loadStreak();
  }, []);

  useEffect(() => {

    if (!currentWord) return;

    const types = ["type", "mcq", "listen"];
    const random = types[Math.floor(Math.random() * types.length)];

    setQuestionType(random);

  }, [currentWord]);

  useEffect(() => {

    if (questionType === "listen" && currentWord?.word) {
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

      const safeQueue = Array.isArray(queue) ? queue : [];

      setWords(safeQueue);
      setInitialCount(safeQueue.length);

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

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);

  }

  function playCorrectSound() {
    const audio = new Audio("/sounds/correct.mp3");
    audio.play().catch(() => {});
  }

  function playWrongSound() {
    const audio = new Audio("/sounds/wrong.mp3");
    audio.play().catch(() => {});
  }

  function loadStreak() {

    try {

      const saved = JSON.parse(
        localStorage.getItem("review_streak")
      );

      if (!saved) {
        setStreak(0);
        return;
      }

      const today = new Date().toDateString();
      const last = new Date(saved.lastDate).toDateString();

      if (today === last) {
        setStreak(saved.count);
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        new Date(saved.lastDate).toDateString() ===
        yesterday.toDateString()
      ) {

        const newCount = saved.count + 1;

        setStreak(newCount);

        localStorage.setItem(
          "review_streak",
          JSON.stringify({
            count: newCount,
            lastDate: new Date().toISOString(),
          })
        );

      } else {

        setStreak(1);

        localStorage.setItem(
          "review_streak",
          JSON.stringify({
            count: 1,
            lastDate: new Date().toISOString(),
          })
        );

      }

    } catch {

      setStreak(0);

    }

  }

  const options = useMemo(() => {

    if (!currentWord || questionType !== "mcq") return [];

    const distractors = words
      .filter((w) => w.id !== currentWord.id && w.definition)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((w) => w.definition);

    const combined = [
      currentWord.definition,
      ...distractors,
    ];

    return combined.sort(() => Math.random() - 0.5);

  }, [words, questionType, currentWord]);

  async function handleAnswer(selected) {

    if (!currentWord || checking) return;

    setChecking(true);

    const correctWord = currentWord.word?.toLowerCase() || "";

    const isCorrect =
      selected?.trim().toLowerCase() === correctWord;

    if (isCorrect) {

      setFeedback("✅ Excellent!");
      playCorrectSound();
      addReviewXP();

      setXpFlash(true);
      setTimeout(() => setXpFlash(false), 700);

    } else {

      setFeedback(`❌ Correct word: ${currentWord.word}`);
      playWrongSound();

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

      setWords((prev) => prev.slice(1));

      setAnswer("");
      setFeedback("");
      setChecking(false);

    }, 800);

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

  const progressDone = initialCount - words.length;

  const progressPercent =
    initialCount === 0
      ? 0
      : Math.round((progressDone / initialCount) * 100);

  return (
    <div
      style={{
        maxWidth: 520,
        margin: "40px auto",
        padding: 20,
        textAlign: "center",
      }}
    >

      <h2>Daily Review</h2>

      <p>🔥 Streak: {streak} days</p>

      <p style={{ color: "#666" }}>
        Progress: {progressDone} / {initialCount}
      </p>

      <div
        style={{
          height: 8,
          background: "#eee",
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: "100%",
            background: "#4A90E2",
          }}
        />
      </div>

      {xpFlash && (
        <div style={{ color: "#27ae60", fontWeight: "bold" }}>
          +XP
        </div>
      )}

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

          <p>
            <strong>Choose the correct meaning of:</strong>
          </p>

          <p style={{ fontSize: 22, marginBottom: 20 }}>
            {currentWord.word}
          </p>

          {options.map((opt, i) => (
            <button
              key={i}
              style={{
                display: "block",
                margin: "8px auto",
                padding: "10px 16px",
              }}
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

      {feedback && (
        <p style={{ marginTop: 20, fontWeight: "bold" }}>
          {feedback}
        </p>
      )}

      <p style={{ marginTop: 20 }}>
        Remaining: {words.length}
      </p>

    </div>
  );

}
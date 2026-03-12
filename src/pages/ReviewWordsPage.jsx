/**
 * 🛠️ Shiko Lingo - Vocabulary Review Page (Fixed Version)
 * وضع الشريك التقني: تركيز 1000%
 */
import { useEffect, useState, useMemo } from "react";
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
  const [isFinished, setIsFinished] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    if (currentWord) {
      generateQuestionType();
      if (questionType === "listen") {
        speakWord(currentWord.word);
      }
    }
  }, [currentIndex, words.length]);

  function generateQuestionType() {
    const types = ["type", "mcq", "listen"];
    const random = types[Math.floor(Math.random() * types.length)];
    setQuestionType(random);
  }

  async function loadWords() {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "dev-user";
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
    if (typeof window !== "undefined") {
      const utter = new SpeechSynthesisUtterance(word);
      utter.lang = "en-US";
      window.speechSynthesis.speak(utter);
    }
  }

  const options = useMemo(() => {
    if (!currentWord || questionType !== "mcq") return [];
    const pool = words
      .filter((w) => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    const combinedOptions = [currentWord.definition, ...pool.map((w) => w.definition)];
    return combinedOptions.sort(() => Math.random() - 0.5);
  }, [currentIndex, words, questionType, currentWord]);

  async function handleAnswer(selected) {
    if (!currentWord || checking) return;
    setChecking(true);
    const correctWord = currentWord.word.toLowerCase();
    const isCorrect = selected.trim().toLowerCase() === correctWord;

    setFeedback(isCorrect ? "✅ Excellent!" : `❌ Correct word: ${currentWord.word}`);
    if (isCorrect) addReviewXP();

    try {
      const { nextStage, nextReview } = getNextReview(currentWord.stage, isCorrect);
      await supabase
        .from("vocab_progress")
        .update({
          stage: nextStage,
          next_review: nextReview,
          last_review: new Date().toISOString(),
        })
        .eq("id", currentWord.id);
    } catch (error) {
      console.error("Error updating progress:", error);
    }

    setTimeout(() => {
      setAnswer("");
      setFeedback("");
      if (currentIndex + 1 < words.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setIsFinished(true);
      }
      setChecking(false);
    }, 1200);
  }

  if (loading) return <div style={centerStyle}>Loading your review...</div>;

  if (isFinished || words.length === 0) {
    return (
      <div style={centerStyle}>
        <h2 style={{ fontSize: 40 }}>🎉</h2>
        <h3>Great Job!</h3>
        <p>You've finished today's review.</p>
        <button onClick={() => window.location.href = '/dashboard'} style={mainBtnStyle}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={progressContainer}>
        <div style={{ ...progressBar, width: `${((currentIndex + 1) / words.length) * 100}%` }}></div>
      </div>

      <h2 style={{ color: "#4A2F6E" }}>Daily Review</h2>

      <div style={cardStyle}>
        {questionType === "type" && (
          <>
            <p><strong>Definition:</strong></p>
            <p style={{ fontSize: 22, color: "#333" }}>{currentWord.definition}</p>
          </>
        )}
        {questionType === "mcq" && (
          <>
            <p><strong>Choose the definition for:</strong></p>
            <p style={{ fontSize: 28, fontWeight: "bold", color: "#4A2F6E" }}>{currentWord.word}</p>
          </>
        )}
        {questionType === "listen" && (
          <>
            <p><strong>Listen and type what you hear</strong></p>
            <button onClick={() => speakWord(currentWord.word)} style={audioBtnStyle}>🔊 Replay</button>
          </>
        )}
      </div>

      {(questionType === "type" || questionType === "listen") && (
        <>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnswer(answer)}
            placeholder="Type here..."
            autoFocus
            style={inputStyle}
          />
          <button onClick={() => handleAnswer(answer)} disabled={checking} style={mainBtnStyle}>
            {checking ? "Checking..." : "Check Answer"}
          </button>
        </>
      )}

      {questionType === "mcq" && (
        <div style={mcqGrid}>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt === currentWord.definition ? currentWord.word : "wrong")}
              style={mcqBtnStyle}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {feedback && <div style={feedbackStyle(feedback)}>{feedback}</div>}
      <p style={{ marginTop: 25, fontSize: 14, color: "#999" }}>Progress: {currentIndex + 1} / {words.length}</p>
    </div>
  );
}

// 🎨 Styles Object
const containerStyle = { maxWidth: 520, margin: "40px auto", padding: 20, textAlign: "center" };
const centerStyle = { padding: 60, textAlign: "center" };
const cardStyle = { background: "#fff", padding: 30, borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.05)", marginBottom: 25 };
const inputStyle = { width: "100%", padding: 15, marginBottom: 15, fontSize: 18, borderRadius: 10, border: "2px solid #eee", textAlign: "center" };
const mainBtnStyle = { padding: "12px 30px", fontSize: 18, cursor: "pointer", borderRadius: 10, border: "none", background: "#4A2F6E", color: "white" };
const audioBtnStyle = { padding: "12px 20px", fontSize: 16, borderRadius: 50, cursor: "pointer", border: "1px solid #4A2F6E", background: "#fff", color: "#4A2F6E" };
const mcqGrid = { display: "flex", flexDirection: "column", gap: 12 };
const mcqBtnStyle = { padding: 15, borderRadius: 12, border: "1px solid #eee", background: "#fff", cursor: "pointer", fontSize: 16, textAlign: "left" };
const progressContainer = { width: "100%", height: 8, background: "#eee", borderRadius: 10, marginBottom: 30, overflow: "hidden" };
const progressBar = { height: "100%", background: "#4A2F6E", transition: "width 0.4s ease" };
const feedbackStyle = (f) => ({ marginTop: 20, padding: 10, borderRadius: 8, backgroundColor: f.includes("✅") ? "#e6fffa" : "#fff5f5", color: f.includes("✅") ? "#2c7a7b" : "#c53030", fontWeight: "bold" });
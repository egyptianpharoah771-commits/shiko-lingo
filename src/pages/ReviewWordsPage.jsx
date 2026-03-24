import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { initUserProgress } from "../utils/initUserProgress";

function normalize(word) {
  return word?.toLowerCase().trim() || "";
}

export default function ReviewWordsPage() {
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);

  const [words, setWords] = useState([]);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [userLevel, setUserLevel] = useState("A1");
  const [userInput, setUserInput] = useState("");

  const correctSound = useRef(null);
  const wrongSound = useRef(null);

  useEffect(() => {
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
  }, []);

  const loadWords = useCallback(async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("pi_uid") || "dev-user";
      await initUserProgress(userId);

      const assessment = JSON.parse(
        localStorage.getItem("level_assessment_result") || "{}"
      );

      const currentLevel = (assessment.level || "A1").toString().trim().toUpperCase();
      setUserLevel(currentLevel);

      console.log("LEVEL:", currentLevel);

      const { data, error } = await supabase
        .from("words")
        .select("id, word, definition, simple_definition, level, audio_url")
        .ilike("level", currentLevel)
        .limit(30);

      if (error) throw error;

      console.log("RAW:", data?.length);

      // 🔥 FIX الحقيقي هنا
      const cleaned = (data || [])
        .map((w, i) => {
          const simple = w.simple_definition?.trim();
          const fallback = w.definition?.trim();

          const definition =
            simple && simple.length > 2
              ? simple
              : fallback && fallback.length > 2
              ? fallback
              : null;

          if (!definition) return null;

          return {
            ...w,
            definition,
            stage: i % 6,
          };
        })
        .filter(Boolean);

      console.log("CLEANED:", cleaned.length);

      setWords(cleaned);
    } catch (err) {
      console.error("Load Error:", err);
      setWords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, [loadWords]);

  const currentWord = words[0];

  useEffect(() => {
    if (!currentWord) return;

    const definition = currentWord.definition;

    if (!definition) {
      setWords((prev) => prev.slice(1));
      return;
    }

    let type = "MCQ";
    if (currentWord.stage >= 2 && currentWord.stage <= 3) type = "TYPE";
    if (currentWord.stage >= 4) type = "LISTEN";

    let options = [];

    if (type === "MCQ") {
      const pool = words
        .map((w) => w.word)
        .filter((w) => w && w !== currentWord.word);

      const unique = [...new Set(pool)];

      if (unique.length >= 3) {
        const shuffled = [...unique].sort(() => 0.5 - Math.random());

        options = [
          currentWord.word,
          ...shuffled.slice(0, 3),
        ].sort(() => 0.5 - Math.random());
      } else {
        type = "TYPE";
      }
    }

    const audioUrl =
      currentWord.audio_url ||
      `/api/tts?text=${encodeURIComponent(currentWord.word)}`;

    setQuestion({
      type,
      prompt: definition,
      correct: currentWord.word,
      audio: audioUrl,
      options,
    });
  }, [currentWord, words]);

  function handleAnswer(selected) {
    if (!question || checking) return;

    setChecking(true);

    const isCorrect =
      normalize(selected) === normalize(question.correct);

    const sound = isCorrect ? correctSound.current : wrongSound.current;

    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }

    setFeedback(isCorrect ? "✅ صحيح" : `❌ ${question.correct}`);

    timeoutRef.current = setTimeout(() => {
      const updatedWord = {
        ...currentWord,
        stage: (currentWord.stage + 1) % 6,
      };

      setWords((prev) => [...prev.slice(1), updatedWord]);

      setFeedback("");
      setUserInput("");
      setChecking(false);
      setQuestion(null);
    }, 1000);
  }

  if (loading) return <div>Loading...</div>;

  if (!words.length)
    return <div style={{ padding: 40 }}>No words available</div>;

  if (!question) return <div>...</div>;

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <div>
        Level: {currentWord.level} | Type: {question.type}
      </div>

      {question.type === "LISTEN" ? (
        <div>
          <audio ref={audioRef} src={question.audio} />
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
            }}
          >
            🔊 Play
          </button>
        </div>
      ) : (
        <h2>{question.prompt}</h2>
      )}

      {question.type === "MCQ" ? (
        <div>
          {question.options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)}>
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type the word"
          />
          <button onClick={() => handleAnswer(userInput)}>
            Submit
          </button>
        </div>
      )}

      {feedback && <div>{feedback}</div>}
    </div>
  );
}
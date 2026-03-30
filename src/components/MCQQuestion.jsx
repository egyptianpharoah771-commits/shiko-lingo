import { useMemo, useRef } from "react";
import { generateMCQOptions } from "../../utils/mcqGenerator";
import TypeQuestion from "./TypeQuestion";
import { playCorrect, playWrong } from "../../utils/sfx";

export default function MCQQuestion({ word, words, onAnswer }) {
  const audioRef = useRef(null);

  const options = useMemo(() => {
    return generateMCQOptions(word, words);
  }, [word, words]);

  if (!word) return null;

  // 🔊 تشغيل صوت الكلمة (local فقط)
  function playWordAudio() {
    if (!word?.audio) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(word.audio);
      audioRef.current = audio;

      audio.play().catch(() => {});
    } catch (err) {
      console.warn("Audio error:", err);
    }
  }

  // 🔥 fallback → TYPE لو options قليلة
  if (!options || options.length < 4) {
    return <TypeQuestion word={word} onAnswer={onAnswer} />;
  }

  function handleAnswer(opt) {
    const isCorrect = opt === word.definition;

    // 🔊 صوت الصح / الغلط (system موحد)
    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }

    onAnswer(isCorrect);
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      {/* ✅ الكلمة دايمًا إنجليزي */}
      <h3 style={{ marginBottom: 10 }}>
        {word.word}
      </h3>

      {/* 🔊 زر الصوت */}
      {word.audio && (
        <button
          onClick={playWordAudio}
          style={{ marginBottom: 10 }}
        >
          🔊
        </button>
      )}

      {/* 🧠 توضيح للمستخدم */}
      <p style={{ opacity: 0.6, marginBottom: 15 }}>
        Choose the correct meaning
      </p>

      {/* ✅ الخيارات */}
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(opt)}
          style={{
            display: "block",
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
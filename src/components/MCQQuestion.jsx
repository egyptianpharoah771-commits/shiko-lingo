import { useMemo, useRef } from "react";
import { generateMCQOptions } from "../../utils/mcqGenerator";
import TypeQuestion from "./TypeQuestion";
import { playCorrect, playWrong } from "../../utils/sfx";

function normalize(text) {
  return text?.toLowerCase().trim();
}

export default function MCQQuestion({ word, words, onAnswer }) {
  const audioRef = useRef(null);

  const options = useMemo(() => {
    return generateMCQOptions(word, words);
  }, [word, words]);

  if (!word) return null;

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

  // fallback → TYPE
  if (!options || options.length < 4) {
    return <TypeQuestion word={word} onAnswer={onAnswer} />;
  }

  function handleAnswer(opt) {
    const isCorrect =
      normalize(opt) === normalize(word.definition);

    if (isCorrect) {
      playCorrect();
    } else {
      playWrong();
    }

    onAnswer(isCorrect);
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h3 style={{ marginBottom: 10 }}>
        {word.word}
      </h3>

      {word.audio && (
        <button onClick={playWordAudio} style={{ marginBottom: 10 }}>
          🔊
        </button>
      )}

      <p style={{ opacity: 0.6, marginBottom: 15 }}>
        Choose the correct meaning
      </p>

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
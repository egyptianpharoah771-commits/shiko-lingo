import { useMemo } from "react";
import { generateMCQOptions } from "../../utils/mcqGenerator";
import TypeQuestion from "./TypeQuestion";

export default function MCQQuestion({ word, words, onAnswer }) {
  const options = useMemo(() => {
    return generateMCQOptions(word, words);
  }, [word, words]);

  if (!word) return null;

  // 🔊 تشغيل صوت آمن (Chrome + Pi)
  function playSound(type) {
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.currentTime = 0;

      audio.play().catch((err) => {
        console.warn("Sound blocked or failed:", err);
      });
    } catch (err) {
      console.warn("Audio error:", err);
    }
  }

  // 🔥 لو مفيش options كفاية → fallback TYPE
  if (!options || options.length < 4) {
    return <TypeQuestion word={word} onAnswer={onAnswer} />;
  }

  function handleAnswer(opt) {
    const isCorrect = opt === word.definition;

    // 🔊 صوت الصح / الغلط
    if (isCorrect) {
      playSound("correct");
    } else {
      playSound("wrong");
    }

    onAnswer(isCorrect);
  }

  return (
    <div>
      <p>{word.word}</p>

      {options.map((opt, i) => (
        <button key={i} onClick={() => handleAnswer(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}
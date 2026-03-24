import { useMemo } from "react";
import { generateMCQOptions } from "utils/mcqGenerator";
import TypeQuestion from "./TypeQuestion";

export default function MCQQuestion({ word, words, onAnswer }) {
  const options = useMemo(() => {
    return generateMCQOptions(word, words);
  }, [word, words]);

  if (!word) return null;

  // 🔥 لو مفيش options كفاية → fallback TYPE
  if (!options || options.length < 4) {
    return <TypeQuestion word={word} onAnswer={onAnswer} />;
  }

  return (
    <div>
      <p>{word.word}</p>

      {options.map((opt, i) => (
        <button key={i} onClick={() => onAnswer(opt === word.definition)}>
          {opt}
        </button>
      ))}
    </div>
  );
}



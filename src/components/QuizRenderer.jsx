import MCQQuestion from "./MCQQuestion";
import TypeQuestion from "./TypeQuestion";
import ListenQuestion from "./ListenQuestion";
import { useWords } from "../hooks/useWords";
import { useQuizEngine } from "../core/engine/useQuizEngine";

export default function QuizRenderer({ level }) {
  const { words, loading } = useWords(level);

  // ✅ FIX: حماية ضد undefined
  const safeWords = Array.isArray(words) ? words : [];

  const { current, type, options, next } = useQuizEngine(safeWords);

  if (loading) return <p>Loading...</p>;

  // ✅ FIX: بدل ما يسيبها تكراش
  if (!safeWords.length) {
    return (
      <p style={{ textAlign: "center", padding: "40px" }}>
        No words available
      </p>
    );
  }

  if (!current) {
    return (
      <p style={{ textAlign: "center", padding: "40px" }}>
        Preparing questions...
      </p>
    );
  }

  if (type === "mcq") {
    return (
      <MCQQuestion
        word={current}
        options={options || []} // ✅ حماية
        onAnswer={next}
      />
    );
  }

  if (type === "type") {
    return (
      <TypeQuestion
        word={current}
        onAnswer={next}
      />
    );
  }

  return (
    <ListenQuestion
      word={current}
      onAnswer={next}
    />
  );
}
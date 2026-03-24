import MCQQuestion from "./MCQQuestion";
import TypeQuestion from "./TypeQuestion";
import ListenQuestion from "./ListenQuestion";
import { useWords } from "../hooks/useWords";
import { useQuizEngine } from "../core/useQuizEngine";

export default function QuizRenderer({ level }) {
  const { words, loading } = useWords(level);
  const { current, type, options, next } = useQuizEngine(words);

  if (loading) return <p>Loading...</p>;
  if (!current) return <p>No words available</p>;

  if (type === "mcq") {
    return (
      <MCQQuestion
        word={current}
        options={options}
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



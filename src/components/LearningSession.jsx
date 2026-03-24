import { useEffect, useState } from "react";
import { prepareSession } from "../engine/sessionEngine";

export default function LearningSession({ words }) {
  const [session, setSession] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const built = prepareSession(words, {}, 10);

    console.log("SESSION:", built);

    setSession(built);
    setIndex(0);
  }, [words]);

  if (session.length === 0) {
    return <div>Loading or No Data</div>;
  }

  const current = session[index];

  if (!current) {
    return <div>Done</div>;
  }

  return (
    <div>
      <h2>{current.word}</h2>

      {current.options.map((opt, i) => (
        <button key={i}>{opt}</button>
      ))}
    </div>
  );
}
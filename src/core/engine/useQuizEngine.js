import { useState, useEffect } from "react";
import { generateMCQOptions } from "../../utils/mcqGenerator";
export function useQuizEngine(words, level = "A1") {
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const [type, setType] = useState("mcq");
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!words?.length) return;

    const word = words[index % words.length];

    const mcq = generateMCQOptions(word, words, level);

    if (mcq.length === 4) {
      setType("mcq");
      setOptions(mcq);
    } else {
      setType("type");
      setOptions([]);
    }

    setCurrent(word);
  }, [index, words, level]);

  function next() {
    setIndex((prev) => prev + 1);
  }

  return {
    current,
    type,
    options,
    next,
  };
}



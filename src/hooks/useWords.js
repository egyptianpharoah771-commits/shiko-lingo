import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function normalizeWord(raw) {
  if (!raw) return null;

  const definition =
    raw.simple_definition?.trim() ||
    raw.definition?.trim();

  if (!definition) return null;

  return {
    id: raw.id,
    word: raw.word,
    definition,
    level: raw.level,
    audio_url: raw.audio_url || null,
  };
}

export function useWords(level) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!level) return;

    async function fetchWords() {
      setLoading(true);

      const { data, error } = await supabase
        .from("words")
        .select("*")
        .ilike("level", level)
        .limit(50);

      if (error) {
        console.error(error);
        setWords([]);
        setLoading(false);
        return;
      }

      const cleaned = (data || [])
        .map(normalizeWord)
        .filter(Boolean);

      console.log("WORDS:", cleaned.length);

      setWords(cleaned);
      setLoading(false);
    }

    fetchWords();
  }, [level]);

  return { words, loading };
}



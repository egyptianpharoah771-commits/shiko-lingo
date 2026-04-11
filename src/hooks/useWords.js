import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ✅ FIX: explicit path (Vercel safe)
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";

function normalizeWord(raw) {
  if (!raw) return null;

  const definition =
    raw.simple_definition?.trim() ||
    raw.definition?.trim() ||
    raw.meaning?.trim();

  if (!definition) return null;

  return {
    id: raw.id || raw.word,
    word: raw.word,
    definition,
    level: raw.level,
    audio: raw.audio || raw.audio_url || null,
  };
}

export function useWords(level) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!level) return;

    async function fetchWords() {
      setLoading(true);

      try {
        // 🥇 Supabase first
        const { data, error } = await supabase
          .from("words")
          .select("id, word, simple_definition, definition, audio_url, level")
          .ilike("level", level)
          .limit(50);

        if (!error && data && data.length) {
          const cleaned = data.map(normalizeWord).filter(Boolean);

          if (cleaned.length) {
            setWords(cleaned);
            setLoading(false);
            return;
          }
        }

        // 🥈 Local fallback
        const levelData = VOCABULARY_DATA[level];

        if (levelData) {
          const localWords = Object.values(levelData).flatMap((unit) =>
            (unit.content?.items || []).map((item) => ({
              id: item.word,
              word: item.word,
              definition: item.meaning,
              audio: item.audio,
              level,
            }))
          );

          setWords(localWords);
        } else {
          setWords([]);
        }
      } catch (err) {
        console.error("useWords error:", err);
        setWords([]);
      }

      setLoading(false);
    }

    fetchWords();
  }, [level]);

  return { words, loading };
}
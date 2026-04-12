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

  const audioSrc = raw.audio || raw.audio_url || null;

  return {
    id: raw.id || raw.word,
    word: raw.word,
    definition,
    level: raw.level || raw.cefr_level,
    audio: audioSrc,
    audio_url: audioSrc,
    simple_definition: raw.simple_definition,
  };
}

export function useWords(level) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 FIX 1: guard حقيقي
    if (!level || level === "session") {
      setWords([]);
      setLoading(false);
      return;
    }

    async function fetchWords() {
      setLoading(true);

      try {
        // select("*") avoids PostgREST 400 when optional columns (e.g. definition) are missing.
        // Try common CEFR column names used in different schemas.
        let { data, error } = await supabase
          .from("words")
          .select("*")
          .eq("level", level)
          .limit(50);

        if (error) {
          const second = await supabase
            .from("words")
            .select("*")
            .eq("cefr_level", level)
            .limit(50);
          data = second.data;
          error = second.error;
        }

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
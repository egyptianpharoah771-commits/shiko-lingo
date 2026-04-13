import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ✅ FIX: explicit path (Vercel safe)
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";

function getCanonicalLevel(raw) {
  const fromCefr = raw?.cefr_level ? String(raw.cefr_level).toUpperCase().trim() : "";
  const fromLevel = raw?.level ? String(raw.level).toUpperCase().trim() : "";
  // Prefer cefr_level when available because some datasets keep legacy `level` values.
  return fromCefr || fromLevel || "";
}

function normalizeWord(raw, requestedLevel = "") {
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
    level: getCanonicalLevel(raw) || requestedLevel,
    audio: audioSrc,
    audio_url: audioSrc,
    simple_definition: raw.simple_definition,
  };
}

export function useWords(level) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const normalizedLevel = (level || "").toUpperCase();

    // 🔥 FIX 1: guard حقيقي
    if (!normalizedLevel || normalizedLevel === "SESSION") {
      setWords([]);
      setLoading(false);
      return;
    }

    // Prevent stale words from previous level while fetching new data.
    setWords([]);
    setLoading(true);

    async function fetchWords() {
      try {
        // select("*") avoids PostgREST 400 when optional columns (e.g. definition) are missing.
        // Try common CEFR column names used in different schemas.
        let { data, error } = await supabase
          .from("words")
          .select("*")
          .eq("cefr_level", normalizedLevel)
          .limit(50);

        if (error || !data?.length) {
          const second = await supabase
            .from("words")
            .select("*")
            .eq("level", normalizedLevel)
            .limit(50);
          data = second.data;
          error = second.error;
        }

        if (!error && data && data.length) {
          const cleaned = data
            .map((item) => normalizeWord(item, normalizedLevel))
            .filter(Boolean)
            .filter((item) => item.level === normalizedLevel);

          if (cleaned.length) {
            setWords(cleaned);
            setLoading(false);
            return;
          }
        }

        // 🥈 Local fallback
        const levelData = VOCABULARY_DATA[normalizedLevel];

        if (levelData) {
          const localWords = Object.values(levelData).flatMap((unit) =>
            (unit.content?.items || []).map((item) => ({
              id: item.word,
              word: item.word,
              definition: item.meaning,
              audio: item.audio,
              level: normalizedLevel,
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
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/*
  Review Words Page
  Supabase Version
  - Reads words from vocab_progress
  - Flashcard review
  - Pronounce
  - Mark as Known
*/

function speak(word) {
  if (!word) return;

  const audio = new Audio(
    `/api/tts?text=${encodeURIComponent(word)}&lang=en`
  );

  audio.play().catch(() => {});
}

function ReviewWords() {
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);

  const current = words[index];

  useEffect(() => {
    loadWords();
  }, []);

  async function loadWords() {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      const userId = user?.id || "dev-user";

      const { data: rows, error } = await supabase
        .from("vocab_progress")
        .select("*")
        .eq("user_id", userId)
        .order("stage", { ascending: true });

      if (error) {
        console.error("Fetch words error:", error);
        setWords([]);
      } else {
        setWords(rows || []);
      }
    } catch (err) {
      console.error("Load words error:", err);
    }

    setLoading(false);
  }

  function next() {
    setShowMeaning(false);
    setIndex((i) => (i + 1) % words.length);
  }

  function prev() {
    setShowMeaning(false);
    setIndex((i) =>
      i === 0 ? words.length - 1 : i - 1
    );
  }

  async function markKnown() {
    if (!current) return;

    await supabase
      .from("vocab_progress")
      .delete()
      .eq("id", current.id);

    const updated = words.filter((w) => w.id !== current.id);

    setWords(updated);
    setIndex(0);
    setShowMeaning(false);
  }

  async function clearAll() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    const userId = user?.id || "dev-user";

    await supabase
      .from("vocab_progress")
      .delete()
      .eq("user_id", userId);

    setWords([]);
    setIndex(0);
  }

  if (loading) {
    return (
      <div style={container}>
        <h2>📚 Review Words</h2>
        <p>Loading words...</p>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div style={container}>
        <h2>📚 Review Words</h2>
        <p>No saved words yet.</p>
      </div>
    );
  }

  return (
    <div style={container}>
      <h2>📚 Review Words</h2>

      <div style={counter}>
        {index + 1} / {words.length}
      </div>

      <div style={card}>
        <h1 style={{ marginBottom: 10 }}>
          {current.word}
        </h1>

        <button
          style={btnSmall}
          onClick={() => speak(current.word)}
        >
          🔊 Pronounce
        </button>

        <div style={{ marginTop: 20 }}>
          {!showMeaning ? (
            <button
              style={btnPrimary}
              onClick={() => setShowMeaning(true)}
            >
              Show Meaning
            </button>
          ) : (
            <div>
              <p style={{ fontStyle: "italic" }}>
                {current.definition ||
                  "Definition not available"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={navRow}>
        <button style={btn} onClick={prev}>
          ← Previous
        </button>

        <button style={btn} onClick={next}>
          Next →
        </button>
      </div>

      <div style={actionRow}>
        <button style={btnDanger} onClick={markKnown}>
          Mark as Known
        </button>

        <button style={btnClear} onClick={clearAll}>
          Clear All
        </button>
      </div>
    </div>
  );
}

/* styles */

const container = {
  maxWidth: 700,
  margin: "0 auto",
  padding: 20,
  textAlign: "center",
};

const card = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  marginTop: 20,
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const counter = {
  marginTop: 10,
  color: "#666",
};

const navRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 20,
};

const actionRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 20,
};

const btn = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#4A90E2",
  color: "#fff",
  cursor: "pointer",
};

const btnPrimary = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#4A90E2",
  color: "#fff",
  cursor: "pointer",
};

const btnSmall = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  background: "#fafafa",
  cursor: "pointer",
};

const btnDanger = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#E53935",
  color: "#fff",
  cursor: "pointer",
};

const btnClear = {
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #aaa",
  background: "#fff",
  cursor: "pointer",
};

export default ReviewWords;
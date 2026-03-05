import { useEffect, useState } from "react";

/*
  Review Words Page
  - Reads saved words from localStorage: VOCAB_SAVED
  - Flashcard view
  - Pronounce
  - Mark as Known (remove)
  - Clear all
*/

const STORAGE_KEY = "VOCAB_SAVED";

function loadWords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveWords(words) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function speak(word) {
  if (!word) return;
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US";
  speechSynthesis.speak(u);
}

function ReviewWords() {
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [meaning, setMeaning] = useState("");

  useEffect(() => {
    setWords(loadWords());
  }, []);

  const current = words[index];

  useEffect(() => {
    let cancelled = false;

    async function loadMeaning() {
      setMeaning("");
      if (!current) return;

      try {
        const res = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${current}`
        );
        if (!res.ok) return;

        const data = await res.json();
        const def =
          data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

        if (!cancelled && def) setMeaning(def);
      } catch {}
    }

    loadMeaning();

    return () => {
      cancelled = true;
    };
  }, [current]);

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

  function removeWord() {
    const updated = words.filter((w) => w !== current);
    saveWords(updated);
    setWords(updated);
    setIndex(0);
    setShowMeaning(false);
  }

  function clearAll() {
    saveWords([]);
    setWords([]);
    setIndex(0);
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
        <h1 style={{ marginBottom: 10 }}>{current}</h1>

        <button style={btnSmall} onClick={() => speak(current)}>
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
                {meaning || "Definition not available"}
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
        <button style={btnDanger} onClick={removeWord}>
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
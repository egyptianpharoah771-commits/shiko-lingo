import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import "./vocabulary.css";

const LEVEL_COLORS = {
  A1: "#4A90E2",
  A2: "#43A047",
  B1: "#F9A825",
  B2: "#FB8C00",
  C1: "#D81B60",
};

function getProgress(level) {
  const key = `vocabularyProgress_${level}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).completedUnits || [] : [];
  } catch {
    return [];
  }
}

function VocabularyPage() {

  const levels = Object.keys(VOCABULARY_DATA || {});

  const [view, setView] = useState("main");

  const [savedWords, setSavedWords] = useState([]);
  const [wordDetails, setWordDetails] = useState({});
  const [loadingWords, setLoadingWords] = useState(true);

  const speakWord = (word, example = "") => {

    if (!word) return;

    const text = example ? `${word}. ${example}` : word;

    if (window.location.hostname === "localhost") {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      speechSynthesis.speak(utter);
      return;
    }

    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(text)}`
    );

    audio.play().catch(() => {});
  };

  const removeWord = (word) => {

    const updated = savedWords.filter((w) => w !== word);

    localStorage.setItem("VOCAB_SAVED", JSON.stringify(updated));

    setSavedWords(updated);

    const copy = { ...wordDetails };
    delete copy[word];
    setWordDetails(copy);
  };

  useEffect(() => {

    const saved = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );

    setSavedWords(saved);

  }, []);

  useEffect(() => {

    if (!savedWords.length) {
      setLoadingWords(false);
      return;
    }

    const loadDefinitions = async () => {

      const results = {};

      for (const word of savedWords) {

        try {

          const dictRes = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          let definition = "";
          let example = "";
          let arabic = "";

          if (dictRes.ok) {

            const data = await dictRes.json();

            definition =
              data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition || "";

            example =
              data?.[0]?.meanings?.[0]?.definitions?.[0]?.example || "";
          }

          if (definition) {

            const transRes = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
                definition
              )}&langpair=en|ar`
            );

            if (transRes.ok) {

              const t = await transRes.json();

              arabic = t?.responseData?.translatedText || "";
            }
          }

          results[word] = { definition, example, arabic };

        } catch {

          results[word] = {
            definition: "Definition not available",
            example: "",
            arabic: "",
          };

        }
      }

      setWordDetails(results);
      setLoadingWords(false);
    };

    loadDefinitions();

  }, [savedWords]);

  return (

    <div className="vocab-page">

      <h1>📘 Vocabulary</h1>

      {/* MAIN ICON */}

      {view === "main" && (

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center"
          }}
        >

          <div
            onClick={() => setView("menu")}
            style={{
              padding: 40,
              borderRadius: 18,
              background: "#ffffff",
              boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
              cursor: "pointer",
              textAlign: "center"
            }}
          >
            <h2>📘 Vocabulary</h2>
            <p>Open vocabulary tools</p>
          </div>

        </div>

      )}

      {/* SECOND LEVEL MENU */}

      {view === "menu" && (

        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 20
          }}
        >

          <div
            onClick={() => setView("saved")}
            style={{
              padding: 28,
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              cursor: "pointer"
            }}
          >
            <h2>⭐ Saved Words</h2>
          </div>

          <div
            onClick={() => setView("units")}
            style={{
              padding: 28,
              borderRadius: 16,
              background: "#ffffff",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              cursor: "pointer"
            }}
          >
            <h2>📚 Vocabulary Units</h2>
          </div>

        </div>

      )}

      {/* SAVED WORDS */}

      {view === "saved" && (

        <>
          <button onClick={() => setView("menu")}>← Back</button>

          <h2>⭐ My Saved Words</h2>

          {loadingWords && <p>Loading...</p>}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))",
              gap: 18
            }}
          >

            {savedWords.map((word) => {

              const data = wordDetails[word];

              return (

                <div
                  key={word}
                  style={{
                    border: "1px solid #eee",
                    padding: 20,
                    borderRadius: 14,
                    background: "#ffffff",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)"
                  }}
                >

                  <h3>{word}</h3>

                  <button
                    onClick={() => speakWord(word, data?.example)}
                  >
                    🔊 Pronounce
                  </button>

                  {data?.arabic && (
                    <p><strong>🇸🇦 Arabic:</strong> {data.arabic}</p>
                  )}

                  {data?.definition && (
                    <p><strong>Definition:</strong> {data.definition}</p>
                  )}

                  {data?.example && (
                    <p><strong>Example:</strong> {data.example}</p>
                  )}

                  <button onClick={() => removeWord(word)}>
                    ❌ Remove Word
                  </button>

                </div>

              );
            })}

          </div>

        </>

      )}

      {/* VOCAB UNITS */}

      {view === "units" && (

        <>
          <button onClick={() => setView("menu")}>← Back</button>

          {levels.map((level) => {

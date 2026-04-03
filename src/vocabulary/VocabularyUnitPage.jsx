import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";

/* ======================
   Utils
====================== */
function normalizeWord(word) {
  return word
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}

export default function VocabularyUnitPage() {
  const { level, unitId } = useParams();
  const navigate = useNavigate();

  const normalizedLevel =
    typeof level === "string" ? level.trim().toUpperCase() : null;

  const unitKey = `unit${unitId}`;

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const wordAudioRef = useRef(null);
  const [playingWord, setPlayingWord] = useState(null);

  /* ======================
     Load Unit Data
  ====================== */
  useEffect(() => {
    setLoading(true);

    const unitData =
      VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

    if (unitData && unitData.content) {
      setContent(unitData.content);
    } else {
      setContent(null);
    }

    setLoading(false);
  }, [normalizedLevel, unitKey]);

  /* ======================
     Audio (MP3)
  ====================== */
  const playWordAudio = (word) => {
    if (!word) return;

    const fileName = normalizeWord(word);

    const src = `/sounds/vocabulary/${normalizedLevel}/${unitKey}/${fileName}.mp3`;

    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current.currentTime = 0;
    }

    const audio = new Audio(src);
    wordAudioRef.current = audio;

    setPlayingWord(word.toLowerCase());

    audio.play().catch(() => {
      console.warn("❌ Missing audio:", src);
      setPlayingWord(null);
    });

    audio.onended = () => {
      setPlayingWord(null);
      wordAudioRef.current = null;
    };
  };

  /* ======================
     Navigation
  ====================== */
  const handleBack = () => {
    navigate(`/vocabulary/${level}`);
  };

  /* ======================
     States
  ====================== */
  if (loading) return <div className="vocab-loading">Loading...</div>;

  if (!content || !Array.isArray(content.items)) {
    return <div className="vocab-loading">Unit not found.</div>;
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="vocab-page vocab-unit-page">
      <div className="vocab-unit-header">
        <h1>{content.level} – Unit {content.unit}</h1>
        <h2>{content.title}</h2>
        <p className="vocab-unit-desc">{content.description}</p>
      </div>

      <div className="vocab-items-section">
        <div className="vocab-items">
          {content.items.map((item, i) => (
            <div key={i} className="vocab-item-card">
              <div className="vocab-item-header">
                <div>
                  <div className="vocab-item-word">{item.word}</div>
                  <div className="vocab-item-phonetic">
                    {item.phonetic}
                  </div>
                </div>

                <button
                  className={`vocab-audio-btn ${
                    playingWord === item.word.toLowerCase()
                      ? "playing"
                      : ""
                  }`}
                  onClick={() => playWordAudio(item.word)}
                >
                  🔊
                </button>
              </div>

              <div className="vocab-item-meaning">
                <strong>Meaning:</strong> {item.meaning}
              </div>

              {item.arabic && (
                <div className="vocab-item-meaning-ar">
                  <strong>Arabic:</strong> {item.arabic}
                </div>
              )}

              <div className="vocab-item-example">
                <strong>Example:</strong> {item.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button className="vocab-btn" onClick={handleBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
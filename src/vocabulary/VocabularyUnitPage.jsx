import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

/* ======================
   Utils
====================== */
function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

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
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const audioRef = useRef(null);

  /* ======================
     Load Data
  ====================== */
  useEffect(() => {
    const unitData =
      VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

    if (unitData && unitData.content && unitData.questions) {
      setContent(unitData.content);

      const prepared = unitData.questions.map((q) => ({
        ...q,
        shuffledOptions: shuffle(q.options),
      }));

      setQuestions(prepared);
    } else {
      setContent(null);
      setQuestions([]);
    }

    setCurrent(0);
    setSelected(null);
    setShowResult(false);
  }, [normalizedLevel, unitKey]);

  /* ======================
     Audio
  ====================== */
  const playAudio = (word) => {
    if (!word) return;

    const fileName = normalizeWord(word);
    const src = `/sounds/vocabulary/${normalizedLevel}/${unitKey}/${fileName}.mp3`;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(src);
    audioRef.current = audio;

    audio.play().catch(() => {
      console.warn("Missing audio:", src);
    });
  };

  /* ======================
     Question Logic
  ====================== */
  const question = questions[current];
  const isLast = current === questions.length - 1;

  const handleCheck = () => {
    if (selected === question.correctAnswer) playCorrect();
    else playWrong();

    setShowResult(true);
  };

  const handleNext = () => {
    if (isLast) {
      navigate(`/vocabulary/${level}`);
      return;
    }

    setCurrent((p) => p + 1);
    setSelected(null);
    setShowResult(false);
  };

  /* ======================
     UI
  ====================== */
  if (!content || !content.items?.length) {
    return <div style={{ padding: 40 }}>No words available</div>;
  }

  return (
    <div className="vocab-page vocab-unit-page">

      {/* 🔹 WORD LIST */}
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

              <button onClick={() => playAudio(item.word)}>
                🔊
              </button>
            </div>

            <div>{item.meaning}</div>
          </div>
        ))}
      </div>

      {/* 🔹 QUESTION (تحت الكلمات) */}
      {question && (
        <div style={{ marginTop: 30 }}>
          <div className="vocab-question-text">
            {question.question}
          </div>

          <div>
            {question.shuffledOptions.map((opt) => (
              <AnswerOption
                key={opt}
                label={opt}
                disabled={showResult}
                state={
                  showResult
                    ? opt === question.correctAnswer
                      ? "correct"
                      : opt === selected
                      ? "wrong"
                      : "default"
                    : selected === opt
                    ? "selected"
                    : "default"
                }
                onClick={() => setSelected(opt)}
              />
            ))}
          </div>

          {!showResult ? (
            <button disabled={!selected} onClick={handleCheck}>
              Check
            </button>
          ) : (
            <button onClick={handleNext}>
              {isLast ? "Next Unit" : "Next"}
            </button>
          )}
        </div>
      )}

    </div>
  );
}
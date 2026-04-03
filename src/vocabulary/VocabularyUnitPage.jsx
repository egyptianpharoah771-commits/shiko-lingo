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
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});

  const audioRef = useRef(null);

  /* ======================
     Load Data
  ====================== */
  useEffect(() => {
    const unitData =
      VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

    if (unitData && unitData.content && unitData.questions) {
      setContent(unitData.content);

      const prepared = unitData.questions.map((q, index) => ({
        ...q,
        id: index,
        shuffledOptions: shuffle(q.options),
      }));

      setQuestions(prepared);
    } else {
      setContent(null);
      setQuestions([]);
    }

    setAnswers({});
    setResults({});
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
     Handlers
  ====================== */
  const handleSelect = (qid, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  };

  const handleCheck = (qid, correct) => {
    const selected = answers[qid];

    const isCorrect = selected === correct;

    if (isCorrect) playCorrect();
    else playWrong();

    setResults((prev) => ({
      ...prev,
      [qid]: true,
    }));
  };

  /* ======================
     UI
  ====================== */
  if (!content || !content.items?.length) {
    return <div style={{ padding: 40 }}>No words available</div>;
  }

  return (
    <div className="vocab-page vocab-unit-page">

      {content.items.map((item, index) => {
        const q = questions[index];

        return (
          <div key={index} className="vocab-item-card">

            {/* WORD */}
            <div className="vocab-item-header">
              <div>
                <div className="vocab-item-word">{item.word}</div>
                <div className="vocab-item-phonetic">
                  {item.phonetic}
                </div>
              </div>

              <button
                className="vocab-audio-btn"
                onClick={() => playAudio(item.word)}
              >
                🔊
              </button>
            </div>

            <div className="vocab-item-meaning">
              {item.meaning}
            </div>

            {item.example && (
              <div className="vocab-item-example">
                {item.example}
              </div>
            )}

            {/* QUESTION */}
            {q && (
              <div style={{ marginTop: 20 }}>
                <div className="vocab-question-text">
                  {q.question}
                </div>

                <div>
                  {q.shuffledOptions.map((opt) => (
                    <AnswerOption
                      key={opt}
                      label={opt}
                      disabled={results[q.id]}
                      state={
                        results[q.id]
                          ? opt === q.correctAnswer
                            ? "correct"
                            : opt === answers[q.id]
                            ? "wrong"
                            : "default"
                          : answers[q.id] === opt
                          ? "selected"
                          : "default"
                      }
                      onClick={() => handleSelect(q.id, opt)}
                    />
                  ))}
                </div>

                {!results[q.id] && (
                  <button
                    disabled={!answers[q.id]}
                    onClick={() =>
                      handleCheck(q.id, q.correctAnswer)
                    }
                  >
                    Check
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button onClick={() => navigate(`/vocabulary/${level}`)}>
          ← Back
        </button>
      </div>

    </div>
  );
}
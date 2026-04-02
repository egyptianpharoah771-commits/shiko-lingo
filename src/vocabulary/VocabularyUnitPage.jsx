import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

function shuffle(array) {
  if (!Array.isArray(array)) return [];
  return [...array].sort(() => Math.random() - 0.5);
}

function normalizeWord(word) {
  return word?.toLowerCase().trim().replace(/\s+/g, "_");
}

export default function VocabularyUnitPage() {
  const { level, unitId } = useParams();
  const navigate = useNavigate();

  const normalizedLevel = level?.toUpperCase() || "";
  const unitKey = `unit${unitId}`;

  const [mode, setMode] = useState("learn"); // learn | quiz | listening
  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const audioRef = useRef(null);

  const playAudio = (item) => {
    try {
      if (!item?.word) return;

      const fileName = normalizeWord(item.word);

      const src =
        item.audio ||
        `/sounds/vocabulary/${normalizedLevel}/${unitKey}/${fileName}.mp3`;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(src);
      audioRef.current = audio;

      audio.play().catch(() => {
        console.warn("Audio failed:", src);
      });
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  useEffect(() => {
    const unitData =
      VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

    if (unitData) {
      setContent(unitData.content);

      const prepared = unitData.questions.map((q) => ({
        ...q,
        shuffledOptions: shuffle(q.options),
      }));

      setQuestions(prepared);
    }
  }, [normalizedLevel, unitKey]);

  // 🔊 auto play في listening
  useEffect(() => {
    if (mode !== "listening") return;

    const question = questions[currentQuestion];
    if (!question) return;

    const item = content?.items?.find(
      (w) => w.word === question.word
    );

    if (item) {
      setTimeout(() => playAudio(item), 300);
    }
  }, [currentQuestion, mode]);

  const question = questions[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;

  const currentItem = content?.items?.find(
    (item) => item.word === question?.word
  );

  if (!content || !question) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div className="vocab-page">

      {/* 🔥 MODE SWITCH */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("learn")}>Learn</button>
        <button onClick={() => setMode("quiz")}>Quiz</button>
        <button onClick={() => setMode("listening")}>🔊 Listening</button>
      </div>

      {/* ================= LEARN ================= */}
      {mode === "learn" && (
        <div className="vocab-items">
          {content.items?.map((item, i) => (
            <div key={i} className="vocab-item-card">
              <div className="vocab-item-header">
                <div>
                  <div className="vocab-item-word">{item.word}</div>
                  <div className="vocab-item-phonetic">
                    {item.phonetic || ""}
                  </div>
                </div>

                <button onClick={() => playAudio(item)}>🔊</button>
              </div>

              <div>{item.definition || item.meaning}</div>

              {item.example && <div>{item.example}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ================= QUIZ ================= */}
      {mode === "quiz" && (
        <div>
          <div>{question.question}</div>

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
            <button
              disabled={!selected}
              onClick={() => {
                if (selected === question.correctAnswer) {
                  playCorrect();
                } else {
                  playWrong();
                }
                setShowResult(true);
              }}
            >
              Check
            </button>
          ) : (
            <button
              onClick={() => {
                setSelected(null);
                setShowResult(false);
                setCurrentQuestion((p) => p + 1);
              }}
            >
              Next
            </button>
          )}
        </div>
      )}

      {/* ================= LISTENING ================= */}
      {mode === "listening" && (
        <div>
          <h3>🔊 Listen and choose the word</h3>

          <button onClick={() => playAudio(currentItem)}>
            🔊 Replay
          </button>

          <div style={{ marginTop: 20 }}>
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
            <button
              disabled={!selected}
              onClick={() => {
                if (selected === question.correctAnswer) {
                  playCorrect();
                } else {
                  playWrong();
                }
                setShowResult(true);
              }}
            >
              Check
            </button>
          ) : (
            <button
              onClick={() => {
                if (isLast) {
                  navigate(`/vocabulary/${level}`);
                  return;
                }

                setSelected(null);
                setShowResult(false);
                setCurrentQuestion((p) => p + 1);
              }}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}
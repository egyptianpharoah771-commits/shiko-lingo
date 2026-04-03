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

  const [mode, setMode] = useState("learn");
  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const audioRef = useRef(null);

  // 🔥 FIX: تشغيل مباشر من الكلمة بدون أي matching
  const playAudioFromWord = (word) => {
    try {
      if (!word) return;

      const fileName = normalizeWord(word);

      const src = `/sounds/vocabulary/${normalizedLevel}/${unitKey}/${fileName}.mp3`;

      console.log("🔊 TRY:", src);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(src);
      audioRef.current = audio;

      audio.play().catch(() => {
        console.warn("❌ NOT FOUND:", src);
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

    setCurrentQuestion(0);
    setSelected(null);
    setShowResult(false);

  }, [normalizedLevel, unitKey]);

  const question = questions[currentQuestion];
  const isLast = currentQuestion >= questions.length - 1;

  // 🔊 Listening autoplay
  useEffect(() => {
    if (mode !== "listening") return;
    if (!question?.correctAnswer) return;

    setTimeout(() => {
      playAudioFromWord(question.correctAnswer);
    }, 300);

  }, [mode, currentQuestion, question]);

  if (!content || !questions.length) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <div className="vocab-page">

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode("learn")}>Learn</button>
        <button onClick={() => setMode("quiz")}>Quiz</button>
        <button onClick={() => setMode("listening")}>🔊 Listening</button>
      </div>

      {/* LEARN */}
      {mode === "learn" && (
        <div className="vocab-items">
          {content.items.map((item, i) => (
            <div key={i} className="vocab-item-card">
              <div>
                <div>{item.word}</div>
                <div>{item.phonetic || ""}</div>
              </div>

              <button onClick={() => playAudioFromWord(item.word)}>
                🔊
              </button>

              <div>{item.definition || item.meaning}</div>

              {item.example && <div>{item.example}</div>}
            </div>
          ))}
        </div>
      )}

      {/* QUIZ */}
      {mode === "quiz" && (
        <div>
          <div>{question?.question}</div>

          <div>
            {question?.shuffledOptions.map((opt) => (
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
                selected === question.correctAnswer
                  ? playCorrect()
                  : playWrong();
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

      {/* LISTENING */}
      {mode === "listening" && (
        <div>
          <h3>🔊 Listen and choose</h3>

          <button onClick={() => playAudioFromWord(question.correctAnswer)}>
            🔊 Replay
          </button>

          <div style={{ marginTop: 20 }}>
            {question?.shuffledOptions.map((opt) => (
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
                selected === question.correctAnswer
                  ? playCorrect()
                  : playWrong();
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
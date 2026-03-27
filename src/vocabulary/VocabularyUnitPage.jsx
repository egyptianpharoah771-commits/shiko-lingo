import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";

function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function VocabularyUnitPage() {
  const { level, unitId } = useParams();

  const normalizedLevel =
    typeof level === "string" ? level.trim().toUpperCase() : null;

  const unitKey = `unit${unitId}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const audioRef = useRef(null);

  // 🔊 FIX نهائي للصوت (TTS + fallback mp3)
  const speakWord = (text) => {
    if (!text) return;

    try {
      const synth = window.speechSynthesis;

      // وقف أي صوت شغال
      if (synth.speaking) {
        synth.cancel();
      }

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.9;

      let fallbackUsed = false;

      // لو TTS فشل → fallback mp3
      utter.onerror = () => {
        if (fallbackUsed) return;
        fallbackUsed = true;

        try {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          audioRef.current = new Audio(
            `/api/tts?text=${encodeURIComponent(text)}`
          );
          audioRef.current.play().catch(() => {});
        } catch {}
      };

      // delay مهم لـ Pi Browser
      setTimeout(() => {
        synth.speak(utter);
      }, 80);
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  useEffect(() => {
    const unitData =
      VOCABULARY_DATA?.[normalizedLevel]?.[unitKey];

    if (unitData) {
      setContent(unitData.content);

      const safeQuestions = unitData.questions.map((q) => ({
        ...q,
        shuffledOptions: shuffle(q.options),
      }));

      setQuestions(safeQuestions);
    }
  }, [normalizedLevel, unitKey]);

  const question = questions[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;

  if (!content || !question) return <div>Loading...</div>;

  return (
    <div className="vocab-page">

      {/* 🔥 WORD LIST */}
      <div className="vocab-items">
        {content.items.map((item, i) => (
          <div key={i} className="vocab-item-card">
            <div className="vocab-item-header">
              <div>
                <div className="vocab-item-word">{item.word}</div>
                <div className="vocab-item-phonetic">
                  {item.pronunciation || item.phonetic || ""}
                </div>
              </div>

              <button
                className="vocab-audio-btn"
                onClick={() => speakWord(item.word)}
              >
                🔊
              </button>
            </div>

            <div className="vocab-item-meaning">
              {item.definition}
            </div>

            {item.example && (
              <div className="vocab-item-example">
                {item.example}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔥 QUIZ */}
      <div className="vocab-question-box">

        <div className="vocab-question-text">
          {question.question}
        </div>

        <button
          className="vocab-audio-btn"
          onClick={() =>
            speakWord(question.word || question.question)
          }
        >
          🔊
        </button>

        <div className="vocab-options">
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

        {/* 🔥 CHECK / NEXT */}
        {!showResult ? (
          <button
            className="vocab-btn primary"
            disabled={!selected}
            onClick={() => setShowResult(true)}
          >
            Check
          </button>
        ) : (
          <button
            className="vocab-btn primary"
            onClick={() => {
              if (isLast) {
                // 🔥 FIX: مايدخلش Loading
                window.location.href = `/vocabulary/${level}`;
                return;
              }

              setSelected(null);
              setShowResult(false);
              setCurrentQuestion((p) => p + 1);
            }}
          >
            {isLast ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
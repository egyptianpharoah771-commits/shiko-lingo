import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";

function shuffle(array) {
  if (!Array.isArray(array)) return [];
  return [...array].sort(() => Math.random() - 0.5);
}

export default function VocabularyUnitPage() {
  const { level, unitId } = useParams();
  const navigate = useNavigate();

  const normalizedLevel = level?.toUpperCase() || "";
  const unitKey = `unit${unitId}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const audioRef = useRef(null);

  // 🔊 FIX نهائي (TTS + fallback)
  const speakWord = useCallback((text) => {
    if (!text) return;

    try {
      const synth = window.speechSynthesis;

      synth.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.85;

      let started = false;

      utter.onstart = () => {
        started = true;
      };

      utter.onerror = () => {
        if (started) return;

        try {
          if (audioRef.current) {
            audioRef.current.pause();
          }

          audioRef.current = new Audio(
            `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
              text
            )}&tl=en&client=tw-ob`
          );

          audioRef.current.play().catch(() => {});
        } catch (e) {
          console.error("Fallback audio failed", e);
        }
      };

      setTimeout(() => {
        synth.speak(utter);
      }, 100);

    } catch (e) {
      console.error("TTS error", e);
    }
  }, []);

  // 🔥 preload voices (من التحليل)
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

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
      console.error("❌ Unit data not found", normalizedLevel, unitKey);
    }
  }, [normalizedLevel, unitKey]);

  const question = questions[currentQuestion];
  const isLast = currentQuestion === questions.length - 1;

  if (!content || !question) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3>Loading lesson...</h3>
      </div>
    );
  }

  return (
    <div className="vocab-page">

      {/* WORD LIST */}
      <div className="vocab-items">
        {content.items?.map((item, i) => (
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

      <hr style={{ margin: "30px 0" }} />

      {/* QUIZ */}
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
          🔊 Listen
        </button>

        <div className="vocab-options">
          {question.shuffledOptions?.map((opt) => (
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
                navigate(`/vocabulary/${level}`);
                return;
              }

              setSelected(null);
              setShowResult(false);
              setCurrentQuestion((prev) => prev + 1);
            }}
          >
            {isLast ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
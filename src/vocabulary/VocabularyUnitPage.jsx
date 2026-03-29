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

  const playAudio = (src) => {
    try {
      if (!src) return;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(src);
      audioRef.current = audio;

      audio.play().catch(() => {});
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  useEffect(() => {
    try {
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
        setContent({ items: [] });
        setQuestions([]);
      }
    } catch (err) {
      console.error("Vocabulary load error:", err);
      setContent({ items: [] });
      setQuestions([]);
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

      <div className="vocab-items">
        {content.items?.map((item, i) => (
          <div key={i} className="vocab-item-card">
            <div className="vocab-item-header">
              <div>
                <div className="vocab-item-word">{item.word || ""}</div>
                <div className="vocab-item-phonetic">
                  {item.pronunciation || item.phonetic || ""}
                </div>
              </div>

              {question?.audio && (
  <button
    className="vocab-audio-btn"
    onClick={() => playAudio(question.audio)}
  >
    🔊 Listen
  </button>
)}
            </div>

            <div className="vocab-item-meaning">
              {item.definition || item.meaning || ""}
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

      <div className="vocab-question-box">

        <div className="vocab-question-text">
          {question?.question || ""}
        </div>

        <button
          className="vocab-audio-btn"
          onClick={() => playAudio(question?.audio)}
        >
          🔊 Listen
        </button>

        <div className="vocab-options">
          {question?.shuffledOptions?.map((opt) => (
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
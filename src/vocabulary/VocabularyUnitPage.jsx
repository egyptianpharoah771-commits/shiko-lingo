import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import AnswerOption from "../core/ui/AnswerOption";
import "../core/ui/answer-option.css";
import "./vocabulary.css";
import { VOCABULARY_DATA } from "./vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

// 🔥 ADD THIS
import { updateWordStats } from "../coach/coachEngine";
import { askAITutor } from "../utils/aiClient";
import AIResponseModal from "../components/AIResponseModal";
import { useFeatureAccess } from "../hooks/useFeatureAccess";

/* ===== Utils ===== */
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

function normalizeLevel(level) {
  return String(level || "").toUpperCase().trim();
}

function buildKey(level, unitNumber) {
  return `vocab_${normalizeLevel(level)}_unit${unitNumber}_done`;
}

export default function VocabularyUnitPage() {
  const { level, unitId } = useParams();
  const navigate = useNavigate();

  const normalizedLevel =
    typeof level === "string" ? level.trim().toUpperCase() : null;

  const unitNumber = Number(unitId);
  const unitKey = `unit${unitNumber}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [weakPoints, setWeakPoints] = useState([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState("IDLE");
  const [aiMessage, setAiMessage] = useState("");

  const audioRef = useRef(null);
  const { canGetAIFeedback, userId, packageName } =
    useFeatureAccess({
      skill: "Vocabulary",
      level: normalizedLevel,
    });

  /* ===== Load Data ===== */
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
    setCorrectCount(0);
    setWeakPoints([]);
    setAiStatus("IDLE");
    setAiMessage("");
  }, [normalizedLevel, unitKey]);

  /* ===== Audio ===== */
  const playAudio = (word) => {
    if (!word || !normalizedLevel || !unitKey) return;

    const fileName = normalizeWord(word);
    const src = `/sounds/vocabulary/${normalizedLevel}/${unitKey}/${fileName}.mp3`;

    try {
      const audio = new Audio(src);
      audio.onerror = () => {
        console.warn("Audio not found:", src);
      };
      audio.play().catch(() => {});
    } catch {
      console.warn("Audio play failed:", src);
    }
  };

  /* ===== Logic ===== */
  const question = questions[current];
  const isLast = current === questions.length - 1;

  // 🔥 FIX هنا فقط
  const handleCheck = () => {
    const isCorrect = selected === question.correctAnswer;

    if (isCorrect) playCorrect();
    else playWrong();

    // 🔥 أهم سطر: ربط الفوكابلري بالكوتش
    updateWordStats(
  normalizeWord(selected),
  isCorrect
);

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWeakPoints((prev) => {
        const q = question.question || "Vocabulary meaning mismatch";
        return prev.includes(q) ? prev : [...prev, q];
      });
    }

    setShowResult(true);
  };

  const handleAIFeedback = async () => {
    setAiOpen(true);

    if (!canGetAIFeedback) {
      setAiStatus("LIMIT");
      setAiMessage("AI feedback is available after completing lessons.");
      return;
    }

    setAiStatus("LOADING");
    setAiMessage("");

    const result = await askAITutor({
      skill: "Vocabulary",
      level: normalizedLevel,
      lessonTitle: content?.title || `Unit ${unitNumber}`,
      studentText: `Vocabulary quiz progress in unit ${unitNumber}.`,
      score: correctCount,
      total: questions.length,
      weakPoints,
      userId,
      packageName,
    });

    setAiStatus(result.status);
    setAiMessage(result.message || "");
  };

  const handleNext = () => {
    if (isLast) {
      const key = buildKey(normalizedLevel, unitNumber);

      localStorage.setItem(key, "true");

      console.log("✅ SAVED:", key);

      setTimeout(() => {
        navigate(`/vocabulary/${normalizeLevel(level)}`);
      }, 50);

      return;
    }

    setCurrent((p) => p + 1);
    setSelected(null);
    setShowResult(false);
  };

  /* ===== UI ===== */
  if (!content || !content.items?.length) {
    return <div style={{ padding: 40 }}>No words available</div>;
  }

  return (
    <div className="vocab-page vocab-unit-page">
      {/* Words */}
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
                className="vocab-audio-btn"
                onClick={() => playAudio(item.word)}
              >
                🔊
              </button>
            </div>

            <div className="vocab-item-meaning">
              {item.meaning}
            </div>
          </div>
        ))}
      </div>

      {/* Question */}
      {question && (
        <div style={{ marginTop: 30 }}>
          <div className="vocab-question-text">
            {question.question}
          </div>

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

          {!showResult ? (
            <button
              className="vocab-btn primary"
              disabled={!selected}
              onClick={handleCheck}
            >
              Check
            </button>
          ) : (
            <button
              className="vocab-btn success"
              onClick={handleNext}
            >
              {isLast ? "Next Unit" : "Next"}
            </button>
          )}

          {showResult && isLast && (
            <button
              className="vocab-btn primary"
              onClick={handleAIFeedback}
              style={{ marginLeft: 8 }}
            >
              🤖 AI Unit Feedback
            </button>
          )}
        </div>
      )}

      <AIResponseModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        status={aiStatus}
        message={aiMessage}
      />
    </div>
  );
}
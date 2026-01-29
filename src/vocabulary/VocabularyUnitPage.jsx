import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* ======================
   Utils
====================== */
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function VocabularyUnitPage() {
  const { level, unitId } = useParams();
  const navigate = useNavigate();

  const normalizedLevel = level?.toUpperCase();
  const unitNumber = Number(unitId);

  const STORAGE_KEY = `vocabularyProgress_${normalizedLevel}`;

  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnit = async () => {
      setLoading(true);
      setCurrentQuestion(0);
      setSelected(null);
      setShowResult(false);

      try {
        const contentModule = await import(
          `./${normalizedLevel}/unit${unitNumber}/content.js`
        );
        const questionsModule = await import(
          `./${normalizedLevel}/unit${unitNumber}/questions.js`
        );

        const preparedQuestions = questionsModule.default.map((q) => ({
          ...q,
          shuffledOptions: shuffle(q.options),
        }));

        setContent(contentModule.default);
        setQuestions(preparedQuestions);
      } catch (err) {
        console.error("Vocabulary unit not found:", err);
        setContent(null);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (normalizedLevel && unitNumber) {
      loadUnit();
    }
  }, [normalizedLevel, unitNumber]);

  if (loading) return <p>Loading...</p>;
  if (!content) return <p>Vocabulary unit not found.</p>;

  const question = questions[currentQuestion];
  if (!question) return <p>Loading question...</p>;

  const isCorrect = selected === question.correctAnswer;
  const isLastQuestion = currentQuestion === questions.length - 1;

  const saveProgress = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { completedUnits: [] };

    if (!data.completedUnits.includes(unitNumber)) {
      data.completedUnits.push(unitNumber);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h1>
        {content.level} – Unit {content.unit}: {content.title}
      </h1>

      <p>{content.description}</p>

      {content.explanation && (
        <>
          <hr />
          <h2>Explanation</h2>
          <ul>
            {content.explanation.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </>
      )}

      <hr />

      <h2>
        Question {currentQuestion + 1} / {questions.length}
      </h2>

      <p>{question.question}</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {question.shuffledOptions.map((opt) => (
          <li key={opt} style={{ marginBottom: 8 }}>
            <button
              disabled={showResult}
              onClick={() => setSelected(opt)}
              style={{
                width: "100%",
                padding: 12,
                border: "2px solid #ccc",
                cursor: "pointer",
                background:
                  showResult && opt === question.correctAnswer
                    ? "#c8f7c5"
                    : showResult && opt === selected
                    ? "#f7c5c5"
                    : selected === opt
                    ? "#e0eaff"
                    : "#f7f7f7",
              }}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>

      {showResult && (
        <p style={{ fontWeight: "bold" }}>
          {isCorrect ? "Correct ✅" : "Wrong ❌"}
        </p>
      )}

      {!showResult ? (
        <button disabled={!selected} onClick={() => setShowResult(true)}>
          Check Answer
        </button>
      ) : !isLastQuestion ? (
        <button
          onClick={() => {
            setSelected(null);
            setShowResult(false);
            setCurrentQuestion((q) => q + 1);
          }}
        >
          Next Question
        </button>
      ) : (
        <button
          onClick={() => {
            saveProgress();
            navigate(`/vocabulary/${normalizedLevel}`);
          }}
        >
          Finish 🎉
        </button>
      )}
    </div>
  );
}

export default VocabularyUnitPage;
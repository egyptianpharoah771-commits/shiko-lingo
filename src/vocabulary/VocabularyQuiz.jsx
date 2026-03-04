import { useEffect, useState } from "react";

function VocabularyQuiz() {
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const normalize = (v) =>
    (v || "").toString().trim().toLowerCase();

  const speakWord = (word) => {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("VOCAB_SAVED") || "[]"
    );

    if (!saved.length) {
      setLoading(false);
      return;
    }

    const loadQuiz = async () => {
      const questions = [];

      for (const word of saved) {
        try {
          const dictRes = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
          );

          if (!dictRes.ok) continue;

          const data = await dictRes.json();

          const definition =
            data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;

          if (!definition) continue;

          questions.push({
            word,
            definition,
          });
        } catch {}
      }

      setQuiz(questions);
      setLoading(false);
    };

    loadQuiz();
  }, []);

  const handleSelect = (index, value) => {
    if (submitted) return;

    setAnswers({
      ...answers,
      [index]: value,
    });
  };

  const handleSubmit = () => {
    if (submitted) return;

    let correct = 0;

    quiz.forEach((q, i) => {
      if (normalize(answers[i]) === normalize(q.word)) {
        correct++;
      }
    });

    setScore(correct);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Loading vocabulary quiz...</h2>
      </div>
    );
  }

  if (!quiz.length) {
    return (
      <div style={{ padding: 30 }}>
        <h2>No saved words to review.</h2>
        <p>Save words from Reading first.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <h1>🧠 Vocabulary Review Quiz</h1>

      {quiz.map((q, i) => {
        const isCorrect =
          normalize(answers[i]) === normalize(q.word);

        return (
          <div
            key={i}
            style={{
              border: "1px solid #eee",
              padding: 18,
              borderRadius: 12,
              marginBottom: 16,
              background: "#fafafa",
            }}
          >
            <p>
              <strong>
                What word matches this definition?
              </strong>
            </p>

            <p style={{ fontStyle: "italic" }}>
              {q.definition}
            </p>

            <input
              type="text"
              placeholder="Type the word..."
              disabled={submitted}
              value={answers[i] || ""}
              onChange={(e) =>
                handleSelect(i, e.target.value)
              }
              style={{
                padding: 10,
                width: "100%",
                marginTop: 10,
                fontSize: 16,
              }}
            />

            {submitted && (
              <div style={{ marginTop: 10 }}>
                {isCorrect ? (
                  <span style={{ color: "green" }}>
                    ✅ Correct
                  </span>
                ) : (
                  <span style={{ color: "red" }}>
                    ❌ Correct answer: {q.word}
                  </span>
                )}

                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => speakWord(q.word)}
                  >
                    🔊 Pronounce
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={handleSubmit}
        disabled={submitted}
        style={{
          padding: "12px 18px",
          fontSize: 16,
        }}
      >
        Submit Quiz
      </button>

      {submitted && (
        <div style={{ marginTop: 20 }}>
          <h2>
            Score: {score} / {quiz.length}
          </h2>
        </div>
      )}
    </div>
  );
}

export default VocabularyQuiz;
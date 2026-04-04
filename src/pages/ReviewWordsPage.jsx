import { useEffect, useState, useMemo } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

const TOTAL = 60;

function normalize(word) {
  return word?.toLowerCase().trim();
}

function buildId(level, unitId, word) {
  return `${level}_${unitId}_${normalize(word)}`;
}

function deterministicShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(i / 2);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function ReviewWordsPage() {
  const [pool, setPool] = useState([]);
  const [session, setSession] = useState(null); // 🔥 مهم: null مش []
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  // ✅ Build pool + session مع بعض (atomic)
  useEffect(() => {
    try {
      let words = [];

      Object.entries(VOCABULARY_DATA).forEach(([level, units]) => {
        Object.entries(units).forEach(([unitId, unit]) => {
          (unit.content?.items || []).forEach((w) => {
            if (w.word && (w.definition || w.definition_hard)) {
              words.push({
                id: buildId(level, unitId, w.word),
                word: normalize(w.word),
                definition:
                  w.definition_hard ||
                  w.definition_medium ||
                  w.definition ||
                  "",
                level,
                unit: unitId,
              });
            }
          });
        });
      });

      const shuffled = deterministicShuffle(words);
      const initialSession = shuffled.slice(0, TOTAL);

      setPool(words);
      setSession(initialSession); // 🔥 guaranteed ready together
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ❌ مفيش useMemo هنا — مشتقة مباشرة
  const currentWord = session ? session[index] : null;

  const options = useMemo(() => {
    if (!currentWord || pool.length < 4) return [];

    const distractors = pool
      .filter((w) => w.id !== currentWord.id)
      .slice(0, 3);

    return [...distractors, currentWord];
  }, [currentWord, pool]);

  const handleCheck = () => {
    if (!selected || showResult || !currentWord) return;

    const isCorrect = selected.id === currentWord.id;
    setShowResult(true);

    if (isCorrect) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playWrong();
      setSession((prev) => [...prev, currentWord]);
    }
  };

  const handleNext = () => {
    setIndex((prev) => prev + 1);
    setSelected(null);
    setShowResult(false);
  };

  // ✅ completion الوحيد
  useEffect(() => {
    if (index >= TOTAL) {
      setFinished(true);
    }
  }, [index]);

  // 🔥 Guards صحيحة
  if (loading || !session) {
    return <div style={{ textAlign: "center", padding: 50 }}>Preparing...</div>;
  }

  if (finished) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <h2>Review Complete 🎉</h2>
        <p>{score} / {TOTAL}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!currentWord) {
    return <div style={{ textAlign: "center", padding: 50 }}>Preparing...</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto", textAlign: "center" }}>
      <div style={{ marginBottom: 20 }}>
        {Math.min(index + 1, TOTAL)} / {TOTAL} | Score: {score}
      </div>

      <div
        style={{
          background: "#f9f9f9",
          padding: 30,
          borderRadius: 15,
          marginBottom: 20,
          border: "1px solid #ddd",
        }}
      >
        <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          {currentWord.definition}
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            disabled={showResult}
            onClick={() => setSelected(opt)}
            style={{
              padding: 15,
              borderRadius: 10,
              cursor: "pointer",
              border: "2px solid",
              borderColor: selected?.id === opt.id ? "#007bff" : "#eee",
              backgroundColor: showResult
                ? opt.id === currentWord.id
                  ? "#d4edda"
                  : selected?.id === opt.id
                  ? "#f8d7da"
                  : "white"
                : selected?.id === opt.id
                ? "#e7f1ff"
                : "white",
            }}
          >
            {opt.word}
          </button>
        ))}
      </div>

      <button
        onClick={showResult ? handleNext : handleCheck}
        disabled={!selected}
        style={{
          marginTop: 30,
          width: "100%",
          padding: 15,
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 10,
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
      >
        {showResult ? "Next" : "Check"}
      </button>
    </div>
  );
}
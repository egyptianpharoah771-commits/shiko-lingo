import { useEffect, useState, useMemo } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

const TOTAL_TO_WIN = 60; // الهدف هو الإجابة على 60 كلمة صح

export default function ReviewWordsPage() {
  const [allWords, setAllWords] = useState([]);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  // --- تجميع الداتا مرة واحدة عند البداية ---
  useEffect(() => {
    try {
      let pool = [];
      Object.entries(VOCABULARY_DATA).forEach(([level, units]) => {
        Object.entries(units).forEach(([unitId, unit]) => {
          (unit.content?.items || []).forEach((w, i) => {
            if (w.word && (w.definition || w.definition_hard)) {
              pool.push({
                // ID فريد جداً عشان ما يحصلش تكرار
                id: `${level}_${unitId}_${i}_${w.word.toLowerCase().trim()}`,
                word: w.word,
                definition: w.definition_hard || w.definition_medium || w.definition || "",
                level
              });
            }
          });
        });
      });

      // خلط الكل واختيار أول 60 عشوائياً من كل المستويات
      const shuffledFull = [...pool].sort(() => Math.random() - 0.5);
      const uniquePool = Array.from(new Map(shuffledFull.map(item => [item.word.toLowerCase().trim(), item])).values());
      
      setAllWords(uniquePool);
      setSessionQueue(uniquePool.slice(0, TOTAL_TO_WIN));
    } catch (err) {
      console.error("Error loading vocabulary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // الكلمة الحالية مشتقة دائماً من الـ Index والـ Queue
  const currentWord = sessionQueue[currentIndex];

  // توليد الخيارات (تتحدث تلقائياً مع تغير الكلمة)
  const options = useMemo(() => {
    if (!currentWord || allWords.length < 4) return [];
    const wrongOnes = allWords
      .filter(w => w.word.toLowerCase() !== currentWord.word.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...wrongOnes, currentWord].sort(() => Math.random() - 0.5);
  }, [currentWord, allWords]);

  const handleCheck = () => {
    if (!selected || showResult) return;

    const isCorrect = selected.word === currentWord.word;
    setShowResult(true);

    if (isCorrect) {
      setScore(s => s + 1);
      playCorrect();
    } else {
      playWrong();
      // لو غلط: ضيف الكلمة في آخر الطابور عشان تظهر له تاني
      setSessionQueue(prev => [...prev, currentWord]);
    }
  };

  const handleNext = () => {
    // لو جاوبنا صح على 60 كلمة مختلفة أو وصلنا لآخر الطابور
    if (score >= TOTAL_TO_WIN || currentIndex + 1 >= sessionQueue.length) {
      setFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (loading) return <div style={centerStyle}>Loading vocabulary...</div>;
  if (finished) return (
    <div style={centerStyle}>
      <h2>Review Complete! 🎉</h2>
      <p style={{fontSize: '1.5rem'}}>Final Score: {score} / {TOTAL_TO_WIN}</p>
      <button onClick={() => window.location.reload()} style={btnStyle}>Restart</button>
    </div>
  );

  if (!currentWord) return null;

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <span>Question: {currentIndex + 1}</span> | <span>Correct: {score}</span>
      </div>

      <div style={cardStyle}>
        <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>{currentWord.definition}</p>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            disabled={showResult}
            onClick={() => setSelected(opt)}
            style={{
              padding: "15px",
              borderRadius: "10px",
              cursor: "pointer",
              border: "2px solid",
              borderColor: selected?.id === opt.id ? "#007bff" : "#eee",
              backgroundColor: showResult 
                ? (opt.word === currentWord.word ? "#d4edda" : (selected?.id === opt.id ? "#f8d7da" : "white"))
                : (selected?.id === opt.id ? "#e7f1ff" : "white")
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
          marginTop: "20px", width: "100%", padding: "15px", 
          backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "10px"
        }}
      >
        {showResult ? "Next" : "Check Answer"}
      </button>
    </div>
  );
}

const centerStyle = { padding: "50px", textAlign: "center" };
const cardStyle = { padding: "20px", background: "#f8f9fa", borderRadius: "15px", marginBottom: "20px", textAlign: "center" };
const btnStyle = { padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" };
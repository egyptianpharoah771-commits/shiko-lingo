import { useEffect, useState, useMemo } from "react";
import { VOCABULARY_DATA } from "../vocabulary/vocabularyIndex";
import { playCorrect, playWrong } from "../utils/sfx";

const TARGET_SCORE = 60; 

export default function ReviewWordsPage() {
  const [allWords, setAllWords] = useState([]);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    try {
      let pool = [];
      // تجميع كل الكلمات من كل المستويات بدون استثناء
      Object.entries(VOCABULARY_DATA).forEach(([level, units]) => {
        Object.entries(units).forEach(([unitId, unit]) => {
          (unit.content?.items || []).forEach((w, i) => {
            if (w.word && (w.definition || w.definition_hard)) {
              pool.push({
                // صنع ID فريد يمنع تداخل الكلمات
                id: `review_${level}_${unitId}_${i}_${Math.random()}`, 
                word: w.word,
                definition: w.definition_hard || w.definition_medium || w.definition || "",
                level
              });
            }
          });
        });
      });

      // خلط عشوائي واختيار كلمات فريدة
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      // تأكد إننا بناخد كلمات كتير عشان لو المستخدم غلط نلاقي "مخزون"
      setAllWords(shuffled); 
      setSessionQueue(shuffled.slice(0, TARGET_SCORE));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentWord = sessionQueue[currentIndex];

  const options = useMemo(() => {
    if (!currentWord || allWords.length < 4) return [];
    // نجيب خيارات غلط من الـ pool الكبير
    const distractors = allWords
      .filter(w => w.word.toLowerCase() !== currentWord.word.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...distractors, currentWord].sort(() => Math.random() - 0.5);
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
      // أهم حتة: الكلمة اللي غلطت فيها بتنزل في آخر الطابور عشان تظهر تاني
      setSessionQueue(prev => [...prev, { ...currentWord, id: currentWord.id + "_retry" }]);
    }
  };

  const handleNext = () => {
    // التعديل السحري: الاختبار يخلص بس لو جاوبنا 60 صح أو الطابور خلص فعلياً
    if (currentIndex + 1 >= sessionQueue.length) {
      setFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:50}}>جاري تجهيز الـ 60 سؤال...</div>;
  
  if (finished || (score >= TARGET_SCORE && showResult === false)) {
    return (
      <div style={{textAlign:'center', padding:50}}>
        <h2>Review Complete! 🎉</h2>
        <p>لقد أتممت المراجعة بنتيجة: {score} من {TARGET_SCORE}</p>
        <button onClick={() => window.location.reload()}>إعادة المحاولة</button>
      </div>
    );
  }

  if (!currentWord) return null;

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "auto", textAlign: "center" }}>
      <div style={{marginBottom: 20, fontSize: '1.1rem'}}>
         السؤال الحالي: <strong>{currentIndex + 1}</strong> | النتيجة: <strong>{score}</strong>
      </div>

      <div style={{ background: "#f9f9f9", padding: 30, borderRadius: 15, marginBottom: 20, border: '1px solid #ddd' }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{currentWord.definition}</p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            disabled={showResult}
            onClick={() => setSelected(opt)}
            style={{
              padding: 15, borderRadius: 10, cursor: "pointer", border: "2px solid",
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
          marginTop: 30, width: "100%", padding: 15, background: "#007bff", color: "white", 
          border: "none", borderRadius: 10, fontSize: '1.1rem', cursor: 'pointer'
        }}
      >
        {showResult ? "السؤال التالي" : "تحقق من الإجابة"}
      </button>
    </div>
  );
}
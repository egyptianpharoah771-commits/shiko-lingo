import { useMemo, useRef, useState } from "react";

export default function AssessmentQuestion({
  question,
  onAnswer,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [status, setStatus] = useState(null); // correct | wrong

  /* 🔊 Sounds (correct / wrong فقط) */
  const correctSound = useRef(
    new Audio("/sounds/correct.mp3")
  );
  const wrongSound = useRef(
    new Audio("/sounds/wrong.mp3")
  );

  /* 🔀 Shuffle answers once per question */
  const shuffledOptions = useMemo(() => {
    const mapped = question.options.map((text, index) => ({
      text,
      isCorrect: index === question.correctAnswer,
    }));
    return mapped.sort(() => Math.random() - 0.5);
  }, [question]);

  function handleClick(option, index) {
    if (selectedIndex !== null) return;

    setSelectedIndex(index);

    const correct = option.isCorrect;
    setStatus(correct ? "correct" : "wrong");

    // 🔊 تشغيل صوت واحد فقط
    if (correct) {
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(() => {});
    } else {
      wrongSound.current.currentTime = 0;
      wrongSound.current.play().catch(() => {});
    }

    setTimeout(() => {
      onAnswer(correct);
      setSelectedIndex(null);
      setStatus(null);
    }, 800);
  }

  return (
    <div>
      <h2>Level Assessment</h2>

      <p style={{ margin: "16px 0", fontWeight: "bold" }}>
        {question.question}
      </p>

      <div>
        {shuffledOptions.map((opt, idx) => {
          let bg = "#faf7fc";
          let border = "1px solid #ccc";
          let color = "#000";

          if (selectedIndex === idx) {
            if (status === "correct") {
              bg = "#1e7e34"; // أخضر واضح
              border = "1px solid #1e7e34";
              color = "#fff";
            }
            if (status === "wrong") {
              bg = "#c82333"; // أحمر واضح
              border = "1px solid #c82333";
              color = "#fff";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleClick(opt, idx)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                marginBottom: 10,
                padding: "12px 14px",
                borderRadius: 10,
                border,
                background: bg,
                color,
                fontWeight:
                  selectedIndex === idx
                    ? "bold"
                    : "normal",
                cursor:
                  selectedIndex === null
                    ? "pointer"
                    : "default",
                outline: "none",
                boxShadow: "none",
                transition:
                  "background 0.15s ease, transform 0.1s",
              }}
              onMouseDown={(e) =>
                e.preventDefault()
              } // يمنع الأزرق الافتراضي
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

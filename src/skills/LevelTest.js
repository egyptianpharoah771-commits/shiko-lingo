import React, { useState } from "react";
import "./LevelTest.css";

export default function LevelTest() {
  // ============================
  //   QUESTIONS BANK
  // ============================
  const questions = [
    // ------------------ A1 VERY EASY ------------------
    { q: "I ___ a student.", options: ["am", "is", "are"], answer: "am" },
    { q: "She ___ from Egypt.", options: ["is", "are", "be"], answer: "is" },
    {
      q: 'Choose the correct: "I like ___ pizza."',
      options: ["eat", "eating", "to eats"],
      answer: "eating",
    },
    { q: "They ___ TV now.", options: ["watches", "are watching", "watch"], answer: "are watching" },
    { q: "Opposite of 'big':", options: ["large", "tiny", "tall"], answer: "tiny" },

    // ------------------ A2 EASY ------------------
    { q: "I’ve lived here ___ 2010.", options: ["since", "for", "from"], answer: "since" },
    { q: "How ___ sugar do you want?", options: ["much", "many", "a few"], answer: "much" },
    { q: "He didn’t ___ the movie.", options: ["liked", "like", "liking"], answer: "like" },
    { q: "If it ___ tomorrow, I won’t go out.", options: ["rain", "rains", "raining"], answer: "rains" },
    {
      q: "Meaning of 'borrow':",
      options: ["take temporarily", "give permanently", "buy something"],
      answer: "take temporarily",
    },

    // ------------------ B1 MEDIUM ------------------
    { q: "I wish I ___ more time.", options: ["have", "had", "would have"], answer: "had" },
    {
      q: "The film was ___ interesting than I expected.",
      options: ["much", "more", "most"],
      answer: "more",
    },
    { q: "She asked me ___ I had finished.", options: ["did", "if", "that"], answer: "if" },
    { q: "Despite ___ tired, he continued working.", options: ["be", "being", "to be"], answer: "being" },
    { q: "He let me ___ his phone.", options: ["using", "use", "to use"], answer: "use" },

    // ------------------ B2 UPPER ------------------
    { q: "Hardly ___ the class start when the alarm rang.", options: ["had", "did", "has"], answer: "had" },
    { q: "It’s high time you ___ home.", options: ["go", "went", "have gone"], answer: "went" },
    {
      q: "The company needs people capable ___ pressure.",
      options: ["in", "under", "with"],
      answer: "under",
    },
    {
      q: "No sooner ___ the door than he realized he forgot his keys.",
      options: ["he closed", "had he closed", "he had closed"],
      answer: "had he closed",
    },
    { q: "I’d rather you ___ me tomorrow.", options: ["call", "called", "calling"], answer: "called" },

    // ------------------ C1 ADVANCED ------------------
    {
      q: "Had I known about the meeting, I ___ attended.",
      options: ["will have", "would have", "had"],
      answer: "would have",
    },
    {
      q: "He admitted ___ the report late.",
      options: ["submitting", "to submit", "submit"],
      answer: "submitting",
    },
    {
      q: "The project was cancelled due to a lack ___ funding.",
      options: ["for", "of", "in"],
      answer: "of",
    },
    {
      q: "Meaning of 'meticulous':",
      options: ["careful with small details", "fast", "careless"],
      answer: "careful with small details",
    },
    {
      q: "Not only ___ the exam, but he got the highest score.",
      options: ["he passed", "did he pass", "has he passed"],
      answer: "did he pass",
    },

    // ------------------ C2 EXPERT ------------------
    {
      q: "The minister denied ___ aware of the issue.",
      options: ["having been", "to have", "being"],
      answer: "having been",
    },
    {
      q: "Meaning of 'unparalleled':",
      options: ["cannot be matched", "very slow", "badly done"],
      answer: "cannot be matched",
    },
    {
      q: "Meaning of 'inconclusive':",
      options: ["unclear", "incorrect", "surprising"],
      answer: "unclear",
    },
    {
      q: "The solution, ___ seemingly simple, required advanced knowledge.",
      options: ["although", "despite", "however"],
      answer: "although",
    },
    {
      q: "He speaks English fluently, ___ his lack of education.",
      options: ["due to", "in spite of", "because of"],
      answer: "in spite of",
    },
  ];

  // ============================
  //   AUDIO FILES
  // ============================
  const correctSound = new Audio("/sounds/correct.mp3");
  const wrongSound = new Audio("/sounds/wrong.mp3");

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);

  const handleAnswer = (choice) => {
    setSelected(choice);

    if (choice === questions[index].answer) {
      setScore(score + 1);
      correctSound.play();
    } else {
      wrongSound.play();
    }

    setTimeout(() => {
      setSelected(null);

      if (index + 1 < questions.length) {
        setIndex(index + 1);
      } else {
        setFinished(true);
      }
    }, 900);
  };

  // ============================
  //   LEVEL CALCULATION
  // ============================
  const getLevel = () => {
    const percent = (score / questions.length) * 100;

    if (percent < 20) return "A1 — Beginner";
    if (percent < 40) return "A2 — Elementary";
    if (percent < 60) return "B1 — Intermediate";
    if (percent < 75) return "B2 — Upper Intermediate";
    if (percent < 90) return "C1 — Advanced";
    return "C2 — Mastery";
  };

  // ============================
  //   SCREENS
  // ============================
  if (!started)
    return (
      <div className="start-screen">
        <h1 className="lt-title">English Level Test</h1>
        <p className="lt-desc">From A1 to C2 — Let's find your level!</p>
        <button className="start-btn" onClick={() => setStarted(true)}>
          Start Test
        </button>
      </div>
    );

  if (finished)
    return (
      <div className="lt-container">
        <h1 className="lt-title">🎉 Test Completed!</h1>

        <div className="lt-result-box">
          <h2 className="lt-result-score">
            {score} / {questions.length}
          </h2>
          <p className="lt-result-level">{getLevel()}</p>
        </div>

        <button className="lt-restart-btn" onClick={() => window.location.reload()}>
          Restart
        </button>
      </div>
    );

  const q = questions[index];

  return (
    <div className="lt-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <h1 className="lt-title">
        Question {index + 1} / {questions.length}
      </h1>

      <div className="lt-question">{q.q}</div>

      <div className="lt-choices">
        {q.options.map((choice, i) => (
          <button
            key={i}
            className={
              "lt-choice " +
              (selected
                ? choice === q.answer
                  ? "correct"
                  : choice === selected
                  ? "wrong"
                  : ""
                : "")
            }
            onClick={() => handleAnswer(choice)}
            disabled={selected !== null}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}

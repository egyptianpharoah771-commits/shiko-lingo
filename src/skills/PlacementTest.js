import React, { useState } from "react";
import "./PlacementTest.css";

export default function PlacementTest() {
  // ===========================
  // 40 QUESTIONS BANK
  // ===========================
  const questions = [
    // ---------- A1 EASY ----------
    { q: "I ___ happy.", a: "am", c: ["is", "are", "be"] },
    { q: "She ___ a doctor.", a: "is", c: ["are", "be", "was"] },
    { q: "They ___ in London.", a: "live", c: ["lives", "living", "lived"] },
    { q: "Opposite of 'hot':", a: "cold", c: ["warm", "cool", "heat"] },
    { q: "I ___ football every day.", a: "play", c: ["plays", "playing", "played"] },
    { q: "He ___ coffee.", a: "likes", c: ["like", "liking", "liked"] },
    { q: "The book is ___ the table.", a: "on", c: ["in", "under", "behind"] },
    { q: "This is my friend. ___ name is Ahmed.", a: "His", c: ["Her", "Their", "Its"] },

    // ---------- A2 ----------
    { q: "I’ve lived here ___ 2010.", a: "since", c: ["for", "from", "in"] },
    { q: "How ___ money do you have?", a: "much", c: ["many", "few", "little"] },
    { q: "She didn’t ___ the film.", a: "like", c: ["liked", "likes", "liking"] },
    { q: "If it ___ tomorrow, we’ll stay home.", a: "rains", c: ["rain", "raining", "rained"] },
    { q: "Meaning of 'borrow':", a: "take temporarily", c: ["take forever", "loan", "give back"] },
    { q: "We ___ dinner when he arrived.", a: "were having", c: ["have", "had", "having"] },
    { q: "This movie is ___ interesting.", a: "very", c: ["more", "too", "much"] },
    { q: "He is ___ than me.", a: "taller", c: ["tall", "more tall", "most tall"] },

    // ---------- B1 ----------
    { q: "I wish I ___ more time.", a: "had", c: ["have", "would have", "has"] },
    { q: "She asked me ___ I liked coffee.", a: "if", c: ["did", "that", "whether"] },
    { q: "Despite ___ tired, he worked late.", a: "being", c: ["be", "to be", "been"] },
    { q: "He let me ___ his car.", a: "use", c: ["using", "to use", "used"] },
    { q: "The film was ___ interesting than expected.", a: "more", c: ["most", "much", "very"] },
    { q: "The book ___ last year.", a: "was published", c: ["published", "is publishing", "has published"] },
    { q: "She suggested ___ out.", a: "going", c: ["go", "went", "to go"] },
    { q: "If I ___ enough money, I’d travel.", a: "had", c: ["have", "has", "am having"] },

    // ---------- B2 ----------
    { q: "It’s high time you ___ home.", a: "went", c: ["go", "have gone", "going"] },
    { q: "No sooner ___ than it started raining.", a: "had we arrived", c: ["we arrived", "arrived", "have arrived"] },
    { q: "He denied ___ the window.", a: "breaking", c: ["break", "to break", "broken"] },
    { q: "Meaning of 'efficient':", a: "works effectively", c: ["too slow", "not helpful", "dangerous"] },
    { q: "Had I known, I ___ earlier.", a: "would have left", c: ["would leave", "left", "had left"] },
    { q: "She was accused of ___ money.", a: "stealing", c: ["steal", "to steal", "stole"] },
    { q: "It’s essential that he ___ on time.", a: "be", c: ["is", "was", "being"] },
    { q: "I’d rather you ___ tomorrow.", a: "called", c: ["call", "calling", "have called"] },

    // ---------- C1 ----------
    { q: "He speaks as though he ___ everything.", a: "knew", c: ["knows", "has known", "know"] },
    { q: "Hardly ___ the news when she cried.", a: "had she heard", c: ["she heard", "heard", "has heard"] },
    { q: "Meaning of 'meticulous':", a: "very careful", c: ["fast", "careless", "unexpected"] },
    { q: "Not only ___ the exam, he topped it.", a: "did he pass", c: ["he passed", "has he passed", "passed he"] },
    { q: "I’d rather you ___ here soon.", a: "were", c: ["are", "was", "be"] },

    // ---------- C2 ----------
    { q: "Meaning of 'inconclusive':", a: "uncertain", c: ["incorrect", "proven", "obvious"] },
    { q: "Only by working hard ___ success.", a: "can you achieve", c: ["you achieve", "you can achieve", "could achieve"] },
    { q: "Rarely ___ such talent.", a: "have I seen", c: ["I have seen", "saw I", "have seen I"] }
  ];

  // ===========================
  // STATE
  // ===========================
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const correctSound = new Audio("/sounds/correct.mp3");
  const wrongSound = new Audio("/sounds/wrong.mp3");

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const handleAnswer = (choice) => {
    setSelected(choice);

    if (choice === questions[index].a) {
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
    }, 800);
  };

  const getLevel = () => {
    const p = (score / questions.length) * 100;

    if (p < 20) return "A1 Beginner Track";
    if (p < 40) return "A2 Elementary Track";
    if (p < 60) return "B1 Intermediate Track";
    if (p < 75) return "B2 Upper-Intermediate Track";
    if (p < 90) return "C1 Advanced Track";
    return "C2 Mastery Track";
  };

  // ===========================
  // UI SCREENS
  // ===========================

  if (!started)
    return (
      <div className="lt-container">
        <h1 className="lt-title">Placement Test</h1>
        <p className="lt-desc">Find your exact English track from A1 → C2</p>

        <button className="lt-start-btn" onClick={() => setStarted(true)}>
          Start Test
        </button>
      </div>
    );

  if (finished)
    return (
      <div className="lt-container">
        <h1 className="lt-title">Your Result</h1>

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

      <h1 className="lt-title">Question {index + 1} / {questions.length}</h1>

      <div className="lt-question">{q.q}</div>

      <div className="lt-choices">
        {shuffle([q.a, ...q.c]).map((choice, i) => (
          <button
            key={i}
            className={
              "lt-choice " +
              (selected
                ? choice === q.a
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

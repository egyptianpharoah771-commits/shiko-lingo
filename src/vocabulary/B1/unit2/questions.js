// src/vocabulary/B1/unit2/questions.js

const questions = [
  // 🟢 Easy – meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'post office' mean?",
    options: ["بنك", "مكتب بريد", "سوبر ماركت"],
    correctAnswer: "مكتب بريد"
  },

  {
    id: 2,
    type: "choice",
    question: "Which phrase means 'انعطف يمينًا'?",
    options: ["turn left", "turn right", "across from"],
    correctAnswer: "turn right"
  },

  // 🟡 Medium – directions
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "The bank is next to the supermarket.",
      "The bank next the supermarket.",
      "Bank is supermarket next."
    ],
    correctAnswer: "The bank is next to the supermarket."
  },

  {
    id: 4,
    type: "choice",
    question: "If something is 'across from' you, where is it?",
    options: [
      "Next to you",
      "Far away",
      "On the other side"
    ],
    correctAnswer: "On the other side"
  },

  // 🔵 Harder – context & logic
  {
    id: 5,
    type: "choice",
    question: "Which sentence gives a direction?",
    options: [
      "The supermarket is big.",
      "Turn left at the bank.",
      "I buy food every day."
    ],
    correctAnswer: "Turn left at the bank."
  },

  {
    id: 6,
    type: "choice",
    question: "What do you usually do at a post office?",
    options: [
      "Buy clothes",
      "Send letters",
      "Watch movies"
    ],
    correctAnswer: "Send letters"
  }
];

export default questions;
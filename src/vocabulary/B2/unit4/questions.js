// src/vocabulary/B2/unit4/questions.js

const questions = [
  // 🟢 Easy – meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'opinion' mean?",
    options: ["قرار", "رأي", "مشكلة"],
    correctAnswer: "رأي"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'يعارض'?",
    options: ["agree", "decide", "disagree"],
    correctAnswer: "disagree"
  },

  // 🟡 Medium – usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "In my opinion, this is a good idea.",
      "In my opinion this good idea.",
      "My opinion in is good."
    ],
    correctAnswer: "In my opinion, this is a good idea."
  },

  {
    id: 4,
    type: "choice",
    question: "Which sentence shows disagreement?",
    options: [
      "I agree with you.",
      "I like this plan.",
      "I disagree with this decision."
    ],
    correctAnswer: "I disagree with this decision."
  },

  // 🔵 Harder – context & logic
  {
    id: 5,
    type: "choice",
    question: "When do people usually make a decision?",
    options: [
      "After thinking about choices",
      "Before hearing any options",
      "Without a reason"
    ],
    correctAnswer: "After thinking about choices"
  },

  {
    id: 6,
    type: "choice",
    question: "Why is it useful to express your opinion?",
    options: [
      "To share what you think",
      "To avoid decisions",
      "To end conversations"
    ],
    correctAnswer: "To share what you think"
  }
];

export default questions;



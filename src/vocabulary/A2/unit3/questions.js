// src/vocabulary/A2/unit3/questions.js

const questions = [
  // 🟢 Easy – direct meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'juice' mean?",
    options: ["ماء", "قهوة", "عصير"],
    correctAnswer: "عصير"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'قائمة الطعام'?",
    options: ["order", "menu", "bill"],
    correctAnswer: "menu"
  },

  // 🟡 Medium – polite ordering
  {
    id: 3,
    type: "choice",
    question: "Choose the most polite sentence:",
    options: [
      "Give me coffee.",
      "I want coffee now.",
      "Can I have a coffee, please?"
    ],
    correctAnswer: "Can I have a coffee, please?"
  },

  {
    id: 4,
    type: "choice",
    question: "What do you say at the end of a meal?",
    options: [
      "Can I see the menu?",
      "Can we have the bill, please?",
      "I order a drink."
    ],
    correctAnswer: "Can we have the bill, please?"
  },

  // 🔵 Harder – context & logic
  {
    id: 5,
    type: "choice",
    question: "Which sentence uses 'would like' correctly?",
    options: [
      "I would like some tea.",
      "I like would tea.",
      "I would tea like."
    ],
    correctAnswer: "I would like some tea."
  },

  {
    id: 6,
    type: "choice",
    question: "Where do you usually use these words?",
    options: [
      "At the hospital",
      "At a café or restaurant",
      "At school"
    ],
    correctAnswer: "At a café or restaurant"
  }
];

export default questions;
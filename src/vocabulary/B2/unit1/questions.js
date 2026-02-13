// src/vocabulary/B2/unit1/questions.js

const questions = [
  // 🟢 Easy – meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'fever' mean?",
    options: ["سعال", "حمّى", "صداع"],
    correctAnswer: "حمّى"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'دواء'?",
    options: ["doctor", "medicine", "healthy"],
    correctAnswer: "medicine"
  },

  // 🟡 Medium – usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "I have a headache.",
      "I am headache.",
      "I headache have."
    ],
    correctAnswer: "I have a headache."
  },

  {
    id: 4,
    type: "choice",
    question: "Which sentence gives advice?",
    options: [
      "I feel sick.",
      "You should see a doctor.",
      "I have a cough."
    ],
    correctAnswer: "You should see a doctor."
  },

  // 🔵 Harder – context & logic
  {
    id: 5,
    type: "choice",
    question: "What should you do if you have a high fever?",
    options: [
      "Ignore it",
      "See a doctor",
      "Go shopping"
    ],
    correctAnswer: "See a doctor"
  },

  {
    id: 6,
    type: "choice",
    question: "Which habit helps you stay healthy?",
    options: [
      "Eating vegetables",
      "Not sleeping",
      "Skipping meals"
    ],
    correctAnswer: "Eating vegetables"
  }
];

export default questions;
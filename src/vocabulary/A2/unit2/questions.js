// src/vocabulary/A2/unit2/questions.js

const questions = [
  // 🟢 Easy – direct meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'bread' mean?",
    options: ["أرز", "خبز", "فاكهة"],
    correctAnswer: "خبز"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'خضروات'?",
    options: ["fruit", "vegetables", "chicken"],
    correctAnswer: "vegetables"
  },

  // 🟡 Medium – daily usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "I eat breakfast in the morning.",
      "I eat morning breakfast.",
      "I breakfast eat morning."
    ],
    correctAnswer: "I eat breakfast in the morning."
  },

  {
    id: 4,
    type: "choice",
    question: "Which sentence shows a preference?",
    options: [
      "I eat dinner at six.",
      "I like fruit.",
      "I cook chicken."
    ],
    correctAnswer: "I like fruit."
  },

  // 🔵 Harder – meaning & logic
  {
    id: 5,
    type: "choice",
    question: "Which food is usually healthy?",
    options: [
      "Vegetables",
      "Bread only",
      "Dinner"
    ],
    correctAnswer: "Vegetables"
  },

  {
    id: 6,
    type: "choice",
    question: "When do people usually eat dinner?",
    options: [
      "In the morning",
      "At night",
      "In the afternoon at school"
    ],
    correctAnswer: "At night"
  }
];

export default questions;
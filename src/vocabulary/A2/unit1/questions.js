// src/vocabulary/A2/unit1/questions.js

const questions = [
  // 🟢 Easy – direct meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'bedroom' mean?",
    options: ["مطبخ", "غرفة نوم", "غرفة معيشة"],
    correctAnswer: "غرفة نوم"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'أريكة'?",
    options: ["table", "sofa", "lamp"],
    correctAnswer: "sofa"
  },

  // 🟡 Medium – usage in context
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "The table is in the kitchen.",
      "The table in kitchen is.",
      "Table the kitchen is."
    ],
    correctAnswer: "The table is in the kitchen."
  },

  {
    id: 4,
    type: "choice",
    question: "Where do you usually watch TV?",
    options: [
      "In the bedroom.",
      "In the living room.",
      "In the cupboard."
    ],
    correctAnswer: "In the living room."
  },

  // 🔵 Harder – description & logic
  {
    id: 5,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "There is two lamps in the room.",
      "There are two lamps in the room.",
      "There are lamp two in the room."
    ],
    correctAnswer: "There are two lamps in the room."
  },

  {
    id: 6,
    type: "choice",
    question: "Where do you usually keep cups?",
    options: [
      "On the sofa.",
      "In the cupboard.",
      "In the bedroom."
    ],
    correctAnswer: "In the cupboard."
  }
];

export default questions;



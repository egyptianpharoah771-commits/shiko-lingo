const questions = [
  // 🟢 Easy – Direct meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'child' mean?",
    options: ["رجل", "طفل", "امرأة"],
    correctAnswer: "طفل"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'كبير الحجم'?",
    options: ["small", "old", "big"],
    correctAnswer: "big"
  },

  // 🟡 Medium – Description usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "The man big is.",
      "The man is big.",
      "The big is man."
    ],
    correctAnswer: "The man is big."
  },

  {
    id: 4,
    type: "choice",
    question: "My sister is 20 years old. She is ____.",
    options: ["old", "young", "small"],
    correctAnswer: "young"
  },

  // 🔵 Harder – Meaning & logic
  {
    id: 5,
    type: "choice",
    question: "Which sentence is correct?",
    options: [
      "The child old is.",
      "The old child is small.",
      "The child is old small."
    ],
    correctAnswer: "The old child is small."
  },

  {
    id: 6,
    type: "choice",
    question: "What is the opposite of 'big'?",
    options: ["old", "young", "small"],
    correctAnswer: "small"
  }
];

export default questions;
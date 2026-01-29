const questions = [
  // 🟢 Easy – Meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'hospital' mean?",
    options: ["مدرسة", "مستشفى", "سوق"],
    correctAnswer: "مستشفى"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'شارع'?",
    options: ["market", "street", "school"],
    correctAnswer: "street"
  },

  // 🟡 Medium – Place usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "I go to market school.",
      "I go to the market.",
      "I market go home."
    ],
    correctAnswer: "I go to the market."
  },

  {
    id: 4,
    type: "choice",
    question: "The hospital is ___ my house.",
    options: ["eat", "near", "sleep"],
    correctAnswer: "near"
  },

  // 🔵 Harder – Meaning & logic
  {
    id: 5,
    type: "choice",
    question: "Which sentence is correct?",
    options: [
      "The school is far the street.",
      "The market is near my house.",
      "I near go to school."
    ],
    correctAnswer: "The market is near my house."
  },

  {
    id: 6,
    type: "choice",
    question: "If something is 'far', what does it mean?",
    options: [
      "It is close.",
      "It is not near.",
      "It is a place."
    ],
    correctAnswer: "It is not near."
  }
];

export default questions;
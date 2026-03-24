// src/vocabulary/B2/unit2/questions.js

const questions = [
  // 🟢 Easy – meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'deadline' mean?",
    options: ["وظيفة", "موعد نهائي", "إجازة"],
    correctAnswer: "موعد نهائي"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'مهمة'?",
    options: ["task", "job", "schedule"],
    correctAnswer: "task"
  },

  // 🟡 Medium – usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "I have many responsibilities at work.",
      "I many responsibilities have.",
      "I responsibilities many have work."
    ],
    correctAnswer: "I have many responsibilities at work."
  },

  {
    id: 4,
    type: "choice",
    question: "Which sentence talks about time?",
    options: [
      "My job is stressful.",
      "I work full-time.",
      "My task is easy."
    ],
    correctAnswer: "I work full-time."
  },

  // 🔵 Harder – context & logic
  {
    id: 5,
    type: "choice",
    question: "What happens if you miss a deadline?",
    options: [
      "The work may be late",
      "You finish early",
      "You take a holiday"
    ],
    correctAnswer: "The work may be late"
  },

  {
    id: 6,
    type: "choice",
    question: "Why is a schedule important?",
    options: [
      "It helps organize your time",
      "It makes work harder",
      "It removes responsibilities"
    ],
    correctAnswer: "It helps organize your time"
  }
];

export default questions;



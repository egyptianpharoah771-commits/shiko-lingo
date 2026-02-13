const questions = [
  // 🟢 Easy – Direct meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'wake up' mean?",
    options: ["ينام", "يستيقظ", "يعمل"],
    correctAnswer: "يستيقظ"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'يدرس'?",
    options: ["sleep", "study", "eat"],
    correctAnswer: "study"
  },

  // 🟡 Medium – Context understanding
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "I sleep breakfast.",
      "I eat breakfast in the morning.",
      "I wake breakfast every day."
    ],
    correctAnswer: "I eat breakfast in the morning."
  },

  {
    id: 4,
    type: "choice",
    question: "What do you do after work?",
    options: [
      "You go to work.",
      "You come home.",
      "You wake up."
    ],
    correctAnswer: "You come home."
  },

  // 🔵 Harder – Meaning in use
  {
    id: 5,
    type: "choice",
    question: "Which sentence is correct?",
    options: [
      "I go to work at night and wake up.",
      "I wake up, eat, and go to work.",
      "I sleep and go home in the morning."
    ],
    correctAnswer: "I wake up, eat, and go to work."
  }
];

export default questions;
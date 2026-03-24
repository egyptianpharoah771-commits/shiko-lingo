// src/vocabulary/B2/unit3/questions.js

const questions = [
  // 🟢 Easy – meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'delay' mean?",
    options: ["وصول مبكر", "تأخير", "إلغاء"],
    correctAnswer: "تأخير"
  },

  {
    id: 2,
    type: "choice",
    question: "Which phrase means 'أمتعة مفقودة'?",
    options: ["lost luggage", "carry-on bag", "travel ticket"],
    correctAnswer: "lost luggage"
  },

  // 🟡 Medium – usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "My flight was cancelled.",
      "My flight cancelled was.",
      "My flight was cancel."
    ],
    correctAnswer: "My flight was cancelled."
  },

  {
    id: 4,
    type: "choice",
    question: "Which sentence shows a complaint?",
    options: [
      "I enjoyed the trip.",
      "I complained about the delay.",
      "I booked a ticket."
    ],
    correctAnswer: "I complained about the delay."
  },

  // 🔵 Harder – logic & context
  {
    id: 5,
    type: "choice",
    question: "What should you do if your luggage is lost?",
    options: [
      "Leave the airport",
      "Report the problem",
      "Buy a ticket home"
    ],
    correctAnswer: "Report the problem"
  },

  {
    id: 6,
    type: "choice",
    question: "Why might someone ask for a refund?",
    options: [
      "Because the service was bad",
      "Because they enjoyed the trip",
      "Because the flight was early"
    ],
    correctAnswer: "Because the service was bad"
  }
];

export default questions;
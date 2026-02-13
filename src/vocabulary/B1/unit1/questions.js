// src/vocabulary/B1/unit1/questions.js

const questions = [
  // 🟢 Easy – meaning
  {
    id: 1,
    type: "choice",
    question: "What does 'ticket' mean?",
    options: ["محطة", "تذكرة", "رحلة"],
    correctAnswer: "تذكرة"
  },

  {
    id: 2,
    type: "choice",
    question: "Which word means 'قطار'?",
    options: ["bus", "train", "plane"],
    correctAnswer: "train"
  },

  // 🟡 Medium – usage
  {
    id: 3,
    type: "choice",
    question: "Choose the correct sentence:",
    options: [
      "I travel by plane.",
      "I travel with plane.",
      "I plane travel."
    ],
    correctAnswer: "I travel by plane."
  },

  {
    id: 4,
    type: "choice",
    question: "Where do you usually buy a ticket?",
    options: [
      "At the station",
      "At the restaurant",
      "At home in the kitchen"
    ],
    correctAnswer: "At the station"
  },

  // 🔵 Harder – logic & context
  {
    id: 5,
    type: "choice",
    question: "Which sentence talks about a past experience?",
    options: [
      "I take the bus every day.",
      "We had a great trip last summer.",
      "I am at the station now."
    ],
    correctAnswer: "We had a great trip last summer."
  },

  {
    id: 6,
    type: "choice",
    question: "Which transport is usually fastest for long distances?",
    options: [
      "Bus",
      "Train",
      "Plane"
    ],
    correctAnswer: "Plane"
  }
];

export default questions;
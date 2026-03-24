const questions = [
  {
    id: 1,
    question: "You ___ wear a seatbelt while driving. It's the law.",
    options: ["must", "can", "might"],
    answer: "must",
    concept: "modal_obligation_strong",
    skill: "obligation",
    explanation: "Use 'must' for strong obligation, especially rules and laws."
  },
  {
    id: 2,
    question: "You ___ come tomorrow if you don't want to. It's optional.",
    options: ["mustn't", "don't have to", "can't"],
    answer: "don't have to",
    concept: "modal_no_obligation",
    skill: "lack_of_obligation",
    explanation: "'Don't have to' means something is not necessary."
  },
  {
    id: 3,
    question: "She ___ be very tired; she worked all night.",
    options: ["can't", "must", "shouldn't"],
    answer: "must",
    concept: "modal_deduction_positive",
    skill: "logical_deduction",
    explanation: "Use 'must' to show a strong logical conclusion based on evidence."
  },
  {
    id: 4,
    question: "He ___ be at home. His car isn't outside.",
    options: ["must", "can't", "has to"],
    answer: "can't",
    concept: "modal_deduction_negative",
    skill: "logical_deduction",
    explanation: "Use 'can't' when something is logically impossible."
  },
  {
    id: 5,
    question: "Students ___ use their phones during the exam.",
    options: ["don't have to", "mustn't", "might"],
    answer: "mustn't",
    concept: "modal_prohibition",
    skill: "prohibition",
    explanation: "'Mustn't' is used to say something is not allowed."
  },
  {
    id: 6,
    question: "You ___ speak loudly in the library; people are studying.",
    options: ["mustn't", "don't have to", "might not"],
    answer: "mustn't",
    concept: "modal_prohibition",
    skill: "prohibition",
    explanation: "Use 'mustn't' for rules and strong prohibition."
  }
];

export default questions;
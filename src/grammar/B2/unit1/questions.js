const questions = [
  {
    id: 1,
    question: "The room ___ every day as part of the cleaning schedule.",
    options: ["cleans", "is cleaned", "was cleaned"],
    answer: "is cleaned",
    concept: "present_simple_passive",
    skill: "passive_present",
    explanation: "Use am / is / are + past participle for the Present Simple passive."
  },
  {
    id: 2,
    question: "Which sentence correctly uses the passive in the past?",
    options: [
      "The email sends by the manager yesterday.",
      "The email was sent by the manager yesterday.",
      "The email is sent by the manager yesterday."
    ],
    answer: "The email was sent by the manager yesterday.",
    concept: "past_simple_passive",
    skill: "passive_past",
    explanation: "Use was / were + past participle for the Past Simple passive."
  },
  {
    id: 3,
    question: "All documents ___ before the meeting can begin.",
    options: ["must prepare", "must be prepared", "must prepared"],
    answer: "must be prepared",
    concept: "modal_passive",
    skill: "modal_passive_form",
    explanation: "With modal verbs, use: modal + be + past participle."
  },
  {
    id: 4,
    question: "The bridge ___ in the 19th century and is still in use today.",
    options: ["builds", "is built", "was built"],
    answer: "was built",
    concept: "past_simple_passive_historical",
    skill: "passive_past",
    explanation: "Use the Past Simple passive for completed actions in history."
  },
  {
    id: 5,
    question: "Which sentence shows a passive action in progress in the past?",
    options: [
      "Dinner cooked when we arrived.",
      "Dinner was cooking when we arrived.",
      "Dinner was being cooked when we arrived."
    ],
    answer: "Dinner was being cooked when we arrived.",
    concept: "past_continuous_passive",
    skill: "passive_continuous",
    explanation: "Use was / were being + past participle for actions in progress in the past."
  }
];

export default questions;
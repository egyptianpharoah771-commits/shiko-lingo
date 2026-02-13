const questions = [
  {
    id: 1,
    question: "I’m thirsty. I ___ get some water.",
    options: ["will", "am going to", "went to"],
    answer: "will",
    concept: "future_spontaneous_decision",
    skill: "instant_decision",
    explanation: "Use 'will' for decisions made at the moment of speaking."
  },
  {
    id: 2,
    question: "Which sentence shows a prediction based on evidence?",
    options: [
      "I think it will rain someday.",
      "Look at the dark clouds! It is going to rain.",
      "It rained yesterday."
    ],
    answer: "Look at the dark clouds! It is going to rain.",
    concept: "future_prediction_evidence",
    skill: "evidence_based_prediction",
    explanation: "Use 'going to' when there is clear evidence for the prediction."
  },
  {
    id: 3,
    question: "She has decided. She ___ study abroad.",
    options: ["will", "is going to", "was"],
    answer: "is going to",
    concept: "future_prior_plan",
    skill: "planned_future",
    explanation: "Use 'going to' for plans or decisions made before now."
  },
  {
    id: 4,
    question: "Don’t worry, I ___ help you.",
    options: ["will", "am going to", "helped"],
    answer: "will",
    concept: "future_offer_promise",
    skill: "offer_promise",
    explanation: "Use 'will' for offers, promises, and reassurance."
  },
  {
    id: 5,
    question: "We bought the tickets. We ___ travel tomorrow.",
    options: ["will", "are going to", "traveled"],
    answer: "are going to",
    concept: "future_fixed_plan",
    skill: "planned_action",
    explanation: "Use 'going to' when the plan is already arranged."
  }
];

export default questions;
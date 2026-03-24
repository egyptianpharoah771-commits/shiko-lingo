const questions = [
  {
    id: 1,
    question: "My brother ___ his phone, so he can't call anyone now.",
    options: ["lost", "has lost", "loses"],
    answer: "has lost",
    concept: "present_perfect_result",
    skill: "present_result",
    explanation: "Use the Present Perfect when the result is important now."
  },
  {
    id: 2,
    question: "Which sentence is correct?",
    options: [
      "I have met my boss last week.",
      "I met my boss last week.",
      "I have meet my boss last week."
    ],
    answer: "I met my boss last week.",
    concept: "past_simple_time_expression",
    skill: "past_time_marker",
    explanation: "Use the Past Simple with finished time expressions like 'last week'."
  },
  {
    id: 3,
    question: "She ___ for that company for ten years before she changed jobs.",
    options: ["has worked", "worked", "works"],
    answer: "worked",
    concept: "past_simple_finished_period",
    skill: "finished_time",
    explanation: "Use the Past Simple for actions that started and finished in the past."
  },
  {
    id: 4,
    question: "Which sentence focuses on the result now?",
    options: [
      "He broke his leg in 2019.",
      "He has broken his leg.",
      "He breaks his leg."
    ],
    answer: "He has broken his leg.",
    concept: "present_perfect_focus_on_result",
    skill: "result_vs_time",
    explanation: "The Present Perfect focuses on the present result, not the time."
  },
  {
    id: 5,
    question: "We didn't know the answer because we ___ this topic before.",
    options: ["didn't study", "haven't studied", "don't study"],
    answer: "haven't studied",
    concept: "present_perfect_experience",
    skill: "experience_before_now",
    explanation: "Use the Present Perfect for experiences before now with no exact time."
  }
];

export default questions;
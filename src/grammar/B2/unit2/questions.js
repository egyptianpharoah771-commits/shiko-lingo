const questions = [
  {
    id: 1,
    question: "If you heat water to 100°C, it ___.",
    options: ["will boil", "boils", "would boil"],
    answer: "boils",
    concept: "zero_conditional_fact",
    skill: "conditional_zero",
    explanation: "The Zero Conditional uses present simple for general facts and scientific truths."
  },
  {
    id: 2,
    question: "If it rains, we ___ at home.",
    options: ["stay", "would stay", "will stay"],
    answer: "will stay",
    concept: "first_conditional_real_future",
    skill: "conditional_first",
    explanation: "The First Conditional uses present simple + will for real future possibilities."
  },
  {
    id: 3,
    question: "If I ___ rich, I would buy a big house.",
    options: ["am", "was", "were"],
    answer: "were",
    concept: "second_conditional_unreal_present",
    skill: "conditional_second",
    explanation: "The Second Conditional uses 'were' for unreal or imaginary situations."
  },
  {
    id: 4,
    question: "Which sentence correctly expresses an unreal past situation?",
    options: [
      "If she left earlier, she wouldn't be late.",
      "If she had left earlier, she wouldn't have been late.",
      "If she leaves earlier, she won't be late."
    ],
    answer: "If she had left earlier, she wouldn't have been late.",
    concept: "third_conditional_unreal_past",
    skill: "conditional_third",
    explanation: "The Third Conditional talks about unreal situations in the past and their results."
  },
  {
    id: 5,
    question: "You won't succeed ___ you work harder.",
    options: ["if", "unless", "when"],
    answer: "unless",
    concept: "conditional_unless",
    skill: "conditional_connector",
    explanation: "'Unless' means 'if not' and is commonly used in conditional sentences."
  },
  {
    id: 6,
    question: "Which sentence shows a mixed conditional (past cause, present result)?",
    options: [
      "If he follows the instructions, the problem will disappear.",
      "If he had followed the instructions, the problem wouldn't exist now.",
      "If he followed the instructions, the problem wouldn't exist."
    ],
    answer: "If he had followed the instructions, the problem wouldn't exist now.",
    concept: "mixed_conditional_past_present",
    skill: "conditional_mixed",
    explanation: "Mixed conditionals combine a past condition with a present result."
  }
];

export default questions;
const questions = [
  {
    id: 1,
    question: "She said that she ___ tired.",
    options: ["is", "was", "has been"],
    answer: "was",
    concept: "reported_statement_tense_backshift",
    skill: "tense_backshift",
    explanation: "In reported speech, the present simple usually changes to past simple."
  },
  {
    id: 2,
    question: "He said that he ___ call me later.",
    options: ["will", "would", "can"],
    answer: "would",
    concept: "reported_future_will",
    skill: "modal_backshift",
    explanation: "'Will' changes to 'would' in reported speech."
  },
  {
    id: 3,
    question: "Which sentence correctly reports an action in progress in the past?",
    options: [
      "They said they are working at that moment.",
      "They said they were working at that moment.",
      "They said they have been working at that moment."
    ],
    answer: "They said they were working at that moment.",
    concept: "reported_continuous",
    skill: "tense_backshift",
    explanation: "Present Continuous becomes Past Continuous in reported speech."
  },
  {
    id: 4,
    question: "She said that she ___ finished the work.",
    options: ["has", "had", "have"],
    answer: "had",
    concept: "reported_present_perfect",
    skill: "tense_backshift",
    explanation: "Present Perfect changes to Past Perfect in reported speech."
  },
  {
    id: 5,
    question: "He said that he lived ___ .",
    options: ["here", "there", "this place"],
    answer: "there",
    concept: "reported_place_words",
    skill: "place_reference",
    explanation: "Words like 'here' usually change to 'there' in reported speech."
  },
  {
    id: 6,
    question: "She asked me where I ___ from.",
    options: ["am", "was", "were"],
    answer: "was",
    concept: "reported_questions",
    skill: "reported_question_form",
    explanation: "Reported questions use statement word order and tense backshift."
  },
  {
    id: 7,
    question: "The teacher told us ___ quiet.",
    options: ["be", "to be", "being"],
    answer: "to be",
    concept: "reported_commands",
    skill: "infinitive_command",
    explanation: "Commands in reported speech use: told / asked + object + to + verb."
  }
];

export default questions;
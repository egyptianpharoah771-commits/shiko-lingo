const questions = [
  {
    id: 1,
    question: "Which sentence uses the most formal and polite tone?",
    options: [
      "Can you help me with this?",
      "Help me with this.",
      "I would appreciate your assistance with this matter."
    ],
    answer: "I would appreciate your assistance with this matter.",
    concept: "formal_polite_request",
    skill: "politeness_register",
    explanation: "Formal requests often use indirect language and phrases like 'I would appreciate' to sound polite and professional."
  },
  {
    id: 2,
    question: "The report ___ incomplete due to missing data.",
    options: ["is", "seems", "looks like"],
    answer: "seems",
    concept: "hedging_with_seem",
    skill: "cautious_statement",
    explanation: "'Seems' is used to soften statements and avoid sounding too definite."
  },
  {
    id: 3,
    question: "Which option sounds the most polite and diplomatic?",
    options: [
      "Send me the file as soon as possible.",
      "I need the file now.",
      "Could you please send me the file when you have a moment?"
    ],
    answer: "Could you please send me the file when you have a moment?",
    concept: "polite_request_diplomatic",
    skill: "professional_communication",
    explanation: "Polite requests use modal verbs, 'please', and time-softening phrases to reduce pressure."
  },
  {
    id: 4,
    question: "Formal academic writing usually avoids ___ .",
    options: ["contractions", "complex sentence structures", "passive constructions"],
    answer: "contractions",
    concept: "academic_style_rules",
    skill: "formal_writing_conventions",
    explanation: "Academic writing avoids contractions (e.g., don't, can't) to maintain a formal tone."
  },
  {
    id: 5,
    question: "We regret to inform you ___ your application has been unsuccessful.",
    options: ["that", "because", "so"],
    answer: "that",
    concept: "formal_reporting_clause",
    skill: "formal_notification",
    explanation: "'That' is used to introduce formal reported statements, especially in official communication."
  }
];

export default questions;
const questions = [
  {
    id: 1,
    question: "Which sentence expresses less certainty?",
    options: [
      "She will finish the project on time.",
      "She is expected to finish the project on time.",
      "She finishes the project on time."
    ],
    answer: "She is expected to finish the project on time.",
    concept: "hedging_reduced_certainty",
    skill: "certainty_control",
    explanation: "Hedging expressions like 'is expected to' reduce certainty and sound more cautious."
  },
  {
    id: 2,
    question: "Which sentence sounds more cautious?",
    options: [
      "This approach solves the problem.",
      "This approach appears to solve the problem.",
      "This approach solved the problem."
    ],
    answer: "This approach appears to solve the problem.",
    concept: "hedging_appearance",
    skill: "cautious_claim",
    explanation: "Words like 'appears to' are used to avoid making absolute claims."
  },
  {
    id: 3,
    question: "Which sentence is more suitable for formal academic writing?",
    options: [
      "The results show a big difference between the groups.",
      "The results indicate a significant difference between the groups.",
      "The results show that the groups are different."
    ],
    answer: "The results indicate a significant difference between the groups.",
    concept: "academic_vocabulary_precision",
    skill: "formal_register",
    explanation: "Academic writing prefers precise terms like 'indicate' and 'significant'."
  },
  {
    id: 4,
    question: "Which sentence creates more distance between the writer and the claim?",
    options: [
      "We believe this explanation is accurate.",
      "It is believed that this explanation is accurate.",
      "This explanation is accurate."
    ],
    answer: "It is believed that this explanation is accurate.",
    concept: "impersonal_structure",
    skill: "writer_distance",
    explanation: "Impersonal structures reduce the writer’s direct responsibility for the claim."
  },
  {
    id: 5,
    question: "Which sentence places stronger emphasis on the effort involved?",
    options: [
      "He resolved the issue.",
      "He managed to resolve the issue.",
      "He was resolving the issue."
    ],
    answer: "He managed to resolve the issue.",
    concept: "emphasis_on_effort",
    skill: "nuance_expression",
    explanation: "'Managed to' emphasizes difficulty or effort before success."
  },
  {
    id: 6,
    question: "Which sentence implies an unexpected result?",
    options: [
      "She passed the exam.",
      "She eventually passed the exam.",
      "She actually passed the exam."
    ],
    answer: "She actually passed the exam.",
    concept: "unexpected_outcome_marker",
    skill: "discourse_marker",
    explanation: "'Actually' is often used to signal surprise or contrast with expectations."
  },
  {
    id: 7,
    question: "Which sentence subtly suggests criticism?",
    options: [
      "The proposal is interesting.",
      "The proposal is interesting, but somewhat unclear.",
      "The proposal is very interesting."
    ],
    answer: "The proposal is interesting, but somewhat unclear.",
    concept: "softened_criticism",
    skill: "polite_critique",
    explanation: "Hedging words like 'somewhat' soften criticism in formal contexts."
  },
  {
    id: 8,
    question: "Which sentence suggests reluctance rather than willingness?",
    options: [
      "I will attend the meeting.",
      "I suppose I will attend the meeting.",
      "I am attending the meeting."
    ],
    answer: "I suppose I will attend the meeting.",
    concept: "reluctant_attitude_marker",
    skill: "attitude_expression",
    explanation: "'I suppose' suggests hesitation or lack of enthusiasm."
  }
];

export default questions;
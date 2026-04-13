function createLesson(level, index, title, prompt, guidingQuestions) {
  return {
    content: {
      id: `${level}-writing-lesson${index}`,
      title,
      level,
      prompt,
    },
    questions: guidingQuestions.map((question, i) => ({
      id: i + 1,
      question,
    })),
  };
}

export const WRITING_CURRICULUM = {
  A1: {
    lesson1: createLesson("A1", 1, "Introduce Yourself", "Write 4-5 simple sentences about yourself.", [
      "What is your name?",
      "Where are you from?",
      "What do you do every day?",
    ]),
    lesson2: createLesson("A1", 2, "My Daily Routine", "Write about your day from morning to night.", [
      "What time do you wake up?",
      "What do you do in the afternoon?",
      "What do you do before sleep?",
    ]),
    lesson3: createLesson("A1", 3, "My Family", "Describe your family in short simple sentences.", [
      "Who is in your family?",
      "What are they like?",
      "What do you do together?",
    ]),
    lesson4: createLesson("A1", 4, "My Home", "Write a short paragraph describing your home.", [
      "Where is your home?",
      "How many rooms are there?",
      "Which room do you like most?",
    ]),
    lesson5: createLesson("A1", 5, "Food I Like", "Write about your favorite food and drinks.", [
      "What food do you like?",
      "When do you eat it?",
      "Why do you like it?",
    ]),
    lesson6: createLesson("A1", 6, "Weekend Plan", "Write your simple weekend plan.", [
      "Where will you go?",
      "Who will go with you?",
      "What will you do there?",
    ]),
  },
  A2: {
    lesson1: createLesson("A2", 1, "A Special Day", "Write about a special day in your life.", [
      "When was it?",
      "What happened?",
      "How did you feel?",
    ]),
    lesson2: createLesson("A2", 2, "Travel Story", "Write about a city you visited.", [
      "Where did you go?",
      "What places did you visit?",
      "Would you go again? Why?",
    ]),
    lesson3: createLesson("A2", 3, "Healthy Habits", "Write about healthy habits you follow.", [
      "What healthy habit do you have?",
      "What unhealthy habit do you want to stop?",
      "How can you improve?",
    ]),
    lesson4: createLesson("A2", 4, "Learning English", "Write about your English learning journey.", [
      "Why are you learning English?",
      "What is difficult for you?",
      "How do you practice?",
    ]),
    lesson5: createLesson("A2", 5, "Problem and Solution", "Write about a problem and how you solved it.", [
      "What was the problem?",
      "What did you try first?",
      "What worked in the end?",
    ]),
    lesson6: createLesson("A2", 6, "Advice to a Friend", "Write a short advice message to a friend.", [
      "What issue does your friend have?",
      "What advice do you give?",
      "Why is this advice useful?",
    ]),
  },
  B1: {
    lesson1: createLesson("B1", 1, "City or Countryside", "Write an opinion paragraph: city life vs countryside life.", [
      "What are city advantages?",
      "What are countryside advantages?",
      "What is your final opinion?",
    ]),
    lesson2: createLesson("B1", 2, "Technology and Life", "Write about how technology changed your life.", [
      "What technology do you use most?",
      "What is one positive effect?",
      "What is one negative effect?",
    ]),
    lesson3: createLesson("B1", 3, "Work-Life Balance", "Write practical suggestions for better balance.", [
      "Why is balance difficult?",
      "What habits can improve balance?",
      "What happens if balance is missing?",
    ]),
    lesson4: createLesson("B1", 4, "Social Media Impact", "Write a balanced paragraph about social media.", [
      "What are the benefits?",
      "What are the risks?",
      "How can people use it responsibly?",
    ]),
    lesson5: createLesson("B1", 5, "Learning from Failure", "Write about a failure and the lesson you learned.", [
      "What happened?",
      "How did you react?",
      "What did you learn?",
    ]),
    lesson6: createLesson("B1", 6, "Career Plan", "Write your career plan for the next 5 years.", [
      "What career do you want?",
      "What skills do you need?",
      "What steps will you take?",
    ]),
  },
  B2: {
    lesson1: createLesson("B2", 1, "Improving Education", "Write a persuasive paragraph about one education reform.", [
      "What change do you propose?",
      "Why is this change important?",
      "What challenge might appear?",
    ]),
    lesson2: createLesson("B2", 2, "Remote Work Debate", "Write a compare-and-contrast paragraph on remote vs office work.", [
      "What are remote-work advantages?",
      "What are office-work advantages?",
      "Which model do you support and why?",
    ]),
    lesson3: createLesson("B2", 3, "Advertising Influence", "Write about how advertising affects buying behavior.", [
      "How does advertising influence people?",
      "Who is most affected?",
      "How can buyers make smarter choices?",
    ]),
    lesson4: createLesson("B2", 4, "Cultural Awareness", "Write about why cultural awareness matters in communication.", [
      "What problems can cultural misunderstanding cause?",
      "How can we communicate respectfully?",
      "Why is this important today?",
    ]),
    lesson5: createLesson("B2", 5, "Climate Responsibility", "Write an argument on responsibility for climate action.", [
      "What role should individuals play?",
      "What role should governments play?",
      "What balanced solution do you propose?",
    ]),
    lesson6: createLesson("B2", 6, "Ethics of Innovation", "Write about benefits and ethical risks of innovation.", [
      "What innovation helps society most?",
      "What ethical concern exists?",
      "How can regulation help?",
    ]),
  },
  C1: {
    lesson1: createLesson("C1", 1, "Freedom and Security", "Write an advanced analytical paragraph about freedom vs security.", [
      "When can restrictions be justified?",
      "What risks come from too much control?",
      "What principle should guide policy?",
    ]),
    lesson2: createLesson("C1", 2, "AI and Human Identity", "Write a nuanced argument on AI and human creativity.", [
      "How does AI enhance creativity?",
      "How may AI threaten authenticity?",
      "What balance should society seek?",
    ]),
    lesson3: createLesson("C1", 3, "Media and Truth", "Write a critical paragraph on media framing.", [
      "How does framing shape perception?",
      "Why do people trust certain narratives?",
      "How can media literacy help?",
    ]),
    lesson4: createLesson("C1", 4, "Economic Inequality", "Write a cause-effect analysis of inequality.", [
      "What drives inequality?",
      "How does it affect social cohesion?",
      "What policy is most effective?",
    ]),
    lesson5: createLesson("C1", 5, "Leadership in Crisis", "Write an evaluative paragraph on crisis leadership.", [
      "What leadership quality matters most?",
      "How should leaders communicate uncertainty?",
      "How can trust be protected?",
    ]),
    lesson6: createLesson("C1", 6, "Future of Education 2040", "Write a strategic vision paragraph for education in 2040.", [
      "Which skills should schools prioritize?",
      "How should technology be integrated?",
      "What makes your model sustainable?",
    ]),
  },
};

export const WRITING_LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];

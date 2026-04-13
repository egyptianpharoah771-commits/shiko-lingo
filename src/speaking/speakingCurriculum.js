function createLesson(level, index, title, prompt, tips, guidingQuestions) {
  return {
    content: {
      id: `${level}-speaking-lesson${index}`,
      title,
      level,
      prompt,
      tips,
    },
    questions: guidingQuestions.map((question, i) => ({
      id: i + 1,
      question,
    })),
  };
}

export const SPEAKING_CURRICULUM = {
  A1: {
    lesson1: createLesson(
      "A1",
      1,
      "Introduce Yourself",
      "Speak about yourself in 4 short sentences.",
      ["Say your name and country.", "Say your age or job.", "Use simple present."],
      ["What is your name?", "Where are you from?", "What do you do every day?"]
    ),
    lesson2: createLesson(
      "A1",
      2,
      "Daily Routine",
      "Describe your daily routine in simple order.",
      ["Use: first, then, after that.", "Mention morning and evening."],
      ["What time do you wake up?", "What do you do after breakfast?", "What do you do at night?"]
    ),
    lesson3: createLesson(
      "A1",
      3,
      "Family and Friends",
      "Talk about your family or a close friend.",
      ["Use adjectives: kind, funny, helpful.", "Use short clear sentences."],
      ["Who is this person?", "What is this person like?", "What do you do together?"]
    ),
    lesson4: createLesson(
      "A1",
      4,
      "My Home and Room",
      "Describe your home using basic vocabulary.",
      ["Use there is/there are.", "Mention 3 objects in your room."],
      ["Where do you live?", "What is in your room?", "Why do you like your home?"]
    ),
    lesson5: createLesson(
      "A1",
      5,
      "Food and Preferences",
      "Talk about food you like and dislike.",
      ["Use: I like / I don't like.", "Give one reason."],
      ["What food do you like?", "What food do you dislike?", "What do you usually eat for lunch?"]
    ),
    lesson6: createLesson(
      "A1",
      6,
      "Weekend Plans",
      "Explain your weekend plan in simple future.",
      ["Use: I will / I'm going to.", "Mention place, time, and activity."],
      ["What will you do this weekend?", "Who will go with you?", "Why is this plan important to you?"]
    ),
  },
  A2: {
    lesson1: createLesson(
      "A2",
      1,
      "A Memorable Day",
      "Describe one memorable day from your life.",
      ["Use past simple.", "Include where, when, and who."],
      ["When did it happen?", "What happened?", "How did you feel?"]
    ),
    lesson2: createLesson(
      "A2",
      2,
      "Travel Experience",
      "Talk about a city or place you visited.",
      ["Describe transport, weather, and activities.", "Use connecting words."],
      ["Where did you go?", "What did you do there?", "Would you visit again? Why?"]
    ),
    lesson3: createLesson(
      "A2",
      3,
      "Healthy Lifestyle",
      "Explain your healthy and unhealthy habits.",
      ["Use frequency adverbs.", "Compare old habit vs new habit."],
      ["What healthy habit do you have?", "What habit do you want to change?", "How can you improve?"]
    ),
    lesson4: createLesson(
      "A2",
      4,
      "Learning Goals",
      "Speak about your English learning goals.",
      ["Mention a short-term and long-term goal.", "Explain your study plan."],
      ["Why are you learning English?", "What is your next goal?", "How will you reach it?"]
    ),
    lesson5: createLesson(
      "A2",
      5,
      "Problem and Solution",
      "Describe a daily problem and how you solved it.",
      ["Use past sequence.", "Focus on practical solution."],
      ["What was the problem?", "What did you try first?", "What was the final solution?"]
    ),
    lesson6: createLesson(
      "A2",
      6,
      "Giving Advice",
      "Give advice to a friend in a real-life situation.",
      ["Use should / shouldn't / could.", "Give 2-3 clear suggestions."],
      ["What situation does your friend have?", "What advice do you give?", "Why is your advice useful?"]
    ),
  },
  B1: {
    lesson1: createLesson(
      "B1",
      1,
      "City vs Countryside",
      "Give your opinion about living in the city or countryside.",
      ["State your position clearly.", "Support it with examples."],
      ["What are advantages of city life?", "What are advantages of countryside life?", "What is your final choice and why?"]
    ),
    lesson2: createLesson(
      "B1",
      2,
      "Technology in Daily Life",
      "Discuss how technology affects your life.",
      ["Mention one positive and one negative effect.", "Use clear opinion markers."],
      ["What technology do you use most?", "How does it help you?", "What risk do you see?"]
    ),
    lesson3: createLesson(
      "B1",
      3,
      "Work-Life Balance",
      "Explain how people can balance work and personal life.",
      ["Use practical suggestions.", "Organize your answer in points."],
      ["Why is balance difficult today?", "What habits can help?", "What happens without balance?"]
    ),
    lesson4: createLesson(
      "B1",
      4,
      "Social Media Influence",
      "Talk about social media effects on young people.",
      ["Use examples from real life.", "Show both sides before conclusion."],
      ["What are benefits of social media?", "What are the risks?", "How can users stay safe?"]
    ),
    lesson5: createLesson(
      "B1",
      5,
      "Learning from Failure",
      "Describe a failure and what you learned from it.",
      ["Use narrative structure.", "End with lesson learned."],
      ["What happened?", "How did you react first?", "What did you learn?"]
    ),
    lesson6: createLesson(
      "B1",
      6,
      "Future Career Plan",
      "Present your career plan for the next five years.",
      ["Include goals, skills, and timeline.", "Use confident language."],
      ["What career do you want?", "What skills are required?", "What is your action plan?"]
    ),
  },
  B2: {
    lesson1: createLesson(
      "B2",
      1,
      "Education Reform",
      "Evaluate one change that schools should adopt.",
      ["Present argument + counterargument.", "Use academic connectors."],
      ["What change do you propose?", "What benefits do you expect?", "What challenge might appear?"]
    ),
    lesson2: createLesson(
      "B2",
      2,
      "Remote Work Debate",
      "Discuss whether remote work is better than office work.",
      ["Compare productivity, teamwork, and wellbeing.", "Give evidence-based opinion."],
      ["What are key benefits?", "What are major drawbacks?", "What model is best in your view?"]
    ),
    lesson3: createLesson(
      "B2",
      3,
      "Consumer Habits",
      "Analyze how advertising affects buying decisions.",
      ["Explain psychological impact.", "Provide one real-world example."],
      ["How does advertising influence behavior?", "Who is most affected?", "How can consumers decide better?"]
    ),
    lesson4: createLesson(
      "B2",
      4,
      "Cultural Differences",
      "Explain how cultural awareness improves communication.",
      ["Use one misunderstanding example.", "Suggest prevention strategies."],
      ["What can cause cultural misunderstandings?", "How can people communicate respectfully?", "Why is this skill important globally?"]
    ),
    lesson5: createLesson(
      "B2",
      5,
      "Climate Responsibility",
      "Argue who carries the bigger responsibility for climate action.",
      ["Compare individuals, companies, and governments.", "Conclude with balanced stance."],
      ["Who should act first?", "What actions are realistic?", "How can cooperation work?"]
    ),
    lesson6: createLesson(
      "B2",
      6,
      "Innovation and Ethics",
      "Discuss ethical limits of modern innovation.",
      ["Define innovation benefit first.", "Then discuss ethical boundaries."],
      ["What innovation helps society most?", "What ethical concern exists?", "How can regulation help?"]
    ),
  },
  C1: {
    lesson1: createLesson(
      "C1",
      1,
      "Freedom vs Security",
      "Present a nuanced view on balancing freedom and security.",
      ["Acknowledge both philosophical positions.", "Use precise, formal language."],
      ["When can security justify restrictions?", "What risks arise from overcontrol?", "What principle should guide policy?"]
    ),
    lesson2: createLesson(
      "C1",
      2,
      "AI and Human Identity",
      "Examine how AI changes human creativity and identity.",
      ["Use abstract vocabulary.", "Structure response as thesis-antithesis-synthesis."],
      ["How does AI expand creativity?", "Where might authenticity be threatened?", "What future balance do you expect?"]
    ),
    lesson3: createLesson(
      "C1",
      3,
      "Media Framing and Truth",
      "Analyze how media framing shapes public truth.",
      ["Distinguish fact, interpretation, and bias.", "Give sophisticated examples."],
      ["How does framing influence public opinion?", "Why do audiences accept certain narratives?", "How can critical literacy help?"]
    ),
    lesson4: createLesson(
      "C1",
      4,
      "Economic Inequality",
      "Critically discuss long-term effects of inequality.",
      ["Discuss social mobility and opportunity.", "Use cause-and-consequence logic."],
      ["What structural factors sustain inequality?", "How does it affect social cohesion?", "What policy response is most effective?"]
    ),
    lesson5: createLesson(
      "C1",
      5,
      "Leadership Under Crisis",
      "Evaluate what distinguishes effective leadership in crisis.",
      ["Address ethics, communication, and decision speed.", "Support with case-style reasoning."],
      ["What leadership trait matters most in crisis?", "How should leaders communicate uncertainty?", "How can trust be maintained?"]
    ),
    lesson6: createLesson(
      "C1",
      6,
      "The Future of Education",
      "Propose a high-level vision for education in 2040.",
      ["Integrate technology, equity, and human skills.", "Conclude with strategic priorities."],
      ["What core skill set should schools prioritize?", "How should technology be integrated responsibly?", "What makes your model sustainable?"]
    ),
  },
};

export const SPEAKING_LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1"];

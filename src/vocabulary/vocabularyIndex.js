const VOCABULARY_INDEX = {
  A1: [
    {
      id: 1,
      title: "Everyday Objects",
      description: "Common objects used in daily life"
    },
    {
      id: 2,
      title: "Daily Actions",
      description: "Common actions you do every day"
    },
    {
      id: 3,
      title: "Places & Directions",
      description: "Common places and simple directions"
    },
    {
      id: 4,
      title: "People & Descriptions",
      description: "Basic words to describe people and things"
    }
  ],

  A2: [
    {
      id: 1,
      title: "Home & Daily Objects",
      description: "Rooms, furniture, and objects at home"
    },
    {
      id: 2,
      title: "Food",
      description: "Common food items and meals"
    },
    {
      id: 3,
      title: "Drinks & Ordering",
      description: "Drinks and ordering politely"
    },
    {
      id: 4,
      title: "Hobbies & Leisure Time",
      description: "Free-time activities and hobbies"
    }
  ],

  B1: [
    {
      id: 1,
      title: "Travel & Transport",
      description: "Travel situations and transportation"
    },
    {
      id: 2,
      title: "Around Town & Directions",
      description: "Places around town and giving directions"
    },
    {
      id: 3,
      title: "Describing People (Appearance)",
      description: "Talking about height, hair, and appearance"
    },
    {
      id: 4,
      title: "Describing People (Character)",
      description: "Talking about personality and character"
    }
  ],

  B2: [
    {
      id: 1,
      title: "Health & Illness",
      description: "Health problems, symptoms, and advice"
    },
    {
      id: 2,
      title: "Work & Daily Responsibilities",
      description: "Work, responsibilities, and daily duties"
    },
    {
      id: 3,
      title: "Travel Problems & Solutions",
      description: "Travel issues and how to solve them"
    },
    {
      id: 4,
      title: "Opinions & Decisions",
      description: "Expressing opinions and making decisions"
    }
  ],

  C1: [
    {
      id: 1,
      title: "Abstract Ideas & Concepts",
      description: "Advanced abstract ideas and concepts"
    },
    {
      id: 2,
      title: "Social Issues & Society",
      description: "Social issues, inequality, and society"
    },
    {
      id: 3,
      title: "Technology & Its Impact",
      description: "Technology and its impact on society"
    },
    {
      id: 4,
      title: "Media, Information & Critical Thinking",
      description: "Media, information, bias, and critical thinking"
    }
  ]
};

export default VOCABULARY_INDEX;
/* ======================
   Unit Loaders (Production Safe)
   DO NOT TOUCH VOCABULARY_INDEX ABOVE
====================== */

export const UNIT_LOADERS = {
  A1: {
    1: () => import("./A1/unit1/content.js"),
    2: () => import("./A1/unit2/content.js"),
    3: () => import("./A1/unit3/content.js"),
    4: () => import("./A1/unit4/content.js"),
  },

  A2: {
    1: () => import("./A2/unit1/content.js"),
    2: () => import("./A2/unit2/content.js"),
    3: () => import("./A2/unit3/content.js"),
    4: () => import("./A2/unit4/content.js"),
  },

  B1: {
    1: () => import("./B1/unit1/content.js"),
    2: () => import("./B1/unit2/content.js"),
    3: () => import("./B1/unit3/content.js"),
    4: () => import("./B1/unit4/content.js"),
  },

  B2: {
    1: () => import("./B2/unit1/content.js"),
    2: () => import("./B2/unit2/content.js"),
    3: () => import("./B2/unit3/content.js"),
    4: () => import("./B2/unit4/content.js"),
  },

  C1: {
    1: () => import("./C1/unit1/content.js"),
    2: () => import("./C1/unit2/content.js"),
    3: () => import("./C1/unit3/content.js"),
    4: () => import("./C1/unit4/content.js"),
  },
};

export const QUESTION_LOADERS = {
  A1: {
    1: () => import("./A1/unit1/questions.js"),
    2: () => import("./A1/unit2/questions.js"),
    3: () => import("./A1/unit3/questions.js"),
    4: () => import("./A1/unit4/questions.js"),
  },

  A2: {
    1: () => import("./A2/unit1/questions.js"),
    2: () => import("./A2/unit2/questions.js"),
    3: () => import("./A2/unit3/questions.js"),
    4: () => import("./A2/unit4/questions.js"),
  },

  B1: {
    1: () => import("./B1/unit1/questions.js"),
    2: () => import("./B1/unit2/questions.js"),
    3: () => import("./B1/unit3/questions.js"),
    4: () => import("./B1/unit4/questions.js"),
  },

  B2: {
    1: () => import("./B2/unit1/questions.js"),
    2: () => import("./B2/unit2/questions.js"),
    3: () => import("./B2/unit3/questions.js"),
    4: () => import("./B2/unit4/questions.js"),
  },

  C1: {
    1: () => import("./C1/unit1/questions.js"),
    2: () => import("./C1/unit2/questions.js"),
    3: () => import("./C1/unit3/questions.js"),
    4: () => import("./C1/unit4/questions.js"),
  },
};

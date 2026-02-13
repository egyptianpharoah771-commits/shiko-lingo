/* =========================
   Smart Assessment Evaluation
   ========================= */

/**
 * answers: Array of objects:
 * {
 *   correct: boolean,
 *   level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
 *   type: "grammar" | "vocabulary"
 * }
 */

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function evaluateAssessment(answers) {
  if (!answers || answers.length === 0) {
    return null;
  }

  const summary = {
    total: answers.length,
    correct: 0,
    grammar: { total: 0, correct: 0 },
    vocabulary: { total: 0, correct: 0 },
    levelStats: {},
  };

  // init level stats
  LEVEL_ORDER.forEach((lvl) => {
    summary.levelStats[lvl] = { total: 0, correct: 0 };
  });

  // aggregate data
  answers.forEach((a) => {
    summary.total++;
    if (a.correct) summary.correct++;

    summary.levelStats[a.level].total++;
    if (a.correct) summary.levelStats[a.level].correct++;

    summary[a.type].total++;
    if (a.correct) summary[a.type].correct++;
  });

  const accuracy = Math.round(
    (summary.correct / summary.total) * 100
  );

  const grammarAccuracy = percent(
    summary.grammar.correct,
    summary.grammar.total
  );

  const vocabAccuracy = percent(
    summary.vocabulary.correct,
    summary.vocabulary.total
  );

  const strongestSkill =
    grammarAccuracy > vocabAccuracy
      ? "grammar"
      : vocabAccuracy > grammarAccuracy
      ? "vocabulary"
      : "balanced";

  const weakestSkill =
    grammarAccuracy < vocabAccuracy
      ? "grammar"
      : vocabAccuracy < grammarAccuracy
      ? "vocabulary"
      : "balanced";

  const ceilingLevel = detectCeiling(summary.levelStats);

  return {
    accuracy,
    grammarAccuracy,
    vocabAccuracy,
    strongestSkill,
    weakestSkill,
    ceilingLevel,
    feedback: buildFeedback({
      accuracy,
      grammarAccuracy,
      vocabAccuracy,
      strongestSkill,
      weakestSkill,
      ceilingLevel,
    }),
  };
}

/* =========================
   Helpers
   ========================= */

function percent(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

function detectCeiling(levelStats) {
  // أعلى مستوى كانت الدقة فيه ≥ 60%
  for (let i = LEVEL_ORDER.length - 1; i >= 0; i--) {
    const lvl = LEVEL_ORDER[i];
    const stat = levelStats[lvl];

    if (
      stat.total >= 2 &&
      percent(stat.correct, stat.total) >= 60
    ) {
      return lvl;
    }
  }
  return "A1";
}

function buildFeedback({
  accuracy,
  grammarAccuracy,
  vocabAccuracy,
  strongestSkill,
  weakestSkill,
  ceilingLevel,
}) {
  const feedback = [];

  // Overall
  if (accuracy >= 80) {
    feedback.push(
      "أداؤك العام قوي جدًا وبيوضح تحكم كويس في اللغة."
    );
  } else if (accuracy >= 60) {
    feedback.push(
      "أداؤك العام جيد، وفيه أساس واضح تقدر تطوّره بسرعة."
    );
  } else {
    feedback.push(
      "فيه تحديات واضحة، لكن ده طبيعي جدًا في مرحلة التعلم."
    );
  }

  // Skills
  if (strongestSkill === "grammar") {
    feedback.push(
      "قوتك الأساسية واضحة في القواعد (Grammar)."
    );
  } else if (strongestSkill === "vocabulary") {
    feedback.push(
      "مفرداتك (Vocabulary) أقوى من القواعد."
    );
  } else {
    feedback.push(
      "أداؤك متوازن بين القواعد والمفردات."
    );
  }

  if (weakestSkill !== "balanced") {
    feedback.push(
      weakestSkill === "grammar"
        ? "محتاج تركز أكتر على القواعد علشان تثبّت المستوى."
        : "محتاج توسّع حصيلتك اللغوية شوية."
    );
  }

  // Ceiling
  feedback.push(
    `مستوى الأداء المستقر عندك حوالين ${ceilingLevel}.`
  );

  return feedback;
}

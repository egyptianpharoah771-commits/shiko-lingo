import { getUserProgress } from "../adapters/progressAdapter";

/*
  Continue Learning Engine
  Priority: last used skill
*/

function getLastSkill() {
  try {
    return localStorage.getItem("LAST_SKILL_USED");
  } catch {
    return null;
  }
}

function setLastSkill(skill) {
  try {
    localStorage.setItem("LAST_SKILL_USED", skill);
  } catch {}
}

export function trackSkillUsage(skill) {
  setLastSkill(skill);
}

function nextGrammar(progress) {
  const units = progress.skills?.grammar || [];
  const next = units.length + 1;
  return `/grammar/A1/${next}`;
}

function nextReading(progress) {
  const lessons = progress.skills?.reading || [];
  const next = lessons.length + 1;
  return `/reading/A1/lesson${next}`;
}

function nextListening(progress) {
  const lessons = progress.skills?.listening || [];
  const next = lessons.length + 1;
  return `/listening/A1/${next}`;
}

function nextVocabulary(progress) {
  const units = progress.skills?.vocabulary || [];
  const next = units.length + 1;
  return `/vocabulary/A1/${next}`;
}

export function getContinueLesson() {
  const progress = getUserProgress();
  const lastSkill = getLastSkill();

  if (lastSkill === "reading") {
    return {
      label: "Continue Reading",
      link: nextReading(progress),
    };
  }

  if (lastSkill === "listening") {
    return {
      label: "Continue Listening",
      link: nextListening(progress),
    };
  }

  if (lastSkill === "vocabulary") {
    return {
      label: "Continue Vocabulary",
      link: nextVocabulary(progress),
    };
  }

  if (lastSkill === "grammar") {
    return {
      label: "Continue Grammar",
      link: nextGrammar(progress),
    };
  }

  /* Default recommendation */
  return {
    label: "Continue Grammar",
    link: nextGrammar(progress),
  };
}
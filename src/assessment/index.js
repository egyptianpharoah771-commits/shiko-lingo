/* ======================
   Assessment Module API
====================== */

// Pages
export { default as AssessmentPage } from "./AssessmentPage";

// Hooks
export { default as useAssessment } from "./hooks/useAssessment";

// UI
export { default as AssessmentIntro } from "./ui/AssessmentIntro";
export { default as AssessmentQuestion } from "./ui/AssessmentQuestion";
export { default as AssessmentProgress } from "./ui/AssessmentProgress";
export { default as AssessmentResult } from "./ui/AssessmentResult";

// Logic
export { evaluateAssessment } from "./logic/evaluation";

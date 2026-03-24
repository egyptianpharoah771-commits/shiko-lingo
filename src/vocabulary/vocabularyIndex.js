/* ======================
   IMPORTS (MUST BE AT TOP)
====================== */

/* -------- A1 -------- */
import A1_U1_Content from "./A1/unit1/content";
import A1_U1_Questions from "./A1/unit1/questions";
import A1_U2_Content from "./A1/unit2/content";
import A1_U2_Questions from "./A1/unit2/questions";
import A1_U3_Content from "./A1/unit3/content";
import A1_U3_Questions from "./A1/unit3/questions";
import A1_U4_Content from "./A1/unit4/content";
import A1_U4_Questions from "./A1/unit4/questions";

/* -------- A2 -------- */
import A2_U1_Content from "./A2/unit1/content";
import A2_U1_Questions from "./A2/unit1/questions";
import A2_U2_Content from "./A2/unit2/content";
import A2_U2_Questions from "./A2/unit2/questions";
import A2_U3_Content from "./A2/unit3/content";
import A2_U3_Questions from "./A2/unit3/questions";
import A2_U4_Content from "./A2/unit4/content";
import A2_U4_Questions from "./A2/unit4/questions";

/* -------- B1 -------- */
import B1_U1_Content from "./B1/unit1/content";
import B1_U1_Questions from "./B1/unit1/questions";
import B1_U2_Content from "./B1/unit2/content";
import B1_U2_Questions from "./B1/unit2/questions";
import B1_U3_Content from "./B1/unit3/content";
import B1_U3_Questions from "./B1/unit3/questions";
import B1_U4_Content from "./B1/unit4/content";
import B1_U4_Questions from "./B1/unit4/questions";

/* -------- B2 -------- */
import B2_U1_Content from "./B2/unit1/content";
import B2_U1_Questions from "./B2/unit1/questions";
import B2_U2_Content from "./B2/unit2/content";
import B2_U2_Questions from "./B2/unit2/questions";
import B2_U3_Content from "./B2/unit3/content";
import B2_U3_Questions from "./B2/unit3/questions";
import B2_U4_Content from "./B2/unit4/content";
import B2_U4_Questions from "./B2/unit4/questions";

/* -------- C1 -------- */
import C1_U1_Content from "./C1/unit1/content";
import C1_U1_Questions from "./C1/unit1/questions";
import C1_U2_Content from "./C1/unit2/content";
import C1_U2_Questions from "./C1/unit2/questions";
import C1_U3_Content from "./C1/unit3/content";
import C1_U3_Questions from "./C1/unit3/questions";
import C1_U4_Content from "./C1/unit4/content";
import C1_U4_Questions from "./C1/unit4/questions";

/* ======================
   Vocabulary Index (METADATA ONLY)
   ⚠️ No audio logic here
   Audio paths live INSIDE content files
====================== */

const VOCABULARY_INDEX = Object.freeze({
  A1: [
    { id: 1, title: "Everyday Objects", description: "Common objects used in daily life" },
    { id: 2, title: "Daily Actions", description: "Common actions you do every day" },
    { id: 3, title: "Places & Directions", description: "Common places and simple directions" },
    { id: 4, title: "People & Descriptions", description: "Basic words to describe people and things" },
  ],
  A2: [
    { id: 1, title: "Home & Daily Objects", description: "Rooms, furniture, and objects at home" },
    { id: 2, title: "Food", description: "Common food items and meals" },
    { id: 3, title: "Drinks & Ordering", description: "Drinks and ordering politely" },
    { id: 4, title: "Hobbies & Leisure Time", description: "Free-time activities and hobbies" },
  ],
  B1: [
    { id: 1, title: "Travel & Transport", description: "Travel situations and transportation" },
    { id: 2, title: "Around Town & Directions", description: "Places around town and giving directions" },
    { id: 3, title: "Describing People (Appearance)", description: "Talking about height, hair, and appearance" },
    { id: 4, title: "Describing People (Character)", description: "Talking about personality and character" },
  ],
  B2: [
    { id: 1, title: "Health & Illness", description: "Health problems, symptoms, and advice" },
    { id: 2, title: "Work & Daily Responsibilities", description: "Work, responsibilities, and daily duties" },
    { id: 3, title: "Travel Problems & Solutions", description: "Travel issues and how to solve them" },
    { id: 4, title: "Opinions & Decisions", description: "Expressing opinions and making decisions" },
  ],
  C1: [
    { id: 1, title: "Abstract Ideas & Concepts", description: "Advanced abstract ideas and concepts" },
    { id: 2, title: "Social Issues & Society", description: "Social issues, inequality, and society" },
    { id: 3, title: "Technology & Its Impact", description: "Technology and its impact on society" },
    { id: 4, title: "Media & Critical Thinking", description: "Media, information, bias, and critical thinking" },
  ],
});

export default VOCABULARY_INDEX;

/* ======================
   Vocabulary Data (SOURCE OF TRUTH)
   ✅ content.items[] MUST include `audio`
====================== */

export const VOCABULARY_DATA = Object.freeze({
  A1: {
    unit1: { id: 1, level: "A1", content: A1_U1_Content, questions: A1_U1_Questions },
    unit2: { id: 2, level: "A1", content: A1_U2_Content, questions: A1_U2_Questions },
    unit3: { id: 3, level: "A1", content: A1_U3_Content, questions: A1_U3_Questions },
    unit4: { id: 4, level: "A1", content: A1_U4_Content, questions: A1_U4_Questions },
  },
  A2: {
    unit1: { id: 1, level: "A2", content: A2_U1_Content, questions: A2_U1_Questions },
    unit2: { id: 2, level: "A2", content: A2_U2_Content, questions: A2_U2_Questions },
    unit3: { id: 3, level: "A2", content: A2_U3_Content, questions: A2_U3_Questions },
    unit4: { id: 4, level: "A2", content: A2_U4_Content, questions: A2_U4_Questions },
  },
  B1: {
    unit1: { id: 1, level: "B1", content: B1_U1_Content, questions: B1_U1_Questions },
    unit2: { id: 2, level: "B1", content: B1_U2_Content, questions: B1_U2_Questions },
    unit3: { id: 3, level: "B1", content: B1_U3_Content, questions: B1_U3_Questions },
    unit4: { id: 4, level: "B1", content: B1_U4_Content, questions: B1_U4_Questions },
  },
  B2: {
    unit1: { id: 1, level: "B2", content: B2_U1_Content, questions: B2_U1_Questions },
    unit2: { id: 2, level: "B2", content: B2_U2_Content, questions: B2_U2_Questions },
    unit3: { id: 3, level: "B2", content: B2_U3_Content, questions: B2_U3_Questions },
    unit4: { id: 4, level: "B2", content: B2_U4_Content, questions: B2_U4_Questions },
  },
  C1: {
    unit1: { id: 1, level: "C1", content: C1_U1_Content, questions: C1_U1_Questions },
    unit2: { id: 2, level: "C1", content: C1_U2_Content, questions: C1_U2_Questions },
    unit3: { id: 3, level: "C1", content: C1_U3_Content, questions: C1_U3_Questions },
    unit4: { id: 4, level: "C1", content: C1_U4_Content, questions: C1_U4_Questions },
  },
});

export const levels = ["A1", "A2", "B1", "B2"] as const;
export type Level = (typeof levels)[number];
export const categories = [
  "Vocabulary",
  "Grammar",
  "Choose the Correct Answer",
  "Fill in the Blanks",
  "Correct the Mistake",
] as const;
export type Category = (typeof categories)[number];
export type Skill = "Vocabulary" | "Grammar" | "Speaking" | "Writing";
export type Question = {
  id: string;
  level: Level;
  category: Category;
  skill: Skill;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
};
export type PublicQuestion = Omit<Question, "answer" | "explanation">;
export type Answer = { questionId: string; answer: string };
export type AssessmentType = "before" | "after";
export type SkillResult = { skill: Skill; before: number; after: number };
export type ResearchSummary = {
  pairs: number;
  before: number | null;
  after: number | null;
  difference: number | null;
  skills: SkillResult[];
  browsers: number;
  practiceSessions: number;
  questionsAnswered: number;
  averagePractice: number | null;
  aiSessions: number;
  mostPracticed: string | null;
  visits: number;
};
export type AssessmentResult = {
  assessment_type: AssessmentType;
  total_score: number;
  vocabulary_score: number;
  grammar_score: number;
  speaking_score: number;
  writing_score: number;
};

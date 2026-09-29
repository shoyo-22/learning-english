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
export type AdminScore = {
  total: number;
  vocabulary: number;
  grammar: number;
  speaking: number;
  writing: number;
  at: string;
};
export type AdminParticipant = {
  shortId: string;
  name: string | null;
  before: AdminScore | null;
  after: AdminScore | null;
  difference: number | null;
  lastActivityAt: string;
};
export type AdminPractice = {
  shortId: string;
  name: string | null;
  level: Level;
  category: string;
  correct: number;
  total: number;
  percentage: number;
  completedAt: string;
};
export type AdminResults = {
  summary: {
    participants: number;
    named: number;
    pairs: number;
    before: number | null;
    after: number | null;
    difference: number | null;
    practiceSessions: number;
  };
  participants: AdminParticipant[];
  practice: AdminPractice[];
  truncated: { participants: boolean; practice: boolean };
};

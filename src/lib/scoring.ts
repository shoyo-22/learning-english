import type { Answer, Question, Skill } from "./types";
export function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");
}
export function scoreAnswers(bank: Question[], answers: Answer[]) {
  if (
    answers.length !== bank.length ||
    new Set(answers.map((a) => a.questionId)).size !== bank.length
  )
    throw new Error("Answer every question exactly once.");
  const validIds = new Set(bank.map((q) => q.id));
  if (answers.some((a) => !validIds.has(a.questionId)))
    throw new Error("Unknown question.");
  const results = bank.map((q) => ({
    questionId: q.id,
    skill: q.skill,
    correct:
      normalizeAnswer(answers.find((a) => a.questionId === q.id)!.answer) ===
      normalizeAnswer(q.answer),
    answer: q.answer,
    explanation: q.explanation,
  }));
  const correct = results.filter((r) => r.correct).length;
  const skills = Object.fromEntries(
    (["Vocabulary", "Grammar", "Speaking", "Writing"] as Skill[]).map(
      (skill) => {
        const items = results.filter((r) => r.skill === skill);
        return [
          skill,
          items.length
            ? Math.round(
                (items.filter((r) => r.correct).length / items.length) * 100,
              )
            : 0,
        ];
      },
    ),
  ) as Record<Skill, number>;
  return {
    correct,
    total: bank.length,
    percentage: Math.round((correct / bank.length) * 10000) / 100,
    results,
    skills,
  };
}
export function pairedDifference(before: number, after: number) {
  return Math.round((after - before) * 10) / 10;
}

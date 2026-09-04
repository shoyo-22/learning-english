import { questions } from "@/data/questions";
import {
  body,
  session,
  limit,
  json,
  failure,
  db,
  ensureSession,
  ApiError,
  event,
} from "@/lib/server";
import { practiceSchema } from "@/lib/validation";
import { normalizeAnswer, scoreAnswers } from "@/lib/scoring";
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const bank = questions.filter(
    (q) =>
      (!params.get("level") || q.level === params.get("level")) &&
      (!params.get("category") ||
        params.get("category") === "All categories" ||
        q.category === params.get("category")),
  );
  return json({
    questions: bank.map((q) => ({
      id: q.id,
      level: q.level,
      category: q.category,
      skill: q.skill,
      question: q.question,
      options: q.options,
    })),
  });
}
export async function POST(request: Request) {
  try {
    const data = await body(request, practiceSchema);
    const id = await session();
    limit(`practice:${id}`, 80);
    if (data.action === "check") {
      const q = questions.find((q) => q.id === data.questionId);
      if (!q) throw new ApiError(400, "That question is not available.");
      await event(id, "question_answered", q.id).catch(() => {});
      return json({
        correct: normalizeAnswer(data.answer) === normalizeAnswer(q.answer),
        answer: q.answer,
        explanation: q.explanation,
      });
    }
    const bank = questions.filter(
      (q) =>
        q.level === data.level &&
        (data.category === "All categories" || q.category === data.category),
    );
    let score;
    try {
      score = scoreAnswers(bank, data.answers);
    } catch {
      throw new ApiError(
        400,
        "Please answer each question in this practice set once.",
      );
    }
    await ensureSession(id);
    const { error } = await db().rpc("save_quiz", {
      p_run: data.runId,
      p_session: id,
      p_level: data.level,
      p_category: data.category,
      p_total: score.total,
      p_correct: score.correct,
      p_score: score.percentage,
      p_attempts: score.results.map((r) => ({
        question_id: r.questionId,
        is_correct: r.correct,
        category: bank.find((q) => q.id === r.questionId)!.category,
      })),
    });
    if (error)
      throw new ApiError(
        503,
        "Your practice result could not be saved. Please retry.",
      );
    return json({
      saved: true,
      correct: score.correct,
      total: score.total,
      percentage: score.percentage,
    });
  } catch (e) {
    return failure(e);
  }
}

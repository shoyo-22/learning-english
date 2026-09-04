import { assessmentQuestions, assessmentVersion } from "@/data/assessments";
import { scoreAnswers } from "@/lib/scoring";
import { assessmentSchema } from "@/lib/validation";
import {
  body,
  session,
  limit,
  ensureSession,
  db,
  json,
  failure,
  ApiError,
} from "@/lib/server";
export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  if (type !== "before" && type !== "after")
    return failure(new ApiError(400, "Choose Before or After."));
  return json({
    questions: assessmentQuestions(type).map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      skill: q.skill,
      level: q.level,
      category: q.category,
    })),
  });
}
export async function POST(request: Request) {
  try {
    const data = await body(request, assessmentSchema);
    const id = await session();
    limit(`assessment:${id}`, 12);
    let score;
    try {
      score = scoreAnswers(assessmentQuestions(data.type), data.answers);
    } catch {
      throw new ApiError(400, "Answer every assessment question exactly once.");
    }
    await ensureSession(id);
    const { data: result, error } = await db().rpc("save_assessment", {
      p_session: id,
      p_type: data.type,
      p_version: assessmentVersion,
      p_vocabulary: score.skills.Vocabulary,
      p_grammar: score.skills.Grammar,
      p_speaking: score.skills.Speaking,
      p_writing: score.skills.Writing,
      p_total: score.percentage,
    });
    if (error) {
      if (error.message.includes("before_required"))
        throw new ApiError(
          409,
          "Complete and save your Before assessment first.",
        );
      if (error.message.includes("practice_required"))
        throw new ApiError(
          409,
          "Complete a practice session or use the AI assistant after your Before test.",
        );
      throw new ApiError(
        503,
        "Your assessment could not be saved. Your answers are still here; please retry.",
      );
    }
    return json({ saved: true, result });
  } catch (e) {
    return failure(e);
  }
}

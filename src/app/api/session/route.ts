import {
  session,
  ensureSession,
  dbConfigured,
  db,
  json,
  failure,
} from "@/lib/server";
import { assessmentVersion } from "@/data/assessments";
export async function GET() {
  try {
    const id = await session();
    if (!dbConfigured())
      return json({
        storage: false,
        assessments: [],
        practice: [],
        canTakeAfter: false,
      });
    await ensureSession(id);
    const { data, error } = await db()
      .from("assessments")
      .select(
        "assessment_type,total_score,vocabulary_score,grammar_score,speaking_score,writing_score,created_at",
      )
      .eq("session_id", id)
      .eq("version", assessmentVersion);
    if (error) throw error;
    const before = data.find((a) => a.assessment_type === "before");
    let canTakeAfter = false;
    if (before) {
      const [{ count: practice }, { count: ai }] = await Promise.all([
        db()
          .from("quiz_sessions")
          .select("id", { head: true, count: "exact" })
          .eq("session_id", id)
          .gt("completed_at", before.created_at),
        db()
          .from("ai_usage")
          .select("id", { head: true, count: "exact" })
          .eq("session_id", id)
          .gt("created_at", before.created_at),
      ]);
      canTakeAfter = Boolean((practice || 0) + (ai || 0));
    }
    const { data: practice, error: practiceError } = await db()
      .from("quiz_sessions")
      .select(
        "id,level,category,correct_answers,total_questions,score_percentage,completed_at",
      )
      .eq("session_id", id)
      .order("completed_at", { ascending: false })
      .limit(5);
    if (practiceError) throw practiceError;
    return json({ storage: true, assessments: data, practice, canTakeAfter });
  } catch (e) {
    return failure(e);
  }
}

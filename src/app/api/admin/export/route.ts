import { getAdminResults, requireAdmin } from "@/lib/admin";
import { resultsCsv } from "@/lib/csv";
import { ApiError, failure } from "@/lib/server";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const kind = new URL(request.url).searchParams.get("kind");
    if (kind !== "assessments" && kind !== "practice")
      throw new ApiError(400, "Choose assessments or practice for export.");
    const data = await getAdminResults(true);
    if (data.truncated[kind === "assessments" ? "participants" : "practice"])
      throw new ApiError(
        413,
        "Too many records to export. Export the table from the Supabase dashboard.",
      );
    return new Response(resultsCsv(data, kind), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="english-lab-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return failure(error);
  }
}

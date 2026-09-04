import { db, json, failure } from "@/lib/server";
export async function GET() {
  try {
    const { data, error } = await db().rpc("research_summary");
    if (error) throw error;
    return json({ summary: data, source: "live" });
  } catch (e) {
    return failure(e);
  }
}

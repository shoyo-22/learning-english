import { getAdminResults, requireAdmin } from "@/lib/admin";
import { failure, json } from "@/lib/server";

export async function GET() {
  try {
    await requireAdmin();
    return json(await getAdminResults());
  } catch (error) {
    return failure(error);
  }
}

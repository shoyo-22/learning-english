import {
  body,
  session,
  limit,
  event,
  json,
  failure,
  dbConfigured,
  ApiError,
} from "@/lib/server";
import { eventSchema } from "@/lib/validation";
export async function POST(request: Request) {
  try {
    const data = await body(request, eventSchema);
    const id = await session();
    limit(`event:${id}`, 60);
    if (!dbConfigured())
      throw new ApiError(503, "Activity storage is unavailable.");
    await event(id, data.name, data.detail);
    return json({ saved: true });
  } catch (e) {
    return failure(e);
  }
}

import { participantSchema } from "@/lib/validation";
import {
  ApiError,
  body,
  db,
  ensureSession,
  failure,
  json,
  limit,
  session,
} from "@/lib/server";
import { storageError } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const { name } = await body(
      request,
      participantSchema,
      "Enter a name or code between 2 and 40 characters.",
    );
    const id = await session();
    limit(`participant:${id}`, 20);
    await ensureSession(id);
    const { data, error } = await db().rpc("set_participant_name", {
      p_session: id,
      p_name: name,
    });
    if (error) {
      if (error.message.includes("invalid_name"))
        throw new ApiError(
          400,
          "Enter a name or code between 2 and 40 characters.",
        );
      throw storageError(error);
    }
    return json({ name: data });
  } catch (error) {
    return failure(error);
  }
}

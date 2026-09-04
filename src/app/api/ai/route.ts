import { aiSchema } from "@/lib/validation";
import { demoTutor } from "@/lib/demo-tutor";
import { body, session, limit, json, failure } from "@/lib/server";
export async function POST(request: Request) {
  try {
    const data = await body(request, aiSchema);
    const id = await session();
    limit(`demo-tutor:${id}`, 30);
    // Scripted responses never call an AI provider or write to real AI usage.
    return json({
      message: demoTutor(data.messages),
      mode: "demo",
      tracked: false,
    });
  } catch (error) {
    return failure(error);
  }
}

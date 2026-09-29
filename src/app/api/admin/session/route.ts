import { adminConfigured, setAdminCookie } from "@/lib/admin";
import { passwordMatches } from "@/lib/admin-auth";
import { adminLoginSchema } from "@/lib/validation";
import {
  ApiError,
  assertSameOrigin,
  body,
  failure,
  json,
  limit,
} from "@/lib/server";

export async function POST(request: Request) {
  try {
    const { password } = await body(request, adminLoginSchema);
    if (!adminConfigured())
      throw new ApiError(503, "The administrator panel is not configured.");
    limit("admin-login:global", 20);
    limit(
      `admin-login:client:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"}`,
      5,
    );
    if (!passwordMatches(password, process.env.ADMIN_PASSWORD!))
      throw new ApiError(401, "Incorrect password.");
    await setAdminCookie(true);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    await setAdminCookie(false);
    return json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function dbConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("sb_publishable_") &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32,
  );
}
export function db() {
  if (!dbConfigured())
    throw new ApiError(
      503,
      "Research storage is unavailable. Your result has not been saved. Please try again later.",
    );
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (url, init) =>
          fetch(url, { ...init, signal: AbortSignal.timeout(10000) }),
      },
    },
  );
}
const fallbackSecret = randomBytes(32).toString("hex");
function sign(id: string) {
  return createHmac("sha256", process.env.SESSION_SECRET || fallbackSecret)
    .update(id)
    .digest("hex");
}
export async function session() {
  const jar = await cookies();
  const token = jar.get("english_lab_session")?.value;
  let id: string | undefined;
  if (token) {
    const [candidate, signature] = token.split(".");
    if (
      z.uuid().safeParse(candidate).success &&
      signature?.length === 64 &&
      /^[a-f0-9]+$/.test(signature)
    ) {
      if (
        timingSafeEqual(
          Buffer.from(signature, "hex"),
          Buffer.from(sign(candidate), "hex"),
        )
      )
        id = candidate;
    }
  }
  if (!id) {
    id = randomUUID();
    jar.set("english_lab_session", `${id}.${sign(id)}`, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  return id;
}
export async function ensureSession(id: string) {
  const { error } = await db()
    .from("anonymous_sessions")
    .upsert(
      { session_id: id, last_seen_at: new Date().toISOString() },
      { onConflict: "session_id" },
    );
  if (error)
    throw new ApiError(
      503,
      "Research storage is temporarily unavailable. Please try again.",
    );
}
export async function body<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const origin = request.headers.get("origin");
  const matchesOrigin =
    !origin ||
    (process.env.APP_URL
      ? origin === new URL(process.env.APP_URL).origin
      : new URL(origin).host === request.headers.get("host"));
  if (!matchesOrigin) throw new ApiError(403, "This request is not allowed.");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(415, "Please send a JSON request.");
  if (Number(request.headers.get("content-length") || 0) > 24000)
    throw new ApiError(413, "This request is too large.");
  // Bound streamed bodies too, including requests without Content-Length.
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "The request is empty.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 24000) {
      await reader.cancel();
      throw new ApiError(413, "This request is too large.");
    }
    chunks.push(value);
  }
  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "The request could not be read.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    throw new ApiError(400, "Please check your answers and try again.");
  return parsed.data;
}
const windows = new Map<string, { count: number; until: number }>();
export function limit(key: string, max = 60, ms = 60000) {
  const now = Date.now();
  if (windows.size > 5000) {
    for (const [k, v] of windows) if (v.until < now) windows.delete(k);
    if (windows.size > 5000)
      throw new ApiError(429, "The service is busy. Please try again shortly.");
  }
  let item = windows.get(key);
  if (!item || item.until < now) {
    item = { count: 0, until: now + ms };
    windows.set(key, item);
  }
  item.count++;
  if (item.count > max)
    throw new ApiError(
      429,
      "You have reached the request limit. Please take a short break and try again.",
    );
}
export function failure(error: unknown) {
  const known = error instanceof ApiError;
  return Response.json(
    {
      error: known
        ? error.message
        : "The service is temporarily unavailable. Please try again.",
    },
    {
      status: known ? error.status : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
export function json(data: unknown) {
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
export async function event(id: string, name: string, detail?: string) {
  if (!dbConfigured()) return;
  await ensureSession(id);
  const { error } = await db()
    .from("activity_events")
    .insert({ session_id: id, name, detail: detail || null });
  if (error) throw new ApiError(503, "Activity could not be saved.");
}

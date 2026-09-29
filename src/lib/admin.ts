import "server-only";
import { cookies } from "next/headers";
import { ApiError, db, dbConfigured } from "./server";
import { signAdminToken, verifyAdminToken } from "./admin-auth";
import { assessmentVersion } from "@/data/assessments";
import type { AdminResults } from "./types";

const cookieName = "english_lab_admin";
const lifetime = 8 * 60 * 60;
export function adminConfigured() {
  return dbConfigured() && (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12;
}
export async function isAdmin() {
  return (
    adminConfigured() &&
    verifyAdminToken(
      (await cookies()).get(cookieName)?.value,
      process.env.SESSION_SECRET!,
      process.env.ADMIN_PASSWORD!,
    )
  );
}
export async function requireAdmin() {
  if (!adminConfigured())
    throw new ApiError(503, "The administrator panel is not configured.");
  if (!(await isAdmin()))
    throw new ApiError(401, "Sign in to view student results.");
}
export async function setAdminCookie(signedIn: boolean) {
  (await cookies()).set(
    cookieName,
    signedIn
      ? signAdminToken(
          process.env.SESSION_SECRET!,
          process.env.ADMIN_PASSWORD!,
          Date.now() + lifetime * 1000,
        )
      : "",
    {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: signedIn ? lifetime : 0,
    },
  );
}
export function storageError(error: { code?: string }) {
  return new ApiError(
    503,
    ["PGRST202", "PGRST204", "42703", "42883"].includes(error.code || "")
      ? "Update the database schema: apply the latest migration."
      : "Research storage is temporarily unavailable. Please try again.",
  );
}
export async function getAdminResults(
  exporting = false,
): Promise<AdminResults> {
  const { data, error } = await db().rpc("admin_results", {
    p_version: assessmentVersion,
    ...(exporting
      ? { p_participant_limit: 5000, p_practice_limit: 20000 }
      : {}),
  });
  if (error) throw storageError(error);
  if (!data)
    throw new ApiError(
      503,
      "Research storage is temporarily unavailable. Please try again.",
    );
  return data as AdminResults;
}

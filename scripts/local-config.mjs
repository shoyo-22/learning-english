import { readFile, lstat, writeFile, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { parseEnv } from "node:util";

export const marker =
  "# English Lab local setup — managed by scripts/local-setup.mjs";
export const demoSecret = "english-lab-local-demo-only-2026-not-for-deployment";

export async function readManagedConfig(directory) {
  const path = join(directory, ".env.local");
  let original;
  try {
    const info = await lstat(path);
    if (!info.isFile() || info.isSymbolicLink())
      throw new Error(".env.local must be a regular file.");
    original = await readFile(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { original: null, values: {} };
    throw error;
  }
  const values = parseEnv(original);
  const localUrl = values.SUPABASE_URL;
  if (
    !original.startsWith(marker) ||
    (localUrl && localUrl !== "http://127.0.0.1:54321") ||
    (!localUrl && values.SUPABASE_SERVICE_ROLE_KEY) ||
    values.APP_URL
  ) {
    throw new Error(
      "Existing .env.local was preserved. Use a separate project copy for this local sandbox; see docs/INSTALLATION.ru.md.",
    );
  }
  if (values.SESSION_SECRET && values.SESSION_SECRET.length < 32)
    throw new Error(
      "Existing SESSION_SECRET is too short. Fix it manually before setup; it has not been changed.",
    );
  return { original, values };
}

export function configValues(mode, status, existing = {}) {
  if (mode !== "demo" && mode !== "local")
    throw new Error("Choose demo or local setup.");
  let url = "";
  let key = "";
  if (mode === "local") {
    url = status?.API_URL;
    key = status?.SECRET_KEY || status?.SERVICE_ROLE_KEY;
    if (
      url !== "http://127.0.0.1:54321" ||
      typeof key !== "string" ||
      !(key.startsWith("sb_secret_") || key.split(".").length === 3) ||
      /[\r\n$]/.test(key)
    ) {
      throw new Error(
        "Local Supabase status did not include the expected loopback API URL and server key. No settings were written.",
      );
    }
  }
  return {
    ...existing,
    SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: key,
    SESSION_SECRET:
      existing.SESSION_SECRET ||
      (mode === "demo" ? demoSecret : randomBytes(32).toString("hex")),
    APP_URL: "",
    ENGLISH_LAB_LOCAL_MODE: mode,
  };
}

export async function writeManagedConfig(directory, mode, status) {
  const { original, values } = await readManagedConfig(directory);
  const next = configValues(mode, status, values);
  const content =
    marker +
    "\n# Local use only. Keep this file private; restart Next.js after changing modes.\n" +
    Object.entries(next)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("\n") +
    "\n";
  const path = join(directory, ".env.local");
  if (original === null) {
    await writeFile(path, content, { flag: "wx", mode: 0o600 });
  } else {
    const current = await readFile(path, "utf8");
    if (current !== original)
      throw new Error(
        ".env.local changed during setup. Please retry; nothing was overwritten.",
      );
    const temporary = join(
      directory,
      `.env.local.${randomBytes(8).toString("hex")}.tmp`,
    );
    try {
      await writeFile(temporary, content, { flag: "wx", mode: 0o600 });
      await rename(temporary, path);
    } finally {
      await unlink(temporary).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  }
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    });
  } catch {
    throw new Error("The connection was interrupted. Please try again.");
  }
  const data = await response.json().catch(() => {
    throw new Error(
      "The service returned an unreadable response. Please try again.",
    );
  });
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
let initialized: Promise<{ storage: boolean } | undefined> | undefined;
export function initSession() {
  if (!initialized)
    initialized = api<{ storage: boolean }>("/api/session").catch(() => {
      initialized = undefined;
      return undefined;
    });
  return initialized;
}
export async function track(name: string, detail?: string): Promise<boolean> {
  try {
    const state = await initSession();
    if (!state?.storage) return false;
    await api("/api/analytics/event", { name, detail });
    return true;
  } catch {
    // Optional analytics must not interrupt learning.
    return false;
  }
}

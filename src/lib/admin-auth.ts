import { createHash, createHmac, timingSafeEqual } from "node:crypto";

function signature(secret: string, password: string, expiresAt: string) {
  const key = createHmac("sha256", secret).update(`admin:${password}`).digest();
  return createHmac("sha256", key).update(expiresAt).digest("hex");
}

export function signAdminToken(
  secret: string,
  password: string,
  expiresAt: number,
) {
  return `${expiresAt}.${signature(secret, password, String(expiresAt))}`;
}

export function verifyAdminToken(
  token: unknown,
  secret: string,
  password: string,
  now = Date.now(),
): boolean {
  if (typeof token !== "string") return false;
  const match = /^(\d{1,16})\.([a-f0-9]{64})$/.exec(token);
  if (
    !match ||
    !Number.isSafeInteger(Number(match[1])) ||
    Number(match[1]) <= now
  )
    return false;
  return timingSafeEqual(
    Buffer.from(match[2], "hex"),
    Buffer.from(signature(secret, password, match[1]), "hex"),
  );
}

export function passwordMatches(input: string, expected: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

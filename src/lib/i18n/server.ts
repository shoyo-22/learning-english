import "server-only";
import { cookies } from "next/headers";
import { localeCookie, parseLocale, translator } from "./core";
export async function getTranslator() {
  const locale = parseLocale((await cookies()).get(localeCookie)?.value);
  return { locale, tr: translator(locale) };
}

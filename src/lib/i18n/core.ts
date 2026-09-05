import messages from "./messages.json";
export const locales = ["en", "ru", "kk"] as const;
export type Locale = (typeof locales)[number];
export const localeNames: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  kk: "Қазақша",
};
export const localeCookie = "english_lab_locale";
export function parseLocale(value: unknown): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : "en";
}
export type MessageValue = string | number | null | undefined;
export function translate<T extends MessageValue>(
  locale: Locale,
  message: T,
  values?: Record<string, string | number>,
): T {
  if (typeof message !== "string") return message;
  const entry = (messages as Record<string, { ru: string; kk: string }>)[
    message
  ];
  const translated = locale === "en" ? message : (entry?.[locale] ?? message);
  return translated.replace(/\{(\w+)\}/g, (token, key: string) =>
    values?.[key] === undefined ? token : String(values[key]),
  ) as T;
}
export function translator(locale: Locale) {
  return <T extends MessageValue>(
    message: T,
    values?: Record<string, string | number>,
  ) => translate(locale, message, values);
}

export function numberFormatter(locale: Locale) {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  return (value: number) => formatter.format(value);
}

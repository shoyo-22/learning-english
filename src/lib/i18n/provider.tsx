"use client";
import {
  createContext,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  localeCookie,
  numberFormatter,
  localeNames,
  locales,
  parseLocale,
  translator,
  type Locale,
} from "./core";
type LocaleContextValue = {
  locale: Locale;
  tr: ReturnType<typeof translator>;
  number: ReturnType<typeof numberFormatter>;
  changeLocale: (locale: Locale) => void;
  pending: boolean;
};
const LocaleContext = createContext<LocaleContextValue | null>(null);
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  function changeLocale(next: Locale) {
    const safe = parseLocale(next);
    document.cookie = `${localeCookie}=${safe}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    document.documentElement.lang = safe;
    setLocale(safe);
    startTransition(() => router.refresh());
  }
  return (
    <LocaleContext.Provider
      value={{
        locale,
        tr: translator(locale),
        number: numberFormatter(locale),
        changeLocale,
        pending,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}
export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("LocaleProvider is required");
  return context;
}
export function LanguageSwitcher() {
  const { locale, tr, changeLocale, pending } = useLocale();
  return (
    <label className="language-switcher">
      <span className="sr-only">{tr("Interface language")}</span>
      <select
        aria-label={tr("Interface language")}
        value={locale}
        disabled={pending}
        onChange={(e) => changeLocale(parseLocale(e.target.value))}
      >
        {locales.map((value) => (
          <option key={value} value={value} lang={value}>
            {localeNames[value]}
          </option>
        ))}
      </select>
    </label>
  );
}

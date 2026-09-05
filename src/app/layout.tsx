import { LocaleProvider } from "@/lib/i18n/provider";
import { getTranslator } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import "./globals.css";
import { Activity } from "@/components/activity";
export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: {
      default: tr("The Importance of ChatGPT in Learning English"),
      template: "%s | English Lab",
    },
    description: tr(
      "An interactive educational research platform exploring how ChatGPT can support English language learning.",
    ),
    openGraph: {
      title: tr("English Lab — Learn English Smarter with ChatGPT"),
      description: tr(
        "Practice your English. Explore AI. Discover what helps you learn.",
      ),
      type: "website",
    },
  };
}
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale, tr } = await getTranslator();
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <LocaleProvider initialLocale={locale}>
          <a className="skip-link" href="#main">
            {tr("Skip to content")}
          </a>
          <Header />
          <Activity />
          <main id="main">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}

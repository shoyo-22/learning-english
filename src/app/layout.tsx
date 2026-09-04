import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import "./globals.css";
import { Activity } from "@/components/activity";
export const metadata: Metadata = {
  title: {
    default: "The Importance of ChatGPT in Learning English",
    template: "%s | English Lab",
  },
  description:
    "An interactive educational research platform exploring how ChatGPT can support English language learning.",
  openGraph: {
    title: "English Lab — Learn English Smarter with ChatGPT",
    description:
      "Practice your English. Explore AI. Discover what helps you learn.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <Activity />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

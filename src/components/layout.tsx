"use client";
import { LanguageSwitcher, useLocale } from "@/lib/i18n/provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X, Sparkles, ArrowUpRight } from "lucide-react";
const links = [
  ["Home", "/"],
  ["Learn", "/learn"],
  ["Practice", "/practice"],
  ["AI Assistant", "/assistant"],
  ["Prompts", "/prompts"],
  ["Speaking", "/speaking"],
  ["Research", "/research"],
  ["About", "/about"],
];
export function Header() {
  const { tr } = useLocale();

  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label={tr("English Lab home")}>
          <span className="brand-mark">
            <Sparkles size={21} />
          </span>
          {"english"}
          <span className="brand-light">{"lab"}</span>
          <span className="brand-dot">.</span>
        </Link>
        <nav className="desktop-nav" aria-label={tr("Main navigation")}>
          {links.map(([name, href]) => (
            <Link
              key={href}
              className={pathname === href ? "active" : ""}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {tr(name)}
            </Link>
          ))}
        </nav>
        <Link href="/learn" className="button small nav-cta">
          {tr("Start Learning")}
          <ArrowUpRight size={15} />
        </Link>
        <LanguageSwitcher />
        <button
          className="icon-button menu-toggle"
          aria-label={tr(open ? "Close menu" : "Open menu")}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label={tr("Mobile navigation")}
        >
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              {tr(name)}
              <ArrowRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
export function Footer() {
  const { tr } = useLocale();

  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          {"english"}
          <span className="brand-light">{"lab"}</span>.
        </Link>
        <p>{tr("A little practice. A world of possibilities.")}</p>
        <p className="locale-note">
          {tr(
            "English exercises and demo conversations stay in English in every interface language.",
          )}
        </p>
      </div>
      <div>
        <span>{tr("An independent educational research project")}</span>
        <Link href="/about#privacy">
          {tr("Privacy & research ethics")}
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </footer>
  );
}

"use client";
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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand" aria-label="English Lab home">
          <span className="brand-mark">
            <Sparkles size={21} />
          </span>
          english<span className="brand-light">lab</span>
          <span className="brand-dot">.</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([name, href]) => (
            <Link
              key={href}
              className={pathname === href ? "active" : ""}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {name}
            </Link>
          ))}
        </nav>
        <Link href="/learn" className="button small nav-cta">
          Start Learning <ArrowUpRight size={15} />
        </Link>
        <button
          className="icon-button menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
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
          aria-label="Mobile navigation"
        >
          {links.map(([name, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              {name}
              <ArrowRight size={16} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Sparkles size={18} />
          </span>
          english<span className="brand-light">lab</span>.
        </Link>
        <p>A little practice. A world of possibilities.</p>
      </div>
      <div>
        <span>An independent educational research project</span>
        <Link href="/about#privacy">
          Privacy & research ethics <ArrowUpRight size={14} />
        </Link>
      </div>
    </footer>
  );
}

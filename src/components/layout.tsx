"use client";
import { LanguageSwitcher, useLocale } from "@/lib/i18n/provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  Home,
  Info,
  Menu,
  MessageCircle,
  Mic,
  Quote,
  Target,
  X,
} from "lucide-react";
import { Button } from "./kit/button";
import { UnionJack } from "./union-jack";
import { Badge } from "./kit/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./kit/sheet";
const links = [
  { name: "Home", href: "/", icon: Home },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Practice", href: "/practice", icon: Target },
  { name: "AI Assistant", href: "/assistant", icon: MessageCircle },
  { name: "Prompts", href: "/prompts", icon: Quote },
  { name: "Speaking", href: "/speaking", icon: Mic },
  { name: "Research", href: "/research", icon: FlaskConical },
  { name: "About", href: "/about", icon: Info },
];
function Brand() {
  const { tr } = useLocale();
  return (
    <Link href="/" className="brand" aria-label={tr("English Lab home")}>
      <span className="brand-mark">
        <BookOpen size={22} strokeWidth={1.8} />
      </span>
      <span>
        english<span className="brand-light">lab</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const { tr } = useLocale();
  const pathname = usePathname();
  return (
    <nav className="workspace-navigation" aria-label={tr("Main navigation")}>
      <p className="nav-section-label">{tr("Your learning space")}</p>
      {links.map(({ name, href, icon: Icon }, index) => (
        <div key={href}>
          {index === 6 && (
            <p className="nav-section-label nav-divider">
              {tr("Explore the project")}
            </p>
          )}
          <Link
            href={href}
            className={`workspace-link ${pathname === href ? "active" : ""}`}
            aria-current={pathname === href ? "page" : undefined}
            onClick={onNavigate}
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{tr(name)}</span>
            {href === "/assistant" && (
              <Badge variant="secondary" className="nav-badge">
                {tr("Demo")}
              </Badge>
            )}
          </Link>
        </div>
      ))}
    </nav>
  );
}
export function Header() {
  const { tr } = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = links.find((link) => link.href === pathname);
  return (
    <>
      <aside className="workspace-sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar-note">
          <span className="sidebar-note-icon">
            <GraduationCap size={24} />
          </span>
          <strong>{tr("A little practice. Every day.")}</strong>
          <p>{tr("Pick one skill. Make your next step count.")}</p>
          <Button asChild className="button">
            <Link href="/learn">
              {tr("Start Learning")}
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        </div>
        <div className="sidebar-foot">
          <span className="status-dot" />
          {tr("Free to explore")}
        </div>
      </aside>
      <header className="site-header">
        <div className="nav-wrap">
          <div className="mobile-brand">
            <Brand />
          </div>
          <div className="page-breadcrumb">
            <span>{tr("Your learning space")}</span>
            <ChevronRight size={14} />
            <strong>{tr(current?.name || "Home")}</strong>
          </div>
          <div className="header-actions">
            <span className="header-note">
              <UnionJack width={22} className="flag-mark" />
              <span className="header-note-label">{tr("A1–B2 levels")}</span>
            </span>
            <LanguageSwitcher />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="menu-toggle"
                  aria-label={tr("Open menu")}
                >
                  <Menu size={21} />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="navigation-sheet"
              >
                <SheetHeader>
                  <SheetTitle>{tr("Your learning space")}</SheetTitle>
                  <SheetDescription>
                    {tr("Choose a learning activity and pick up from there.")}
                  </SheetDescription>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sheet-dismiss"
                      aria-label={tr("Close menu")}
                    >
                      <X size={20} />
                    </Button>
                  </SheetClose>
                </SheetHeader>
                <Navigation onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  const { tr } = useLocale();
  return (
    <footer className="site-footer">
      <div>
        <p>{tr("A little practice. A world of possibilities.")}</p>
        <span>{tr("An independent educational research project")}</span>
      </div>
      <Link href="/about#privacy">
        {tr("Privacy & research ethics")}
        <ArrowUpRight size={15} />
      </Link>
      <p className="locale-note">
        {tr(
          "English exercises and demo conversations stay in English in every interface language.",
        )}
      </p>
    </footer>
  );
}

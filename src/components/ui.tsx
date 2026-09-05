"use client";
import { useLocale } from "@/lib/i18n/provider";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpen,
  Target,
  MessageCircle,
  Quote,
  Mic,
  FlaskConical,
  Info,
  ArrowUpRight,
  CircleAlert,
  Info as InfoIcon,
} from "lucide-react";
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  const { tr } = useLocale();
  const pathname = usePathname();
  const Icon =
    {
      "/learn": BookOpen,
      "/practice": Target,
      "/assistant": MessageCircle,
      "/prompts": Quote,
      "/speaking": Mic,
      "/research": FlaskConical,
      "/about": Info,
    }[pathname] || BookOpen;

  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{tr(eyebrow)}</p>
        <h1>{tr(title)}</h1>
        <p className="intro-description">{tr(description)}</p>
      </div>
      <span className="page-intro-icon" aria-hidden="true">
        <Icon size={32} strokeWidth={1.6} />
      </span>
      {children}
    </div>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  const { tr } = useLocale();

  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{tr(eyebrow)}</p>}
        <h2>{tr(title)}</h2>
        {description && <p>{tr(description)}</p>}
      </div>
      {children}
    </div>
  );
}
export function Arrow() {
  return <ArrowUpRight size={17} aria-hidden="true" />;
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      <span className="notice-icon" aria-hidden="true">
        {error ? <CircleAlert size={18} /> : <InfoIcon size={18} />}
      </span>
      <div className="notice-content">{children}</div>
    </div>
  );
}

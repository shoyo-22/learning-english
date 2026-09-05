"use client";
import { useLocale } from "@/lib/i18n/provider";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
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

  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{tr(eyebrow)}</p>
        <h1>{tr(title)}</h1>
        <p className="intro-description">{tr(description)}</p>
      </div>
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
      {children}
    </div>
  );
}

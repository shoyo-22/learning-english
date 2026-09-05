"use client";
import { useLocale } from "@/lib/i18n/provider";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { prompts } from "@/data/prompts";
import { CopyButton } from "./copy-button";
export function PromptLibrary() {
  const { tr } = useLocale();

  const [filter, setFilter] = useState("All prompts");
  const filters = ["All prompts", ...new Set(prompts.map((p) => p.category))];
  return (
    <>
      <div className="tabs" aria-label={tr("Prompt category")}>
        {filters.map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            className={`tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {tr(f)}
          </button>
        ))}
      </div>
      <p className="result-count" aria-live="polite">
        {
          prompts.filter(
            (p) => filter === "All prompts" || p.category === filter,
          ).length
        }{" "}
        {tr("prompts to get you started")}
      </p>
      <div className="card-grid">
        {prompts
          .filter((p) => filter === "All prompts" || p.category === filter)
          .map((p) => (
            <article className="panel prompt-card" key={p.id}>
              <div className="prompt-card-top">
                <span className="tag">{tr(p.category)}</span>
                <span>{tr(p.level)}</span>
              </div>
              <Quote size={22} />
              <h3>{tr(p.title)}</h3>
              <p lang="en">{p.text}</p>
              <div className="prompt-actions">
                <CopyButton text={p.text} eventId={p.id} />
                <Link
                  href={`/assistant?prompt=${encodeURIComponent(p.text)}`}
                  aria-label={tr("Try {title} in the assistant", {
                    title: tr(p.title),
                  })}
                >
                  <ArrowUpRight size={19} />
                </Link>
              </div>
            </article>
          ))}
      </div>
    </>
  );
}

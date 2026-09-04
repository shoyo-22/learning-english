"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { prompts } from "@/data/prompts";
import { CopyButton } from "./copy-button";
export function PromptLibrary() {
  const [filter, setFilter] = useState("All prompts");
  const filters = ["All prompts", ...new Set(prompts.map((p) => p.category))];
  return (
    <>
      <div className="tabs" aria-label="Prompt category">
        {filters.map((f) => (
          <button
            key={f}
            aria-pressed={filter === f}
            className={`tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <p className="result-count" aria-live="polite">
        {
          prompts.filter(
            (p) => filter === "All prompts" || p.category === filter,
          ).length
        }{" "}
        prompts to get you started
      </p>
      <div className="card-grid">
        {prompts
          .filter((p) => filter === "All prompts" || p.category === filter)
          .map((p) => (
            <article className="panel prompt-card" key={p.id}>
              <div className="prompt-card-top">
                <span className="tag">{p.category}</span>
                <span>{p.level}</span>
              </div>
              <Quote size={22} />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <div className="prompt-actions">
                <CopyButton text={p.text} eventId={p.id} />
                <Link
                  href={`/assistant?prompt=${encodeURIComponent(p.text)}`}
                  aria-label={`Try ${p.title} in the assistant`}
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

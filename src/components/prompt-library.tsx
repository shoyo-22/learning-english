"use client";
import { useLocale } from "@/lib/i18n/provider";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Quote, Search, SearchX } from "lucide-react";
import { prompts } from "@/data/prompts";
import { CopyButton } from "./copy-button";
import { Button } from "./kit/button";
import { Input } from "./kit/input";
import { Card } from "./kit/card";
export function PromptLibrary() {
  const { tr } = useLocale();
  const [filter, setFilter] = useState("All prompts");
  const [query, setQuery] = useState("");
  const filters = ["All prompts", ...new Set(prompts.map((p) => p.category))];
  const search = query.trim().toLocaleLowerCase();
  const visiblePrompts = prompts.filter(
    (p) =>
      (filter === "All prompts" || p.category === filter) &&
      [p.title, tr(p.title), p.category, tr(p.category), p.text, p.level].some(
        (text) => text.toLocaleLowerCase().includes(search),
      ),
  );
  function reset() {
    setFilter("All prompts");
    setQuery("");
  }
  return (
    <>
      <div className="prompt-toolbar">
        <div className="field">
          <label htmlFor="prompt-search">{tr("Find your next prompt")}</label>
          <div className="search-field">
            <Search size={18} aria-hidden="true" />
            <Input
              type="search"
              id="prompt-search"
              placeholder={tr("Search by topic, skill, or level…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        {(query || filter !== "All prompts") && (
          <Button variant="ghost" className="text-link" onClick={reset}>
            {tr("Reset filters")}
          </Button>
        )}
      </div>
      <div className="tabs" role="group" aria-label={tr("Prompt category")}>
        {filters.map((f) => (
          <Button
            variant="ghost"
            key={f}
            aria-pressed={filter === f}
            className={`tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {tr(f)}
          </Button>
        ))}
      </div>
      <p className="result-count" aria-live="polite" aria-atomic="true">
        {visiblePrompts.length} {tr("prompts to get you started")}
      </p>
      {visiblePrompts.length ? (
        <div className="card-grid">
          {visiblePrompts.map((p) => (
            <Card className="panel prompt-card" key={p.id}>
              <div className="prompt-card-top">
                <span className="tag">{tr(p.category)}</span>
                <span>{tr(p.level)}</span>
              </div>
              <Quote size={22} aria-hidden="true" />
              <h3>{tr(p.title)}</h3>
              <p lang="en">{p.text}</p>
              <div className="prompt-actions">
                <CopyButton text={p.text} eventId={p.id} />
                <Button asChild variant="ghost" size="icon">
                  <Link
                    href={`/assistant?prompt=${encodeURIComponent(p.text)}`}
                    aria-label={tr("Try {title} in the assistant", {
                      title: tr(p.title),
                    })}
                  >
                    <ArrowUpRight size={19} />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <SearchX size={32} aria-hidden="true" />
          <h3>{tr("No prompts found")}</h3>
          <p>{tr("Try another keyword or explore all categories.")}</p>
          <Button className="button" onClick={reset}>
            {tr("Show all prompts")}
          </Button>
        </div>
      )}
    </>
  );
}

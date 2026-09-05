"use client";
import { useLocale } from "@/lib/i18n/provider";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Lightbulb, Check, BookOpen } from "lucide-react";
import { learning } from "@/data/learning";
import { CopyButton } from "./copy-button";
export function LearningTabs() {
  const { tr } = useLocale();

  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("skill") || "Vocabulary");
  const item = learning.find((s) => s.name === selected) || learning[0];
  return (
    <>
      <div className="tabs" aria-label={tr("Learning skill")}>
        {learning.map((s) => (
          <button
            key={s.name}
            className={`tab ${s.name === item.name ? "active" : ""}`}
            aria-pressed={s.name === item.name}
            onClick={() => setSelected(s.name)}
          >
            {tr(s.name)}
          </button>
        ))}
      </div>
      <div className="learning-layout">
        <article className="panel learning-main">
          <div className="skill-icon mint">
            <BookOpen size={24} />
          </div>
          <span className="eyebrow">
            {tr("LET’S EXPLORE")} {tr(item.name).toLocaleUpperCase()}
          </span>
          <h2>{tr(item.subtitle)}</h2>
          <p>{tr(item.description)}</p>
          <h3>{tr("A simple way to practice")}</h3>
          <ol className="steps-list">
            {item.steps.map((s, i) => (
              <li key={s}>
                <span>0{i + 1}</span>
                {tr(s)}
              </li>
            ))}
          </ol>
          <Link
            href={item.name === "Speaking" ? "/speaking" : "/practice"}
            className="button"
          >
            {tr("Put it into practice")}
            <ArrowUpRight size={17} />
          </Link>
        </article>
        <aside className="learning-side">
          <div className="panel prompt-feature">
            <p className="eyebrow">{tr("START WITH A GOOD QUESTION")}</p>
            <h3>{tr("Try this prompt")}</h3>
            <blockquote lang="en">{item.prompt}</blockquote>
            <div className="button-row">
              <CopyButton text={item.prompt} />
              <Link
                className="text-link"
                href={`/assistant?prompt=${encodeURIComponent(item.prompt)}`}
              >
                {tr("Try in assistant")}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <div className="panel example-panel">
            <span className="tag">
              <Check size={12} /> {tr("IN PRACTICE")}
            </span>
            <p>{tr(item.example)}</p>
            <strong lang="en">{item.sample}</strong>
          </div>
          <div className="tip">
            <Lightbulb size={19} />
            <p>{tr(item.tip)}</p>
          </div>
        </aside>
      </div>
    </>
  );
}

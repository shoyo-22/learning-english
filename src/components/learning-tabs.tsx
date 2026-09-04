"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Lightbulb, Check, BookOpen } from "lucide-react";
import { learning } from "@/data/learning";
import { CopyButton } from "./copy-button";
export function LearningTabs() {
  const params = useSearchParams();
  const [selected, setSelected] = useState(params.get("skill") || "Vocabulary");
  const item = learning.find((s) => s.name === selected) || learning[0];
  return (
    <>
      <div className="tabs" aria-label="Learning skill">
        {learning.map((s) => (
          <button
            key={s.name}
            className={`tab ${s.name === item.name ? "active" : ""}`}
            aria-pressed={s.name === item.name}
            onClick={() => setSelected(s.name)}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="learning-layout">
        <article className="panel learning-main">
          <div className="skill-icon mint">
            <BookOpen size={24} />
          </div>
          <span className="eyebrow">
            LET’S EXPLORE {item.name.toUpperCase()}
          </span>
          <h2>{item.subtitle}</h2>
          <p>{item.description}</p>
          <h3>A simple way to practice</h3>
          <ol className="steps-list">
            {item.steps.map((s, i) => (
              <li key={s}>
                <span>0{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
          <Link
            href={item.name === "Speaking" ? "/speaking" : "/practice"}
            className="button"
          >
            Put it into practice <ArrowUpRight size={17} />
          </Link>
        </article>
        <aside className="learning-side">
          <div className="panel prompt-feature">
            <p className="eyebrow">START WITH A GOOD QUESTION</p>
            <h3>Try this prompt</h3>
            <blockquote>{item.prompt}</blockquote>
            <div className="button-row">
              <CopyButton text={item.prompt} />
              <Link
                className="text-link"
                href={`/assistant?prompt=${encodeURIComponent(item.prompt)}`}
              >
                Try in assistant <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <div className="panel example-panel">
            <span className="tag">
              <Check size={12} /> IN PRACTICE
            </span>
            <p>{item.example}</p>
            <strong>{item.sample}</strong>
          </div>
          <div className="tip">
            <Lightbulb size={19} />
            <p>{item.tip}</p>
          </div>
        </aside>
      </div>
    </>
  );
}

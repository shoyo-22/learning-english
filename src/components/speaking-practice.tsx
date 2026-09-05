"use client";
import { Button } from "./kit/button";
import { useLocale } from "@/lib/i18n/provider";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, RefreshCw } from "lucide-react";
import { speakingTopics } from "@/data/speaking";
import { CopyButton } from "./copy-button";
import { track } from "@/lib/client";
export function SpeakingPractice() {
  const { tr } = useLocale();

  const [index, setIndex] = useState(0);
  const topic = speakingTopics[index];
  function select(i: number) {
    setIndex(i);
    void track("speaking_topic_opened", speakingTopics[i].name);
  }
  return (
    <div className="speaking-layout">
      <aside className="topic-list" aria-label={tr("Speaking topic")}>
        {speakingTopics.map((t, i) => (
          <Button
            variant="ghost"
            key={t.name}
            className={`topic-button ${i === index ? "active" : ""}`}
            aria-pressed={i === index}
            onClick={() => select(i)}
          >
            <Mic size={18} />
            <span>
              <strong>{tr(t.name)}</strong>
              <small>{tr(t.level)}</small>
            </span>
            <ArrowRight size={15} />
          </Button>
        ))}
      </aside>
      <article className="panel speaking-main">
        <div className="speaking-top">
          <div className="skill-icon lavender">
            <Mic size={26} />
          </div>
          <span className="tag">
            {tr(topic.level)} {tr("· 5 QUESTIONS")}
          </span>
        </div>
        <h2>{tr(topic.name)}</h2>
        <p className="muted">{tr(topic.description)}</p>
        <ol className="speaking-questions" lang="en">
          {topic.questions.map((q, i) => (
            <li key={q}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {q}
            </li>
          ))}
        </ol>
        <div className="button-row">
          <CopyButton
            text={`${topic.name}\n${topic.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`}
            label={tr("Copy Questions")}
          />
          <Button
            variant="ghost"
            className="button secondary"
            onClick={() => select((index + 1) % speakingTopics.length)}
          >
            <RefreshCw size={15} />
            {tr("Try Another Topic")}
          </Button>
        </div>
        <div className="tip">
          <Mic size={18} />
          <p>
            {tr(
              "Say your answer aloud. Try a full sentence, give a reason, and add an example. This activity does not record audio or score pronunciation.",
            )}
          </p>
        </div>
        <Link
          href={`/assistant?prompt=${encodeURIComponent(`Ask me one English speaking question at a time about ${topic.name}. Give feedback on my typed answers.`)}`}
          className="text-link"
        >
          {tr("Continue with your AI companion")}
          <ArrowRight size={15} />
        </Link>
      </article>
    </div>
  );
}

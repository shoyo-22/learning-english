"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, RefreshCw } from "lucide-react";
import { speakingTopics } from "@/data/speaking";
import { CopyButton } from "./copy-button";
import { track } from "@/lib/client";
export function SpeakingPractice() {
  const [index, setIndex] = useState(0);
  const topic = speakingTopics[index];
  function select(i: number) {
    setIndex(i);
    void track("speaking_topic_opened", speakingTopics[i].name);
  }
  return (
    <div className="speaking-layout">
      <aside className="topic-list" aria-label="Speaking topic">
        {speakingTopics.map((t, i) => (
          <button
            key={t.name}
            className={`topic-button ${i === index ? "active" : ""}`}
            aria-pressed={i === index}
            onClick={() => select(i)}
          >
            <Mic size={18} />
            <span>
              <strong>{t.name}</strong>
              <small>{t.level}</small>
            </span>
            <ArrowRight size={15} />
          </button>
        ))}
      </aside>
      <article className="panel speaking-main">
        <div className="speaking-top">
          <div className="skill-icon lavender">
            <Mic size={26} />
          </div>
          <span className="tag">{topic.level} · 5 QUESTIONS</span>
        </div>
        <h2>{topic.name}</h2>
        <p className="muted">{topic.description}</p>
        <ol className="speaking-questions">
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
            label="Copy Questions"
          />
          <button
            className="button secondary"
            onClick={() => select((index + 1) % speakingTopics.length)}
          >
            <RefreshCw size={15} />
            Try Another Topic
          </button>
        </div>
        <div className="tip">
          <Mic size={18} />
          <p>
            Say your answer aloud. Try a full sentence, give a reason, and add
            an example. This activity does not record audio or score
            pronunciation.
          </p>
        </div>
        <Link
          href={`/assistant?prompt=${encodeURIComponent(`Ask me one English speaking question at a time about ${topic.name}. Give feedback on my typed answers.`)}`}
          className="text-link"
        >
          Continue with your AI companion <ArrowRight size={15} />
        </Link>
      </article>
    </div>
  );
}

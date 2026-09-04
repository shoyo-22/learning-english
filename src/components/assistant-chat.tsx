"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp,
  Sparkles,
  Trash2,
  PenLine,
  BookOpen,
  MessagesSquare,
  LoaderCircle,
} from "lucide-react";
import { api, initSession } from "@/lib/client";
import { Notice } from "./ui";
type Message = { role: "user" | "assistant"; content: string };
const examples = [
  {
    icon: PenLine,
    title: "Correct my sentence",
    text: "Correct my sentence: I go to school yesterday.",
  },
  {
    icon: BookOpen,
    title: "Explain a grammar rule",
    text: "Explain Present Perfect simply.",
  },
  {
    icon: Sparkles,
    title: "Learn new words",
    text: "Give me five B1 words about technology.",
  },
  {
    icon: MessagesSquare,
    title: "Start a conversation",
    text: "Ask me an English speaking question.",
  },
  {
    icon: PenLine,
    title: "Check my paragraph",
    text: "Check my paragraph and explain the important mistakes: ",
  },
];
export function AssistantChat() {
  const params = useSearchParams();
  const [input, setInput] = useState(
    (params.get("prompt") || "").slice(0, 2000),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState<string | null>(null);
  const locked = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    void initSession();
  }, []);
  useEffect(() => {
    if (messages.length)
      bottom.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);
  async function send(retry = false) {
    if (locked.current || (!retry && !input.trim())) return;
    const next: Message[] = retry
      ? messages
      : [...messages, { role: "user", content: input.trim() }];
    if (!next.length) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setMessages(next);
    if (!retry) setInput("");
    try {
      await initSession();
      const data = await api<{ message: string; tracked: boolean }>("/api/ai", {
        messages: next.slice(-8),
      });
      setMessages([...next, { role: "assistant", content: data.message }]);
      setTracking(
        data.tracked
          ? null
          : "Demo replies are not counted as real AI usage or AI-assisted research.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The AI assistant is temporarily unavailable. Please try again.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  return (
    <div className="assistant-layout">
      <section className="chat-panel panel">
        <div className="chat-heading">
          <span className="brand-mark">
            <Sparkles size={19} />
          </span>
          <div>
            <strong>Your English companion · Demo</strong>
            <span>Ask freely. Learn one thing at a time.</span>
          </div>
          <button
            className="icon-button"
            aria-label="Clear conversation"
            disabled={busy || !messages.length}
            onClick={() => {
              setMessages([]);
              setError("");
              setTracking(null);
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
        <Notice>Demo mode — prepared responses, not a live AI model. No OpenAI connection or API key is used.</Notice>
        <div className="chat-messages" aria-live="polite" aria-busy={busy}>
          {!messages.length ? (
            <div className="chat-welcome">
              <span className="welcome-spark">
                <Sparkles size={31} />
              </span>
              <h2>What will you learn today?</h2>
              <p>
                A sentence to fix, a word to understand, or a conversation to
                start. I’m here to help you practice.
              </p>
              <div className="chat-examples">
                {examples.slice(0, 4).map(({ icon: Icon, title, text }) => (
                  <button
                    key={title}
                    onClick={() => {
                      setInput(text);
                      inputRef.current?.focus();
                    }}
                  >
                    <Icon size={16} />
                    {title}
                    <span>↗</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                <span>{m.role === "user" ? "YOU" : "ENGLISH LAB · DEMO"}</span>
                <div>{m.content}</div>
              </div>
            ))
          )}
          {busy && (
            <div className="thinking">
              <LoaderCircle size={16} className="loading-spin" />
              Preparing example…
            </div>
          )}
          {error && (
            <Notice error>
              {error}
              <div>
                <button
                  className="text-link"
                  disabled={busy}
                  onClick={() => send(true)}
                >
                  Retry message
                </button>
              </div>
            </Notice>
          )}
          <div ref={bottom} />
        </div>
        <form
          className="chat-compose"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Your message
          </label>
          <textarea
            ref={inputRef}
            id="chat-input"
            placeholder="Ask a question, or write a sentence to improve…"
            maxLength={2000}
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="compose-bottom">
            <span>{input.length}/2000 · Shift + Enter for a new line</span>
            <button
              aria-label="Send message"
              disabled={busy || !input.trim()}
              className="send-button"
            >
              {busy ? (
                <LoaderCircle size={18} className="loading-spin" />
              ) : (
                <ArrowUp size={19} />
              )}
            </button>
          </div>
        </form>
        <p className="chat-disclaimer">
          Prepared examples only. For feedback on your own writing, ask your teacher.
        </p>
        {tracking && <p className="chat-disclaimer">{tracking}</p>}
      </section>
      <aside className="assistant-side">
        <div className="panel">
          <p className="eyebrow">A GOOD PLACE TO START</p>
          <h3>Try asking…</h3>
          {examples.map(({ title, text }) => (
            <button
              key={title}
              className="example-prompt-button"
              disabled={busy}
              onClick={() => {
                setInput(text);
                inputRef.current?.focus();
              }}
            >
              {text}
              <span>↗</span>
            </button>
          ))}
        </div>
        <div className="tip">
          <Sparkles size={18} />
          <p>
            Tell your companion your approximate level, ask for a simple
            explanation, and try your own answer before asking for help.
          </p>
        </div>
        <p className="privacy-note">
          Your messages are processed by this app to select prepared responses. They are not sent to OpenAI or stored in the research database. Please avoid personal information.
        </p>
      </aside>
    </div>
  );
}

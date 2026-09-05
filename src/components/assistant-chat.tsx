"use client";
import { Button } from "./kit/button";
import { useLocale } from "@/lib/i18n/provider";
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
import { Textarea } from "./kit/textarea";
import { ConfirmAction } from "./confirm-action";
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
  const { tr } = useLocale();

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
            <strong>{tr("Your English companion · Demo")}</strong>
            <span>{tr("Ask freely. Learn one thing at a time.")}</span>
          </div>
          <ConfirmAction
            title="Clear this conversation?"
            description="Your messages will be removed from this chat. You can start a new conversation anytime."
            onConfirm={() => {
              setMessages([]);
              setError("");
              setTracking(null);
            }}
            focusAfterConfirm={() => inputRef.current?.focus()}
          >
            <Button
              variant="ghost"
              className="icon-button"
              aria-label={tr("Clear conversation")}
              disabled={busy || !messages.length}
            >
              <Trash2 size={16} />
            </Button>
          </ConfirmAction>
        </div>
        <Notice>
          {tr(
            "Demo mode — prepared responses, not a live AI model. No OpenAI connection or API key is used.",
          )}
        </Notice>
        <div className="chat-messages" aria-live="polite" aria-busy={busy}>
          {!messages.length ? (
            <div className="chat-welcome">
              <span className="welcome-spark">
                <Sparkles size={31} />
              </span>
              <h2>{tr("What will you learn today?")}</h2>
              <p>
                {tr(
                  "A sentence to fix, a word to understand, or a conversation to start. I’m here to help you practice.",
                )}
              </p>
              <div className="chat-examples">
                {examples.slice(0, 4).map(({ icon: Icon, title, text }) => (
                  <Button
                    variant="ghost"
                    key={title}
                    onClick={() => {
                      setInput(text);
                      inputRef.current?.focus();
                    }}
                  >
                    <Icon size={16} />
                    {tr(title)}
                    <span>↗</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                <span>
                  {tr(m.role === "user" ? "YOU" : "ENGLISH LAB · DEMO")}
                </span>
                <div lang={m.role === "assistant" ? "en" : undefined}>
                  {m.content}
                </div>
              </div>
            ))
          )}
          {busy && (
            <div className="thinking">
              <LoaderCircle size={16} className="loading-spin" />
              {tr("Preparing example…")}
            </div>
          )}
          {error && (
            <Notice error>
              {tr(error)}
              <div>
                <Button
                  variant="ghost"
                  className="text-link"
                  disabled={busy}
                  onClick={() => send(true)}
                >
                  {tr("Retry message")}
                </Button>
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
            {tr("Your message")}
          </label>
          <Textarea
            ref={inputRef}
            id="chat-input"
            placeholder={tr("Ask a question, or write a sentence to improve…")}
            maxLength={2000}
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="compose-bottom">
            <span>
              {input.length}
              {tr("/2000 · Shift + Enter for a new line")}
            </span>
            <Button
              variant="ghost"
              type="submit"
              aria-label={tr("Send message")}
              disabled={busy || !input.trim()}
              className="send-button"
            >
              {busy ? (
                <LoaderCircle size={18} className="loading-spin" />
              ) : (
                <ArrowUp size={19} />
              )}
            </Button>
          </div>
        </form>
        <p className="chat-disclaimer">
          {tr(
            "Prepared examples only. For feedback on your own writing, ask your teacher.",
          )}
        </p>
        {tracking && <p className="chat-disclaimer">{tr(tracking)}</p>}
      </section>
      <aside className="assistant-side">
        <div className="panel">
          <p className="eyebrow">{tr("A GOOD PLACE TO START")}</p>
          <h3>{tr("Try asking…")}</h3>
          {examples.map(({ title, text }) => (
            <Button
              variant="ghost"
              key={title}
              className="example-prompt-button"
              lang="en"
              disabled={busy}
              onClick={() => {
                setInput(text);
                inputRef.current?.focus();
              }}
            >
              {text}
              <span>↗</span>
            </Button>
          ))}
        </div>
        <div className="tip">
          <Sparkles size={18} />
          <p>
            {tr(
              "Tell your companion your approximate level, ask for a simple explanation, and try your own answer before asking for help.",
            )}
          </p>
        </div>
        <p className="privacy-note">
          {tr(
            "Your messages are processed by this app to select prepared responses. They are not sent to OpenAI or stored in the research database. Please avoid personal information.",
          )}
        </p>
      </aside>
    </div>
  );
}

"use client";
import { useEffect, useId, useRef, useState } from "react";
import { api, initSession } from "@/lib/client";
import { useLocale } from "@/lib/i18n/provider";
import { participantSchema } from "@/lib/validation";
import { Button } from "./kit/button";
import { Input } from "./kit/input";
import { Notice } from "./ui";

export type ParticipantState = {
  storage: boolean;
  participantName: string | null;
  participantReady: boolean;
};
export function ParticipantName({
  sessionState,
  onSaved,
}: {
  sessionState?: ParticipantState | null;
  onSaved?: (name: string) => void;
}) {
  const { tr } = useLocale();
  const id = useId();
  const [loaded, setLoaded] = useState<ParticipantState | null>(null);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const saved = useRef<HTMLParagraphElement>(null);
  const locked = useRef(false);
  const state = sessionState === undefined ? loaded : sessionState;
  useEffect(() => {
    if (sessionState !== undefined) return;
    let live = true;
    initSession()
      .then(() => api<ParticipantState>("/api/session"))
      .then((data) => {
        if (live) setLoaded(data);
      })
      .catch(() => {
        if (live) setError("Assessment status is unavailable. Please retry.");
      });
    return () => {
      live = false;
    };
  }, [sessionState]);
  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (locked.current) return;
    const parsed = participantSchema.safeParse({ name });
    if (!parsed.success) {
      setError("Enter a name or code between 2 and 40 characters.");
      return;
    }
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ name: string }>(
        "/api/participant",
        parsed.data,
      );
      setLoaded({
        storage: true,
        participantReady: true,
        participantName: result.name,
      });
      onSaved?.(result.name);
      setEditing(false);
      requestAnimationFrame(() => saved.current?.focus());
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  return (
    <div className="participant-name">
      <p className="muted" id={`${id}-help`}>
        {tr(
          "Enter your name or the code your teacher gave you. Your teacher will see your results.",
        )}
      </p>
      {state?.participantName && !editing ? (
        <div className="button-row">
          <p ref={saved} tabIndex={-1}>
            <strong>{tr("Name or code")}: </strong>
            {state.participantName}
          </p>
          <Button
            variant="ghost"
            className="text-link"
            onClick={() => {
              setName(state.participantName || "");
              setEditing(true);
            }}
          >
            {tr("Change")}
          </Button>
        </div>
      ) : (
        <form onSubmit={save} className="participant-form">
          <div>
            <label htmlFor={id}>{tr("Name or code")}</label>
            <Input
              id={id}
              ref={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
              disabled={busy || !state?.participantReady}
              autoComplete="off"
              aria-describedby={`${id}-help`}
            />
          </div>
          <Button
            type="submit"
            className="button"
            disabled={busy || !state?.participantReady}
          >
            {tr(busy ? "Saving…" : "Save")}
          </Button>
          {editing && (
            <Button
              variant="ghost"
              type="button"
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setError("");
              }}
            >
              {tr("Cancel")}
            </Button>
          )}
        </form>
      )}
      {state && !state.storage && (
        <Notice>
          {tr(
            "Research storage is unavailable. Your result has not been saved. Please try again later.",
          )}
        </Notice>
      )}
      {state?.storage && !state.participantReady && (
        <Notice error>
          {tr("Update the database schema: apply the latest migration.")}
        </Notice>
      )}
      {error && <Notice error>{tr(error)}</Notice>}
    </div>
  );
}

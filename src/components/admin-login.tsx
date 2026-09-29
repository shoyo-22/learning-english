"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import { useLocale } from "@/lib/i18n/provider";
import { Button } from "./kit/button";
import { Input } from "./kit/input";
import { Notice } from "./ui";

export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const { tr } = useLocale();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  useEffect(() => {
    input.current?.focus();
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/session", { password });
      setPassword("");
      onSignedIn();
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
    <form className="panel admin-login" onSubmit={submit}>
      <h2>{tr("Administrator sign in")}</h2>
      <label htmlFor="admin-password">{tr("Password")}</label>
      <Input
        ref={input}
        id="admin-password"
        type="password"
        autoComplete="current-password"
        maxLength={200}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={busy}
      />
      <Button className="button" type="submit" disabled={busy}>
        {tr(busy ? "Signing in…" : "Sign in")}
      </Button>
      {error && <Notice error>{tr(error)}</Notice>}
    </form>
  );
}

"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, LogOut, RefreshCw } from "lucide-react";
import { api, ApiClientError } from "@/lib/client";
import { useLocale } from "@/lib/i18n/provider";
import type { AdminResults, AdminScore } from "@/lib/types";
import { AdminLogin } from "./admin-login";
import { Button } from "./kit/button";
import { Input } from "./kit/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./kit/tabs";
import { Notice } from "./ui";

export function AdminPanel({ initialSignedIn }: { initialSignedIn: boolean }) {
  const [signedIn, setSignedIn] = useState(initialSignedIn);
  const signOut = useCallback(() => setSignedIn(false), []);
  return signedIn ? (
    <AdminDashboard onSignedOut={signOut} />
  ) : (
    <AdminLogin onSignedIn={() => setSignedIn(true)} />
  );
}

function AdminDashboard({ onSignedOut }: { onSignedOut: () => void }) {
  const { tr, locale, number } = useLocale();
  const [data, setData] = useState<AdminResults | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("time");
  const [practiceSort, setPracticeSort] = useState("time");
  const pending = useRef(false);
  const lifecycle = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const refresh = useCallback(async () => {
    const signal = lifecycle.current?.signal;
    if (pending.current || !signal || signal.aborted) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api<AdminResults>("/api/admin/results", undefined, {
        signal,
      });
      if (!signal.aborted) {
        setData(result);
        setUpdatedAt(new Date());
      }
    } catch (e) {
      if (!signal.aborted) {
        if (e instanceof ApiClientError && e.status === 401) onSignedOut();
        else
          setError(
            e instanceof Error
              ? e.message
              : "Something went wrong. Please try again.",
          );
      }
    } finally {
      pending.current = false;
      if (!signal.aborted) setBusy(false);
    }
  }, [onSignedOut]);

  useEffect(() => {
    const controller = new AbortController();
    lifecycle.current = controller;
    heading.current?.focus();
    const load = () => {
      if (!document.hidden) void refresh();
    };
    const initial = setTimeout(load, 0);
    const interval = setInterval(load, 30000);
    document.addEventListener("visibilitychange", load);
    return () => {
      controller.abort();
      clearTimeout(initial);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", load);
    };
  }, [refresh]);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError("");
    try {
      await api("/api/admin/session", undefined, { method: "DELETE" });
      onSignedOut();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoggingOut(false);
    }
  }
  async function download(kind: "assessments" | "practice") {
    if (exporting) return;
    setExporting(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/export?kind=${kind}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(45000),
      });
      if (response.status === 401) {
        onSignedOut();
        return;
      }
      if (!response.ok) {
        const failure = await response.json();
        throw new Error(
          failure.error || "Something went wrong. Please try again.",
        );
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        response.headers
          .get("content-disposition")
          ?.match(/filename="([^"]+)"/)?.[1] || `english-lab-${kind}.csv`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(
        e instanceof Error &&
          e.name !== "TimeoutError" &&
          e.name !== "TypeError"
          ? e.message
          : "The connection was interrupted. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  }
  const percent = (value: number | null | undefined) =>
    value == null ? "—" : `${number(value)}%`;
  const difference = (value: number | null) =>
    value == null
      ? "—"
      : tr("{value} pp", { value: `${value > 0 ? "+" : ""}${number(value)}` });
  const date = (value: string) => new Date(value).toLocaleString(locale);
  const search = query.trim().toLocaleLowerCase(locale).replace(/^#/, "");
  const matches = (row: { name: string | null; shortId: string }) =>
    `${row.name || tr("Unnamed")} ${row.shortId}`
      .toLocaleLowerCase(locale)
      .includes(search);
  const descending = (a: number | null, b: number | null) =>
    a == null ? (b == null ? 0 : 1) : b == null ? -1 : b - a;
  const participants = (data?.participants || [])
    .filter(matches)
    .sort((a, b) => {
      if (sort === "name")
        return (a.name || tr("Unnamed")).localeCompare(
          b.name || tr("Unnamed"),
          locale,
        );
      if (sort === "before" || sort === "after")
        return descending(a[sort]?.total ?? null, b[sort]?.total ?? null);
      if (sort === "difference") return descending(a.difference, b.difference);
      return Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt);
    });
  const practice = (data?.practice || [])
    .filter(matches)
    .sort((a, b) =>
      practiceSort === "score"
        ? b.percentage - a.percentage
        : Date.parse(b.completedAt) - Date.parse(a.completedAt),
    );
  function scoreCell(score: AdminScore | null) {
    if (!score) return "—";
    return (
      <>
        <strong className="admin-total">{percent(score.total)}</strong>
        <dl className="admin-skills">
          {(["vocabulary", "grammar", "speaking", "writing"] as const).map(
            (skill) => (
              <div key={skill}>
                <dt>{tr(skill[0].toUpperCase() + skill.slice(1))}</dt>
                <dd>{percent(score[skill])}</dd>
              </div>
            ),
          )}
        </dl>
        <time className="admin-score-time" dateTime={score.at}>
          {date(score.at)}
        </time>
      </>
    );
  }
  function identity(row: { name: string | null; shortId: string }) {
    return (
      <>
        <strong>{row.name || tr("Unnamed")}</strong>
        <small className="admin-id">#{row.shortId}</small>
      </>
    );
  }
  function exportButton(kind: "assessments" | "practice") {
    return (
      <Button
        variant="ghost"
        className="button secondary"
        disabled={exporting}
        onClick={() => download(kind)}
      >
        <Download size={16} />
        {tr(exporting ? "Preparing CSV…" : "Download CSV")}
      </Button>
    );
  }
  function truncated(count: number) {
    return (
      <Notice>
        {tr(
          "Showing the latest {count} records. More records are available in CSV or in the Supabase dashboard.",
          { count: number(count) },
        )}
      </Notice>
    );
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-toolbar">
        <div>
          <h2 ref={heading} tabIndex={-1}>
            {tr("Results overview")}
          </h2>
          <p className="muted" aria-live="polite">
            {updatedAt
              ? tr("Updated at {time}", {
                  time: updatedAt.toLocaleTimeString(locale),
                })
              : tr("Loading results…")}
          </p>
        </div>
        <div className="button-row">
          <Button
            variant="ghost"
            className="button secondary"
            disabled={busy}
            onClick={() => refresh()}
          >
            <RefreshCw size={16} className={busy ? "loading-spin" : ""} />
            {tr("Refresh")}
          </Button>
          <Button
            variant="ghost"
            className="button secondary"
            disabled={loggingOut}
            onClick={logout}
          >
            <LogOut size={16} />
            {tr("Sign out")}
          </Button>
        </div>
      </div>
      {error && <Notice error>{tr(error)}</Notice>}
      {data && (
        <>
          <div className="admin-summary">
            {[
              [
                "Participants",
                number(data.summary.participants),
                tr("{count} with a name", {
                  count: number(data.summary.named),
                }),
              ],
              ["Completed pairs", number(data.summary.pairs)],
              ["Average Before", percent(data.summary.before)],
              ["Average After", percent(data.summary.after)],
              ["Difference", difference(data.summary.difference)],
              ["Practice sessions", number(data.summary.practiceSessions)],
            ].map(([label, value, note]) => (
              <div className="panel" key={label}>
                <p className="muted">{tr(label)}</p>
                <strong>{value}</strong>
                {note && <small>{note}</small>}
              </div>
            ))}
          </div>
          <div className="admin-search">
            <label htmlFor="admin-search">{tr("Search by name or code")}</label>
            <Input
              id="admin-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Tabs defaultValue="assessments">
            <TabsList aria-label={tr("Result type")}>
              <TabsTrigger value="assessments">
                {tr("Before / After")}
              </TabsTrigger>
              <TabsTrigger value="practice">{tr("Practice")}</TabsTrigger>
            </TabsList>
            <TabsContent value="assessments" className="admin-tab">
              <div className="admin-toolbar">
                <label className="admin-sort">
                  {tr("Sort by")}
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="time">{tr("Newest first")}</option>
                    <option value="name">{tr("Name")}</option>
                    <option value="before">{tr("Before score")}</option>
                    <option value="after">{tr("After score")}</option>
                    <option value="difference">{tr("Difference")}</option>
                  </select>
                </label>
                {exportButton("assessments")}
              </div>
              {data.truncated.participants &&
                truncated(data.participants.length)}
              {!participants.length ? (
                <Notice>
                  {tr(
                    data.participants.length
                      ? "No matching results."
                      : "No assessments have been completed yet.",
                  )}
                </Notice>
              ) : (
                <div
                  className="admin-table-wrap"
                  tabIndex={0}
                  role="region"
                  aria-label={tr("Assessment results")}
                >
                  <table className="admin-table">
                    <caption className="sr-only">
                      {tr("Assessment results")}
                    </caption>
                    <thead>
                      <tr>
                        {[
                          "Name or code",
                          "Before",
                          "After",
                          "Difference",
                          "Last test",
                        ].map((label) => (
                          <th scope="col" key={label}>
                            {tr(label)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((row, i) => (
                        <tr key={`${row.shortId}-${i}`}>
                          <th scope="row">{identity(row)}</th>
                          <td>{scoreCell(row.before)}</td>
                          <td>{scoreCell(row.after)}</td>
                          <td>{difference(row.difference)}</td>
                          <td>
                            <time dateTime={row.lastActivityAt}>
                              {date(row.lastActivityAt)}
                            </time>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="practice" className="admin-tab">
              <div className="admin-toolbar">
                <label className="admin-sort">
                  {tr("Sort by")}
                  <select
                    value={practiceSort}
                    onChange={(e) => setPracticeSort(e.target.value)}
                  >
                    <option value="time">{tr("Newest first")}</option>
                    <option value="score">{tr("Highest score")}</option>
                  </select>
                </label>
                {exportButton("practice")}
              </div>
              {data.truncated.practice && truncated(data.practice.length)}
              {!practice.length ? (
                <Notice>
                  {tr(
                    data.practice.length
                      ? "No matching results."
                      : "No practice results yet.",
                  )}
                </Notice>
              ) : (
                <div
                  className="admin-table-wrap"
                  tabIndex={0}
                  role="region"
                  aria-label={tr("Practice results")}
                >
                  <table className="admin-table">
                    <caption className="sr-only">
                      {tr("Practice results")}
                    </caption>
                    <thead>
                      <tr>
                        {[
                          "Name or code",
                          "Level",
                          "Category",
                          "Correct answers",
                          "Score",
                          "Completed at",
                        ].map((label) => (
                          <th scope="col" key={label}>
                            {tr(label)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {practice.map((row, i) => (
                        <tr key={`${row.shortId}-${i}`}>
                          <th scope="row">{identity(row)}</th>
                          <td>{row.level}</td>
                          <td>{tr(row.category)}</td>
                          <td>
                            {number(row.correct)} / {number(row.total)}
                          </td>
                          <td>{percent(row.percentage)}</td>
                          <td>
                            <time dateTime={row.completedAt}>
                              {date(row.completedAt)}
                            </time>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </section>
  );
}

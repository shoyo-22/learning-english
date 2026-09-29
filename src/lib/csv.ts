import type { AdminResults } from "./types";
type Cell = string | number | null | undefined;

export function csv(rows: Cell[][]): string {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            if (value == null) return "";
            if (typeof value === "number") return String(value);
            const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
            return /[",\r\n]/.test(safe)
              ? `"${safe.replaceAll('"', '""')}"`
              : safe;
          })
          .join(","),
      )
      .join("\r\n") +
    "\r\n"
  );
}

export function resultsCsv(
  data: AdminResults,
  kind: "assessments" | "practice",
) {
  const iso = (date: string | undefined) =>
    date ? new Date(date).toISOString() : null;
  if (kind === "practice")
    return csv([
      [
        "name",
        "short_id",
        "level",
        "category",
        "correct",
        "total",
        "percentage",
        "completed_at",
      ],
      ...data.practice.map((p) => [
        p.name,
        p.shortId,
        p.level,
        p.category,
        p.correct,
        p.total,
        p.percentage,
        iso(p.completedAt),
      ]),
    ]);
  return csv([
    [
      "name",
      "short_id",
      "before_total",
      "before_vocabulary",
      "before_grammar",
      "before_speaking",
      "before_writing",
      "before_at",
      "after_total",
      "after_vocabulary",
      "after_grammar",
      "after_speaking",
      "after_writing",
      "after_at",
      "difference",
    ],
    ...data.participants.map((p) => [
      p.name,
      p.shortId,
      p.before?.total,
      p.before?.vocabulary,
      p.before?.grammar,
      p.before?.speaking,
      p.before?.writing,
      iso(p.before?.at),
      p.after?.total,
      p.after?.vocabulary,
      p.after?.grammar,
      p.after?.speaking,
      p.after?.writing,
      iso(p.after?.at),
      p.difference,
    ]),
  ]);
}

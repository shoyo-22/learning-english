"use client";
import { useLocale } from "@/lib/i18n/provider";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { tr } = useLocale();

  return (
    <div className="container section">
      <p className="eyebrow">{tr("A SMALL PAUSE")}</p>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>
        {tr("We couldn’t load this activity.")}
      </h1>
      <p className="muted" style={{ marginBottom: 25 }}>
        {tr("Please try again. You can also return to the learning toolkit.")}
      </p>
      <div className="button-row">
        <button className="button" onClick={reset}>
          {tr("Try again")}
        </button>
        <Link className="button secondary" href="/learn">
          {tr("Return to Learning")}
        </Link>
      </div>
    </div>
  );
}

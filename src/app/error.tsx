"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container section">
      <p className="eyebrow">A SMALL PAUSE</p>
      <h1 style={{ fontSize: 36, marginBottom: 20 }}>
        We couldn’t load this activity.
      </h1>
      <p className="muted" style={{ marginBottom: 25 }}>
        Please try again. You can also return to the learning toolkit.
      </p>
      <div className="button-row">
        <button className="button" onClick={reset}>
          Try again
        </button>
        <Link className="button secondary" href="/learn">
          Return to Learning
        </Link>
      </div>
    </div>
  );
}

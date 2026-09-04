"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
export function HomeStats() {
  const [data, setData] = useState<{
    practiceSessions: number;
    aiSessions: number;
  } | null>(null);
  useEffect(() => {
    fetch("/api/research")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.summary) setData(d.summary);
      })
      .catch(() => {});
  }, []);
  return (
    <div className="container">
      <div className="home-stats">
        {[
          ["5", "English skills to explore"],
          ["A1–B2", "Every stage of your journey"],
          [
            data ? String(data.practiceSessions) : "—",
            "Completed practice sessions",
          ],
          [data ? String(data.aiSessions) : "—", "AI learning exchanges"],
        ].map(([value, label]) => (
          <div key={label}>
            <strong>
              {value}
              <ArrowUpRight size={18} />
            </strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="stats-caption">
        Learning activity comes from stored records. A dash means live data is
        unavailable.
      </p>
    </div>
  );
}

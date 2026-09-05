"use client";
import { useLocale } from "@/lib/i18n/provider";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
type SavedPractice = {
  id: string;
  level: string;
  category: string;
  correct_answers: number;
  total_questions: number;
  score_percentage: number;
  completed_at: string;
};
export function PracticeHistory() {
  const { tr, number } = useLocale();

  const [items, setItems] = useState<SavedPractice[]>([]);
  useEffect(() => {
    api<{ practice: SavedPractice[] }>("/api/session")
      .then((d) => setItems(d.practice || []))
      .catch(() => {});
  }, []);
  if (!items.length) return null;
  return (
    <section className="panel history-panel">
      <p className="eyebrow">{tr("YOUR RECENT PROGRESS")}</p>
      <h3>{tr("Keep building on what you know.")}</h3>
      <div className="table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>{tr("Level")}</th>
              <th>{tr("Focus")}</th>
              <th>{tr("Correct")}</th>
              <th>{tr("Score")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <th>{tr(p.level)}</th>
                <td>{tr(p.category)}</td>
                <td>
                  {p.correct_answers}/{p.total_questions}
                </td>
                <td>{number(p.score_percentage)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="chart-note">
        {tr(
          "Your last five saved sessions in this browser. Different questions and levels may have different difficulty.",
        )}
      </p>
    </section>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3,
  FlaskConical,
  RefreshCw,
  ArrowRight,
  Activity,
  Users,
  CheckCheck,
  Target,
} from "lucide-react";
import type { ResearchSummary } from "@/lib/types";
import { demoResearch } from "@/data/project";
import { api } from "@/lib/client";
import { Notice, SectionHeading } from "./ui";
import { Assessment } from "./assessment";
const Chart = dynamic(() => import("./research-chart"), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 300 }} />,
});
export function ResearchDashboard() {
  const [summary, setSummary] = useState<ResearchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ summary: ResearchSummary }>("/api/research");
      setSummary(data.summary);
      setDemo(false);
    } catch {
      setError(
        "Live research data is unavailable. You can still explore the methodology and a clearly labeled example chart.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    let live = true;
    api<{ summary: ResearchSummary }>("/api/research")
      .then((d) => {
        if (live) setSummary(d.summary);
      })
      .catch(() => {
        if (live)
          setError(
            "Live research data is unavailable. You can still explore the methodology and a clearly labeled example chart.",
          );
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);
  const hasReal = !!summary?.pairs;
  const data = hasReal ? summary.skills : demo ? demoResearch : [];
  return (
    <>
      <Notice>
        The assistant currently uses scripted demo responses. This setup can
        demonstrate platform practice, but does not provide evidence about
        learning with real ChatGPT. Demo replies are excluded from AI usage and
        do not unlock the After test.
      </Notice>
      <div className="research-toolbar">
        <span className="tag">
          <span className="status-dot" />
          {summary
            ? "LIVE DATABASE · ANONYMOUS RECORDS"
            : "TRANSPARENT DATA. HONEST CONCLUSIONS."}
        </span>
        <button className="text-link" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? "loading-spin" : ""} />
          Refresh results
        </button>
      </div>
      {error && <Notice error>{error}</Notice>}
      {loading ? (
        <div className="metrics-grid" aria-label="Loading research results">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton" />
          ))}
        </div>
      ) : (
        <div className="metrics-grid">
          {[
            {
              icon: Users,
              label: "Completed assessment pairs",
              value: summary ? String(summary.pairs) : "—",
              note: "Matched anonymous browser identifiers",
            },
            {
              icon: Target,
              label: "Average Before",
              value: summary?.before != null ? `${summary.before}%` : "—",
              note: "Paired baseline assessment scores",
            },
            {
              icon: CheckCheck,
              label: "Average After",
              value: summary?.after != null ? `${summary.after}%` : "—",
              note: "The same paired browser identifiers",
            },
            {
              icon: Activity,
              label: "Average difference",
              value:
                summary?.difference != null
                  ? `${summary.difference >= 0 ? "+" : ""}${summary.difference}`
                  : "—",
              note: "Percentage points, not percent increase",
            },
          ].map(({ icon: Icon, label, value, note }) => (
            <div className="metric-card" key={label}>
              <span>
                {label}
                <Icon size={16} />
              </span>
              <strong>{value}</strong>
              <p>{note}</p>
            </div>
          ))}
        </div>
      )}
      <div className="research-chart-layout">
        <section className="panel chart-panel">
          <div className="chart-heading">
            <div>
              <h3>Before & After, skill by skill.</h3>
              <p>Average assessment score (%)</p>
            </div>
            <BarChart3 size={21} />
          </div>
          {data.length > 0 ? (
            <>
              {!hasReal && (
                <Notice>
                  Demo data — illustrative scores only. Replace with final
                  research results. No participant count is implied.
                </Notice>
              )}
              <Chart data={data} />
              <div className="table-scroll">
                <table className="results-table">
                  <caption className="sr-only">
                    {hasReal ? "Actual paired" : "Illustrative demo"} scores by
                    skill
                  </caption>
                  <thead>
                    <tr>
                      <th>Skill</th>
                      <th>Before</th>
                      <th>After</th>
                      <th>Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((s) => (
                      <tr key={s.skill}>
                        <th>
                          {s.skill}
                          {["Speaking", "Writing"].includes(s.skill) ? "*" : ""}
                        </th>
                        <td>{s.before}%</td>
                        <td>{s.after}%</td>
                        <td>
                          {s.after - s.before >= 0 ? "+" : ""}
                          {Math.round((s.after - s.before) * 10) / 10} pp
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <BarChart3 size={35} />
              <h3>The first pair starts the story.</h3>
              <p>
                No completed comparison is available yet.
                <br />
                Results will appear after a Before and After test are saved.
              </p>
              <button
                className="button secondary"
                onClick={() => setDemo(true)}
              >
                View labeled demo chart
              </button>
            </div>
          )}
          {demo && !hasReal && (
            <button className="text-link" onClick={() => setDemo(false)}>
              Hide demo data
            </button>
          )}
          <p className="chart-note">
            *Speaking = conversational response selection. Writing = editing
            knowledge. Scores are task-specific, not validated measures of
            fluency.
          </p>
        </section>
        <aside className="panel interpretation">
          <FlaskConical size={25} />
          <p className="eyebrow">READING THE RESULTS</p>
          <h3>Evidence before conclusions.</h3>
          <p>
            A score change describes performance on these questions. It does
            not, by itself, show that ChatGPT caused an improvement.
          </p>
          <div>
            <strong>Keep comparisons fair</strong>
            <p>
              Only matched Before and After records from the same browser and
              assessment version are included.
            </p>
          </div>
          <div>
            <strong>Understand the difference</strong>
            <p>
              A move from 60% to 75% is <b>+15 percentage points</b>. It is not
              a 15% relative increase.
            </p>
          </div>
          <div>
            <strong>Make limitations visible</strong>
            <p>
              The forms share a structure but have not been psychometrically
              equated. Practice effects, test difficulty, and other learning may
              influence results.
            </p>
          </div>
        </aside>
      </div>
      <section className="usage-section">
        <SectionHeading
          eyebrow="ACTIVITY, NOT LEARNING OUTCOMES"
          title="A look at how the platform is used."
        />
        <div className="usage-grid">
          {[
            ["Anonymous browser identifiers", summary?.browsers],
            ["Recorded visits", summary?.visits],
            ["Completed practice sessions", summary?.practiceSessions],
            ["Questions in completed practice", summary?.questionsAnswered],
            [
              "Average practice score",
              summary?.averagePractice != null
                ? `${summary.averagePractice}%`
                : undefined,
            ],
            ["AI learning exchanges", summary?.aiSessions],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <strong>{value ?? "—"}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="chart-note">
          Most practiced category:{" "}
          {summary?.mostPracticed || "No saved practice yet"}. Browser
          identifiers are not verified people, visits are not participants, and
          practice counts do not prove improvement.
        </p>
      </section>
      <Assessment onSaved={() => void load()} />
      <section className="methodology-section">
        <SectionHeading
          eyebrow="THE METHOD BEHIND THE NUMBERS"
          title="One question. Four clear steps."
          description="A small exploratory study, designed to be explained clearly."
        />
        <div className="methodology-grid">
          {[
            {
              title: "Before Test",
              text: "Answer 8 questions independently to establish a baseline.",
            },
            {
              title: "ChatGPT-Assisted Practice",
              text: "Spend 15–20 minutes on guided learning, practice, and AI feedback.",
            },
            {
              title: "After Test",
              text: "Complete 8 comparable items in the same browser, without help.",
            },
            {
              title: "Results Analysis",
              text: "Compare paired scores and skill differences. Report the limitations.",
            },
          ].map((s, i) => (
            <article key={s.title}>
              <div>
                <span>0{i + 1}</span>
                {i < 3 && <ArrowRight size={19} />}
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
        <Notice>
          Exploratory methodology: voluntary, anonymous participation; two items
          per skill; no control group; no enforced study duration. This is not a
          standardized CEFR test. Larger samples, independently rated
          speaking/writing tasks, and a control group would strengthen future
          research.
        </Notice>
      </section>
    </>
  );
}

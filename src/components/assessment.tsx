"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Check, LoaderCircle } from "lucide-react";
import type {
  PublicQuestion,
  AssessmentType,
  AssessmentResult,
  Answer,
} from "@/lib/types";
import { api } from "@/lib/client";
import { Notice } from "./ui";
type SessionState = {
  storage: boolean;
  assessments: AssessmentResult[];
  canTakeAfter: boolean;
};
export function Assessment({ onSaved }: { onSaved: () => void }) {
  const [state, setState] = useState<SessionState | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [type, setType] = useState<AssessmentType>("before");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const locked = useRef(false);
  async function refresh() {
    setError("");
    try {
      setState(await api<SessionState>("/api/session"));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Assessment status is unavailable.",
      );
    }
  }
  useEffect(() => {
    let live = true;
    api<SessionState>("/api/session")
      .then((s) => {
        if (live) setState(s);
      })
      .catch(() => {
        if (live) setError("Assessment status is unavailable. Please retry.");
      });
    return () => {
      live = false;
    };
  }, []);
  async function start(t: AssessmentType) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const data = await api<{ questions: PublicQuestion[] }>(
        `/api/assessment?type=${t}`,
      );
      setQuestions(data.questions);
      setType(t);
      setAnswers([]);
      setIndex(0);
      setResult(null);
      setActive(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The assessment could not start.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  async function submit() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const data = await api<{ result: AssessmentResult }>("/api/assessment", {
        type,
        answers,
      });
      setResult(data.result);
      setActive(false);
      await refresh();
      onSaved();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Your assessment was not saved. Please retry.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  const before = state?.assessments.find((a) => a.assessment_type === "before");
  const after = state?.assessments.find((a) => a.assessment_type === "after");
  const q = questions[index];
  const answer = answers.find((a) => a.questionId === q?.id)?.answer || "";
  return (
    <section className="assessment-section panel" id="assessment">
      <div className="assessment-heading">
        <div>
          <p className="eyebrow">YOUR PART IN THE EXPERIMENT</p>
          <h2>Begin with a baseline.</h2>
        </div>
        <ClipboardCheck size={27} />
      </div>
      <p className="muted assessment-description">
        Take a short test, practice with the platform, then take a comparable
        follow-up. Keep using the same browser so your two results can be
        paired.
      </p>
      {active ? (
        <div className="assessment-test">
          <div className="quiz-progress-label">
            <span className="tag">RESEARCH · {type.toUpperCase()} TEST</span>
            <span>
              Question {index + 1} of {questions.length}
            </span>
          </div>
          <progress
            value={answers.length}
            max={questions.length}
            aria-label="Assessment progress"
          />
          <p className="eyebrow">{q.skill.toUpperCase()}</p>
          <h3>{q.question}</h3>
          <fieldset className="answer-options" disabled={busy}>
            <legend className="sr-only">Choose an assessment answer</legend>
            {q.options?.map((option, i) => (
              <label
                key={option}
                className={`answer-option ${answer === option ? "selected" : ""}`}
              >
                <input
                  name="assessment-answer"
                  type="radio"
                  value={option}
                  checked={answer === option}
                  onChange={() =>
                    setAnswers((a) => [
                      ...a.filter((v) => v.questionId !== q.id),
                      { questionId: q.id, answer: option },
                    ])
                  }
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <p className="quiz-footnote">
            No corrections are shown during the experiment. Please answer
            independently without AI or notes.
          </p>
          <div className="button-row">
            <button
              className="button secondary"
              disabled={index === 0 || busy}
              onClick={() => setIndex((i) => i - 1)}
            >
              Previous
            </button>
            {index < questions.length - 1 ? (
              <button
                className="button"
                disabled={!answer || busy}
                onClick={() => setIndex((i) => i + 1)}
              >
                Next Question <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="button"
                disabled={answers.length !== questions.length || busy}
                onClick={submit}
              >
                {busy ? (
                  <LoaderCircle size={16} className="loading-spin" />
                ) : null}
                {busy ? "Saving…" : "Submit Assessment"}
              </button>
            )}
            <button
              className="text-link"
              disabled={busy}
              onClick={() => {
                setActive(false);
                setError("");
              }}
            >
              Exit without saving
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="assessment-stages">
            <div className={`assessment-stage ${before ? "finished" : ""}`}>
              <span>01</span>
              <h3>Before Assessment</h3>
              <p>8 questions · About 5 minutes</p>
              {before ? (
                <strong>
                  <Check size={16} /> Saved · {before.total_score}%
                </strong>
              ) : (
                <button
                  className="button secondary"
                  disabled={busy || !state?.storage}
                  onClick={() => start("before")}
                >
                  Start Before Test <ArrowRight size={15} />
                </button>
              )}
            </div>
            <div className="assessment-stage">
              <span>02</span>
              <h3>Learn & practice</h3>
              <p>Spend 15–20 minutes learning.</p>
              <Link href="/practice" className="button secondary">
                Open Practice <ArrowRight size={15} />
              </Link>
            </div>
            <div className={`assessment-stage ${after ? "finished" : ""}`}>
              <span>03</span>
              <h3>After Assessment</h3>
              <p>8 comparable questions</p>
              {after ? (
                <strong>
                  <Check size={16} /> Saved · {after.total_score}%
                </strong>
              ) : (
                <button
                  className="button secondary"
                  disabled={busy || !before || !state?.canTakeAfter}
                  onClick={() => start("after")}
                >
                  Start After Test <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
          {!state && !error && (
            <Notice>Checking your assessment status…</Notice>
          )}
          {state && !state.storage && (
            <Notice>
              Research assessments become available when the research database
              is connected. You can explore learning and practice now.
            </Notice>
          )}
          {before && !after && !state?.canTakeAfter && (
            <Notice>
              Complete and save a practice session, or use the AI assistant,
              after your Before test to unlock the After test.{" "}
              <button className="text-link" onClick={refresh}>
                Refresh status
              </button>
            </Notice>
          )}
          {result && (
            <Notice>
              Your {result.assessment_type} assessment is saved:{" "}
              {result.total_score}%.{" "}
              {result.assessment_type === "before"
                ? "Next, spend time learning before the follow-up test."
                : "Your matched pair is now included in the research results."}
            </Notice>
          )}
          {before && after && (
            <div className="personal-comparison">
              <strong>Your matched comparison</strong>
              <span>
                {before.total_score}% → {after.total_score}%
              </span>
              <p>
                {after.total_score - before.total_score >= 0 ? "+" : ""}
                {after.total_score - before.total_score} percentage points. This
                short test describes performance on these tasks; it is not a
                certified English level.
              </p>
            </div>
          )}
        </>
      )}
      {error && (
        <Notice error>
          {error}
          {!active && (
            <button className="text-link" onClick={refresh}>
              Retry status
            </button>
          )}
        </Notice>
      )}
      <p className="assessment-caveat">
        Participation is optional. The first submission for each test is final.
        Speaking items assess conversational response selection; writing items
        assess editing knowledge. Neither measures full productive language
        ability.
      </p>
    </section>
  );
}

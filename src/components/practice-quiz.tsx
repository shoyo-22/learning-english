"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  RotateCcw,
  Trophy,
  Sparkles,
  LoaderCircle,
  Target,
} from "lucide-react";
import {
  categories,
  levels,
  type Level,
  type Category,
  type PublicQuestion,
  type Answer,
} from "@/lib/types";
import { api, initSession, track } from "@/lib/client";
import { Notice } from "./ui";
import { PracticeHistory } from "./practice-history";
type Feedback = { correct: boolean; answer: string; explanation: string };
export function PracticeQuiz() {
  const [level, setLevel] = useState<Level>("A2");
  const [category, setCategory] = useState<Category | "All categories">(
    "All categories",
  );
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"setup" | "quiz" | "done">("setup");
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const runId = useRef("");
  const locked = useRef(false);
  useEffect(() => {
    void initSession();
  }, []);
  async function start() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await initSession();
      const data = await api<{ questions: PublicQuestion[] }>(
        `/api/practice?level=${level}&category=${encodeURIComponent(category)}`,
      );
      if (!data.questions.length)
        throw new Error("No questions are available for this selection.");
      setQuestions(data.questions);
      setIndex(0);
      setAnswers([]);
      setAnswer("");
      setScore(0);
      setFeedback(null);
      setSaved(false);
      setReviews([]);
      runId.current = crypto.randomUUID();
      setStage("quiz");
      void track("practice_started", `${level}: ${category}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Practice could not start. Please retry.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  async function check() {
    if (!answer.trim() || locked.current || feedback) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const data = await api<Feedback>("/api/practice", {
        action: "check",
        questionId: questions[index].id,
        answer,
      });
      setFeedback(data);
      setReviews((r) => [...r, data]);
      setAnswers((a) => [...a, { questionId: questions[index].id, answer }]);
      if (data.correct) setScore((s) => s + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  async function save() {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await api("/api/practice", {
        action: "complete",
        runId: runId.current,
        level,
        category,
        answers,
      });
      setSaved(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Your result could not be saved.",
      );
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }
  function next() {
    if (index + 1 === questions.length) {
      setStage("done");
      void save();
    } else {
      setIndex((i) => i + 1);
      setAnswer("");
      setFeedback(null);
      setError("");
    }
  }
  if (stage === "setup")
    return (
      <>
        <div className="practice-layout">
          <div className="panel practice-setup">
            <div className="skill-icon mint">
              <Target size={25} />
            </div>
            <h2>Make this session yours.</h2>
            <p className="muted">
              Pick your level and a focus. We’ll take it one question at a time.
            </p>
            <label className="field-label">Your English level</label>
            <div className="level-grid">
              {levels.map((l, i) => (
                <button
                  aria-pressed={level === l}
                  className={`level-option ${level === l ? "active" : ""}`}
                  key={l}
                  onClick={() => setLevel(l)}
                >
                  <strong>{l}</strong>
                  <span>
                    {
                      [
                        "Beginner",
                        "Elementary",
                        "Intermediate",
                        "Upper intermediate",
                      ][i]
                    }
                  </span>
                </button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="category">What would you like to practice?</label>
              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Category | "All categories")
                }
              >
                <option>All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="setup-bottom">
              <span>
                {category === "All categories" ? "10" : "2"} questions · Untimed
                · Instant feedback
              </span>
              <button className="button" disabled={busy} onClick={start}>
                {busy ? (
                  <LoaderCircle size={16} className="loading-spin" />
                ) : null}
                Start Practice <ArrowRight size={17} />
              </button>
            </div>
            {error && <Notice error>{error}</Notice>}
          </div>
          <aside className="panel practice-aside">
            <Sparkles size={25} />
            <h3>A little practice adds up.</h3>
            <ol className="steps-list">
              <li>
                <span>01</span>Choose the answer that feels right.
              </li>
              <li>
                <span>02</span>Read the feedback and understand the rule.
              </li>
              <li>
                <span>03</span>Keep going. Mistakes are part of learning.
              </li>
            </ol>
            <p>
              Your first answer counts toward your score. Restart whenever you
              want to practice again.
            </p>
            <div className="tip">
              <Target size={18} />
              <p>Doing the research experiment? Take your Before test first.</p>
            </div>
            <Link className="text-link" href="/research#assessment">
              Explore the assessment <ArrowUpRight size={15} />
            </Link>
          </aside>
        </div>
        <PracticeHistory />
      </>
    );
  if (stage === "done")
    return (
      <div className="panel completion-card">
        <div className="completion-icon">
          <Trophy size={35} />
        </div>
        <p className="eyebrow">ONE MORE STEP FORWARD</p>
        <h2>Practice Complete</h2>
        <div className="big-score">
          {Math.round((score / questions.length) * 100)}
          <span>%</span>
        </div>
        <p>
          You answered{" "}
          <strong>
            {score} out of {questions.length}
          </strong>{" "}
          questions correctly.
        </p>
        <p className="muted">
          {score === questions.length
            ? "You understood every question in this set. Try a new level next."
            : "Review the explanations below, then give it another try."}
        </p>
        {busy && <Notice>Saving your result…</Notice>}
        {saved && (
          <Notice>
            <Check size={14} /> Your verified practice result has been saved.
          </Notice>
        )}
        {error && (
          <Notice error>
            {error}{" "}
            <button className="text-link" onClick={save} disabled={busy}>
              Retry saving
            </button>
          </Notice>
        )}
        <div className="button-row">
          <button className="button" onClick={start} disabled={busy}>
            <RotateCcw size={15} />
            Practice Again
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              setStage("setup");
              setError("");
            }}
          >
            Choose Another Level
          </button>
          <Link href="/learn" className="text-link">
            Return to Learning <ArrowRight size={15} />
          </Link>
        </div>
        <details className="review-details">
          <summary>Review your answers</summary>
          {answers.map((a, i) => (
            <div key={a.questionId}>
              <strong>
                {i + 1}. {questions[i].question}
              </strong>
              <p>
                Your answer: {a.answer} ·{" "}
                {reviews[i]?.correct ? "Correct" : "Incorrect"}
              </p>
              <p>Correct answer: {reviews[i]?.answer}</p>
              <p>{reviews[i]?.explanation}</p>
            </div>
          ))}
          <p>Restart to see each correction and explanation again.</p>
        </details>
        <Link href="/research#assessment" className="text-link">
          Continue your research experiment <ArrowRight size={15} />
        </Link>
      </div>
    );
  const q = questions[index];
  return (
    <div className="quiz-container">
      <div className="quiz-topline">
        <span className="tag">
          {level} ·{" "}
          {category === "All categories" ? "MIXED PRACTICE" : category}
        </span>
        <button
          className="text-link"
          disabled={busy}
          onClick={() => {
            setStage("setup");
            setError("");
          }}
        >
          <RotateCcw size={14} />
          Restart
        </button>
      </div>
      <div className="panel quiz-panel">
        <div className="quiz-progress-label">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>
            Score: {score}/{answers.length}
          </span>
        </div>
        <progress
          value={index + (feedback ? 1 : 0)}
          max={questions.length}
          aria-label="Quiz progress"
        />
        <p className="eyebrow">{q.category.toUpperCase()}</p>
        <h2>{q.question}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void check();
          }}
        >
          {q.options ? (
            <fieldset className="answer-options" disabled={!!feedback || busy}>
              <legend className="sr-only">Choose your answer</legend>
              {q.options.map((option, i) => (
                <label
                  key={option}
                  className={`answer-option ${answer === option ? "selected" : ""} ${feedback && option === feedback.answer ? "correct" : ""}`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={answer === option}
                    onChange={() => setAnswer(option)}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option}</span>
                  {feedback && option === feedback.answer && (
                    <Check size={17} />
                  )}
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="field">
              <label htmlFor="written-answer">Your answer</label>
              <input
                id="written-answer"
                maxLength={1000}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={!!feedback || busy}
                autoComplete="off"
                placeholder="Type your answer…"
              />
            </div>
          )}
          {feedback ? (
            <div
              className={`feedback ${feedback.correct ? "right" : "wrong"}`}
              role="status"
            >
              <strong>{feedback.correct ? "Correct!" : "Try again!"}</strong>
              {!feedback.correct && (
                <p>
                  Correct answer: <b>{feedback.answer}</b>
                </p>
              )}
              <p>{feedback.explanation}</p>
            </div>
          ) : null}
          {error && <Notice error>{error}</Notice>}
          <div className="quiz-bottom">
            <span>
              {feedback
                ? "Take a moment to understand the explanation."
                : "Take your time. You’re here to learn."}
            </span>
            {feedback ? (
              <button className="button" type="button" onClick={next}>
                {index + 1 === questions.length
                  ? "See Final Score"
                  : "Next Question"}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="button"
                type="submit"
                disabled={!answer.trim() || busy}
              >
                {busy ? "Checking…" : "Check Answer"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </form>
      </div>
      <p className="quiz-footnote">
        Practice mode · Feedback is shown after each answer.
      </p>
    </div>
  );
}

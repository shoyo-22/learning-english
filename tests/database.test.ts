import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import type { ResearchSummary } from "../src/lib/types";
test("PostgreSQL migration, RLS, atomic saves, paired aggregates, and durable budgets", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    await db.exec(
      await readFile("supabase/migrations/202609050001_initial.sql", "utf8"),
    );
    const sid = "11111111-1111-4111-8111-111111111111";
    const second = "22222222-2222-4222-8222-222222222222";
    const run = "33333333-3333-4333-8333-333333333333";
    await db.exec(`set role anon;`);
    await assert.rejects(() => db.query("select * from anonymous_sessions"));
    await assert.rejects(() => db.query("select research_summary()"));
    await db.exec("reset role; set role service_role;");
    await db.query(
      "insert into anonymous_sessions(session_id) values ($1),($2)",
      [sid, second],
    );
    await assert.rejects(
      () =>
        db.query(
          "select save_assessment($1,'after','v1',100,100,100,100,100)",
          [sid],
        ),
      /before_required/,
    );
    await db.query("select save_assessment($1,'before','v1',50,50,50,50,50)", [
      sid,
    ]);
    await assert.rejects(
      () =>
        db.query(
          "select save_assessment($1,'after','v1',100,100,100,100,100)",
          [sid],
        ),
      /practice_required/,
    );
    // Unpaired high baseline must not contaminate the matched average.
    await db.query(
      "select save_assessment($1,'before','v1',100,100,100,100,100)",
      [second],
    );
    const attempts = JSON.stringify([
      { question_id: "a1-1", is_correct: true, category: "Vocabulary" },
      { question_id: "a1-2", is_correct: false, category: "Vocabulary" },
    ]);
    await db.query("select save_quiz($1,$2,'A1','Vocabulary',2,1,50,$3)", [
      run,
      sid,
      attempts,
    ]);
    await db.query("select save_quiz($1,$2,'A1','Vocabulary',2,1,50,$3)", [
      run,
      sid,
      attempts,
    ]);
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int count from quiz_attempts",
        )
      ).rows[0].count,
      2,
    );
    await db.query("select save_assessment($1,'after','v1',100,50,100,50,75)", [
      sid,
    ]);
    await db.query("select save_assessment($1,'after','v1',0,0,0,0,0)", [sid]);
    const { rows } = await db.query<{ summary: ResearchSummary }>(
      "select research_summary() summary",
    );
    const s = rows[0].summary;
    assert.equal(s.pairs, 1);
    assert.equal(s.before, 50);
    assert.equal(s.after, 75);
    assert.equal(s.difference, 25);
    assert.equal(s.practiceSessions, 1);
    assert.equal(s.questionsAnswered, 2);
    assert.equal(s.browsers, 2);
    assert.equal(s.averagePractice, 50);
    assert.equal(s.skills[0].after, 100);
    for (let i = 0; i < 20; i++)
      assert.equal(
        (
          await db.query<{ ok: boolean }>("select reserve_ai_request($1) ok", [
            sid,
          ])
        ).rows[0].ok,
        true,
      );
    assert.equal(
      (
        await db.query<{ ok: boolean }>("select reserve_ai_request($1) ok", [
          sid,
        ])
      ).rows[0].ok,
      false,
    );
    // Invalid child insert must roll back the entire quiz transaction.
    await assert.rejects(() =>
      db.query(
        "select save_quiz('44444444-4444-4444-8444-444444444444',$1,'A1','Grammar',1,1,100,'[{\"is_correct\":true}]')",
        [sid],
      ),
    );
    assert.equal(
      (
        await db.query<{ count: number }>(
          "select count(*)::int count from quiz_sessions",
        )
      ).rows[0].count,
      1,
    );
  } finally {
    await db.close();
  }
});

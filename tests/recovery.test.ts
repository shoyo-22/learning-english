import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import type { ResearchSummary } from "../src/lib/types";
const initialPath = "supabase/migrations/202609050001_initial.sql";
const repairPath =
  "supabase/migrations/202609050002_restore_schema_and_rpc.sql";
const roles =
  "create role anon; create role authenticated; create role service_role bypassrls;";
for (const state of ["empty", "tables-only", "complete"] as const) {
  test(`recovery migration handles ${state}, preserves records, and can run twice`, async () => {
    const db = new PGlite();
    try {
      await db.exec(roles);
      const initial = await readFile(initialPath, "utf8");
      const repair = await readFile(repairPath, "utf8");
      if (state === "complete") await db.exec(initial);
      if (state === "tables-only")
        await db.exec(
          initial.slice(
            0,
            initial.indexOf("create function public.save_quiz"),
          ) + "commit;",
        );
      if (state !== "empty") {
        await db.exec(
          "insert into anonymous_sessions(session_id) values ('11111111-1111-4111-8111-111111111111'); insert into assessments(session_id,assessment_type,version,vocabulary_score,grammar_score,speaking_score,writing_score,total_score) values ('11111111-1111-4111-8111-111111111111','before','v1',50,50,50,50,50);",
        );
      }
      const before =
        state === "empty"
          ? []
          : (await db.query("select * from assessments")).rows;
      await db.exec(repair);
      await db.exec(repair);
      assert.deepEqual(
        (await db.query("select * from assessments")).rows,
        before,
      );
      const names = (
        await db.query<{ proname: string }>(
          "select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' order by proname",
        )
      ).rows.map((r) => r.proname);
      assert.deepEqual(names, [
        "research_summary",
        "reserve_ai_request",
        "save_assessment",
        "save_quiz",
      ]);
      for (const role of ["anon", "authenticated"]) {
        await db.exec(`set role ${role}`);
        await assert.rejects(
          () => db.query("select research_summary()"),
          /permission denied/,
        );
        await assert.rejects(
          () => db.query("select * from assessments"),
          /permission denied/,
        );
        await db.exec("reset role");
      }
      await db.exec("set role service_role");
      const summary = (
        await db.query<{ value: ResearchSummary }>(
          "select research_summary() as value",
        )
      ).rows[0].value;
      assert.equal(summary.pairs, 0);
      assert.equal(summary.before, null);
      assert.equal(summary.browsers, state === "empty" ? 0 : 1);
      if (state !== "empty") {
        await db.query(
          "select save_quiz('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','A1','Vocabulary',1,1,100,'[{\"question_id\":\"a1-1\",\"category\":\"Vocabulary\",\"is_correct\":true}]')",
        );
        await db.query(
          "select save_assessment('11111111-1111-4111-8111-111111111111','after','v1',100,100,100,100,100)",
        );
        const paired = (
          await db.query<{ value: ResearchSummary }>(
            "select research_summary() as value",
          )
        ).rows[0].value;
        assert.equal(paired.pairs, 1);
        assert.equal(paired.difference, 50);
      }
      await db.exec("reset role");
      const baseline = (await db.query("select research_summary() as summary"))
        .rows;
      await db.exec(
        await readFile("supabase/tests/smoke_rollback.sql", "utf8"),
      );
      assert.deepEqual(
        (await db.query("select research_summary() as summary")).rows,
        baseline,
      );
    } finally {
      await db.close();
    }
  });
}
test("incompatible existing tables fail atomically without deleting data", async () => {
  const db = new PGlite();
  try {
    await db.exec(roles);
    const repair = await readFile(repairPath, "utf8");
    await db.exec(
      "create table anonymous_sessions(session_id text primary key); insert into anonymous_sessions values ('keep-me');",
    );
    await assert.rejects(
      () => db.exec(repair),
      /uuid|incompatible|cannot be implemented/i,
    );
    await db.exec("rollback");
    assert.deepEqual(
      (await db.query("select session_id from anonymous_sessions")).rows,
      [{ session_id: "keep-me" }],
    );
    assert.equal(
      (
        await db.query<{ name: string | null }>(
          "select to_regclass('public.quiz_sessions')::text as name",
        )
      ).rows[0].name,
      null,
    );
  } finally {
    await db.close();
  }
});

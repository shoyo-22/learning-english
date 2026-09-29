import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import type { AdminResults } from "../src/lib/types";

const migrationPath =
  "supabase/migrations/202609290001_participant_names_admin.sql";
test("admin migration preserves history, limits private results, and restricts named data to service_role", async () => {
  const db = new PGlite();
  const ids = [
    "abcdef11-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
    "33333333-3333-4333-8333-333333333333",
    "44444444-4444-4444-8444-444444444444",
    "55555555-5555-4555-8555-555555555555",
  ];
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    for (const path of [
      "supabase/migrations/202609050001_initial.sql",
      "supabase/migrations/202609050002_restore_schema_and_rpc.sql",
    ])
      await db.exec(await readFile(path, "utf8"));
    for (const id of ids)
      await db.query("insert into anonymous_sessions(session_id) values ($1)", [
        id,
      ]);
    const assessment = async (
      id: string,
      type: string,
      score: number,
      at: string,
      version = "v1",
    ) =>
      db.query(
        "insert into assessments(session_id,assessment_type,version,vocabulary_score,grammar_score,speaking_score,writing_score,total_score,created_at) values ($1,$2,$3,$4,$4,$4,$4,$4,$5)",
        [id, type, version, score, at],
      );
    await assessment(ids[0], "before", 50, "2026-09-28T10:00:00Z");
    await assessment(ids[0], "after", 75, "2026-09-29T10:00:00Z");
    await assessment(ids[1], "before", 100, "2026-09-29T11:00:00Z");
    await assessment(ids[2], "before", 25, "2026-09-29T12:00:00Z");
    await assessment(ids[2], "after", 100, "2026-09-28T12:00:00Z"); // Not a chronological pair.
    await assessment(ids[4], "before", 100, "2026-09-29T13:00:00Z", "v2");
    for (const id of [ids[0], ids[3]])
      await db.query(
        'select save_quiz(gen_random_uuid(),$1,\'A2\',\'Grammar\',1,1,100,\'[{"question_id":"fixture","is_correct":true,"category":"Grammar"}]\')',
        [id],
      );
    const before = (await db.query("select * from assessments order by id"))
      .rows;
    const publicSummary = (await db.query("select research_summary() result"))
      .rows;
    const migration = await readFile(migrationPath, "utf8");
    await db.exec(migration);
    await db.exec(migration);
    assert.deepEqual(
      (await db.query("select * from assessments order by id")).rows,
      before,
    );
    const rename = async (name: string | null, id = ids[0]) =>
      (
        await db.query<{ name: string }>(
          "select set_participant_name($1,$2) name",
          [id, name],
        )
      ).rows[0].name;
    assert.equal(await rename("  Айгерим   A2  "), "Айгерим A2");
    assert.equal(await rename("Ab"), "Ab");
    assert.equal(await rename("A".repeat(40)), "A".repeat(40));
    for (const name of [
      null,
      "",
      "A",
      "A".repeat(41),
      "Ab\t",
      "Ab\n",
      "Ab\r",
      "Ab\x7f",
    ])
      await assert.rejects(() => rename(name), /invalid_name/);
    await assert.rejects(
      () => rename("Missing", "99999999-9999-4999-8999-999999999999"),
      /session_not_found/,
    );
    await rename("Айгерим");
    await rename("Practice only", ids[3]);
    const results = async (
      version = "v1",
      participants = 500,
      practice = 1000,
    ) =>
      (
        await db.query<{ result: AdminResults }>(
          "select admin_results($1,$2,$3) result",
          [version, participants, practice],
        )
      ).rows[0].result;
    const data = await results();
    assert.deepEqual(data.summary, {
      participants: 3,
      named: 1,
      pairs: 1,
      before: 50,
      after: 75,
      difference: 25,
      practiceSessions: 2,
    });
    assert.equal(data.participants[0].shortId, "333333");
    assert.equal(data.participants[0].difference, null);
    assert.equal(data.participants[1].name, null);
    assert.equal(data.participants[1].after, null);
    const named = data.participants.find((p) => p.shortId === "abcdef")!;
    assert.equal(named.name, "Айгерим");
    assert.equal(named.difference, 25);
    assert.equal(named.before?.grammar, 50);
    assert.equal(named.after?.writing, 75);
    assert.ok(data.practice.some((p) => p.name === "Practice only"));
    assert.ok(!data.participants.some((p) => p.name === "Practice only"));
    assert.deepEqual(data.truncated, { participants: false, practice: false });
    const limited = await results("v1", 1, 1);
    assert.deepEqual(limited.summary, data.summary);
    assert.equal(limited.participants.length, 1);
    assert.equal(limited.practice.length, 1);
    assert.deepEqual(limited.truncated, { participants: true, practice: true });
    assert.deepEqual((await results("v1", 3, 2)).truncated, {
      participants: false,
      practice: false,
    });
    for (const [p, q] of [
      [0, 1],
      [50001, 1],
      [1, 0],
      [1, 50001],
    ])
      await assert.rejects(() => results("v1", p, q), /invalid_limit/);
    const unpaired = await results("v2");
    assert.equal(unpaired.summary.pairs, 0);
    assert.equal(unpaired.summary.before, null);
    assert.equal(unpaired.summary.after, null);
    assert.equal(unpaired.summary.difference, null);
    assert.equal((await results("unknown")).participants.length, 0);
    for (const row of [...data.participants, ...data.practice])
      assert.match(row.shortId, /^[a-f0-9]{6}$/);
    for (const id of ids) assert.ok(!JSON.stringify(data).includes(id));
    await db.exec(migration);
    assert.equal(
      (await results()).participants.find((p) => p.shortId === "abcdef")?.name,
      "Айгерим",
    );
    assert.deepEqual(
      (await db.query("select research_summary() result")).rows,
      publicSummary,
    );
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(() => results(), /permission denied/);
      await assert.rejects(() => rename("Unauthorized"), /permission denied/);
      await assert.rejects(
        () => db.query("select display_name from anonymous_sessions"),
        /permission denied/,
      );
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    assert.equal(await rename("Renamed"), "Renamed");
    assert.equal(
      (await results()).participants.find((p) => p.shortId === "abcdef")?.name,
      "Renamed",
    );
    assert.equal(
      (await results()).practice.find((p) => p.shortId === "abcdef")?.name,
      "Renamed",
    );
  } finally {
    await db.close();
  }
});

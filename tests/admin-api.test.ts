import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.TEST_ADMIN_BASE_URL;
const password = process.env.TEST_ADMIN_PASSWORD;
// This suite creates test scores. Opt in only against a disposable local database.
const enabled =
  process.env.TEST_ADMIN_FIXTURE === "1" &&
  !!base &&
  !!password &&
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname);
test(
  "isolated HTTP flow saves named tests and practice, protects results, exports CSV, and logs out",
  { skip: !enabled },
  async () => {
    const cookies = (response: Response) =>
      response.headers
        .getSetCookie()
        .map((value) => value.split(";")[0])
        .join("; ");
    const request = (
      path: string,
      body?: unknown,
      cookie = "",
      method = body === undefined ? "GET" : "POST",
      origin = base!,
    ) =>
      fetch(`${base}${path}`, {
        method,
        headers: {
          Cookie: cookie,
          Origin: origin,
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    const session = await request("/api/session");
    const student = cookies(session);
    const state = await session.json();
    assert.equal(state.storage, true);
    assert.equal(state.participantReady, true);
    assert.equal(state.participantName, null);
    assert.equal((await request("/api/admin/results")).status, 401);
    assert.equal(
      (await request("/api/admin/export?kind=assessments")).status,
      401,
    );
    assert.equal(
      (await request("/api/admin/session", { password: "incorrect-password" }))
        .status,
      401,
    );
    assert.equal(
      (
        await request(
          "/api/admin/session",
          { password },
          "",
          "POST",
          "https://untrusted.example",
        )
      ).status,
      403,
    );
    const login = await request("/api/admin/session", { password });
    assert.equal(login.status, 200);
    assert.match(login.headers.get("set-cookie") || "", /HttpOnly/i);
    assert.match(login.headers.get("set-cookie") || "", /SameSite=Strict/i);
    assert.match(login.headers.get("set-cookie") || "", /Max-Age=28800/i);
    const admin = cookies(login);
    assert.equal(
      (await request("/api/admin/results", undefined, admin + "tampered"))
        .status,
      401,
    );
    const answers = async (type: string) => {
      const data = await (
        await request(`/api/assessment?type=${type}`, undefined, student)
      ).json();
      return data.questions.map((q: { id: string; options: string[] }) => ({
        questionId: q.id,
        answer: q.options[0],
      }));
    };
    const beforeAnswers = await answers("before");
    assert.equal(
      (
        await request(
          "/api/assessment",
          { type: "before", answers: beforeAnswers },
          student,
        )
      ).status,
      409,
    );
    const name = `Проверка ${randomUUID().slice(0, 8)}`;
    const savedName = await request(
      "/api/participant",
      { name: `  ${name}  ` },
      student,
    );
    assert.equal(savedName.status, 200);
    assert.deepEqual(await savedName.json(), { name });
    assert.equal(
      (await (await request("/api/session", undefined, student)).json())
        .participantName,
      name,
    );
    const before = await request(
      "/api/assessment",
      { type: "before", answers: beforeAnswers },
      student,
    );
    assert.equal(before.status, 200);
    const initialResult = await before.json();
    assert.equal(initialResult.saved, true);
    const retry = await (
      await request(
        "/api/assessment",
        { type: "before", answers: beforeAnswers },
        student,
      )
    ).json();
    assert.deepEqual(retry, initialResult);
    assert.equal(
      (
        await request(
          "/api/assessment",
          { type: "after", answers: await answers("after") },
          student,
        )
      ).status,
      409,
    );
    const questions = (
      await (
        await request(
          "/api/practice?level=A1&category=Vocabulary",
          undefined,
          student,
        )
      ).json()
    ).questions;
    const run = {
      action: "complete",
      runId: randomUUID(),
      level: "A1",
      category: "Vocabulary",
      answers: questions.map((q: { id: string; options?: string[] }) => ({
        questionId: q.id,
        answer: q.options?.[0] || "example",
      })),
    };
    const practice = await request("/api/practice", run, student);
    assert.equal(practice.status, 200);
    assert.equal((await practice.json()).saved, true);
    assert.equal((await request("/api/practice", run, student)).status, 200);
    assert.equal(
      (
        await request(
          "/api/assessment",
          { type: "after", answers: await answers("after") },
          student,
        )
      ).status,
      200,
    );
    const response = await request("/api/admin/results", undefined, admin);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const data = await response.json();
    const row = data.participants.find(
      (p: { name: string }) => p.name === name,
    );
    assert.ok(row.before && row.after);
    assert.equal(typeof row.difference, "number");
    assert.match(row.shortId, /^[a-f0-9]{6}$/);
    assert.ok(!JSON.stringify(data).includes(initialResult.result.session_id));
    assert.equal(
      data.practice.filter((p: { name: string }) => p.name === name).length,
      1,
    );
    const publicResponse = await request("/api/research");
    assert.ok(!(await publicResponse.text()).includes(name));
    for (const kind of ["assessments", "practice"]) {
      const exported = await request(
        `/api/admin/export?kind=${kind}`,
        undefined,
        admin,
      );
      assert.equal(exported.status, 200);
      assert.match(exported.headers.get("content-type") || "", /text\/csv/);
      const bytes = Buffer.from(await exported.arrayBuffer());
      assert.deepEqual([...bytes.subarray(0, 3)], [239, 187, 191]);
      assert.ok(bytes.toString().includes(name));
    }
    assert.equal(
      (await request("/api/admin/export?kind=unknown", undefined, admin))
        .status,
      400,
    );
    assert.equal(
      (
        await request(
          "/api/admin/session",
          undefined,
          admin,
          "DELETE",
          "https://untrusted.example",
        )
      ).status,
      403,
    );
    const logout = await request(
      "/api/admin/session",
      undefined,
      admin,
      "DELETE",
    );
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get("set-cookie") || "", /Max-Age=0/i);
    assert.equal(
      (await request("/api/admin/results", undefined, cookies(logout))).status,
      401,
    );
    for (let i = 0; i < 4; i++)
      await request("/api/admin/session", { password: "bad-password" });
    assert.equal(
      (await request("/api/admin/session", { password })).status,
      429,
    );
  },
);

import test from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL;
test(
  "local HTTP APIs validate inputs, withhold keys, and fail honestly without credentials",
  { skip: !base },
  async () => {
    const post = (path: string, data: unknown, origin = base!) =>
      fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: JSON.stringify(data),
      });
    const session = await fetch(`${base}/api/session`);
    assert.equal(session.status, 200);
    assert.match(session.headers.get("set-cookie") || "", /httponly/i);
    const info = await session.json();
    assert.equal(info.storage, false);
    const q = await (
      await fetch(`${base}/api/practice?level=B2&category=Grammar`)
    ).json();
    assert.equal(q.questions.length, 2);
    assert.ok(
      q.questions.every(
        (v: Record<string, unknown>) =>
          !("answer" in v) && !("explanation" in v),
      ),
    );
    const check = await post("/api/practice", {
      action: "check",
      questionId: "a1-1",
      answer: "small",
    });
    assert.equal(check.status, 200);
    assert.equal((await check.json()).correct, true);
    assert.equal(
      (
        await post(
          "/api/practice",
          { action: "check", questionId: "a1-1", answer: "small" },
          "https://untrusted.example",
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await post("/api/practice", {
          action: "check",
          questionId: "a1-1",
          answer: "small",
          score: 100,
        })
      ).status,
      400,
    );
    assert.equal(
      (await post("/api/ai", { messages: [{ role: "user", content: " " }] }))
        .status,
      400,
    );
    const ai = await post("/api/ai", {
      messages: [
        {
          role: "user",
          content: "Correct my sentence: I go to school yesterday.",
        },
      ],
    });
    assert.equal(ai.status, 200);
    const reply = await ai.json();
    assert.equal(reply.mode, "demo");
    assert.equal(reply.tracked, false);
    assert.match(reply.message, /I went to school yesterday/);
    const assessment = await (
      await fetch(`${base}/api/assessment?type=before`)
    ).json();
    assert.equal(assessment.questions.length, 8);
    assert.ok(
      assessment.questions.every(
        (v: Record<string, unknown>) =>
          !("answer" in v) && !("explanation" in v),
      ),
    );
    assert.equal(
      (await post("/api/assessment", { type: "after", answers: [] })).status,
      400,
    );
    const research = await fetch(`${base}/api/research`);
    assert.equal(research.status, 503);
    assert.ok(!("summary" in (await research.json())));
  },
);

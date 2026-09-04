import test from "node:test";
import assert from "node:assert/strict";
import { demoTutor } from "../src/lib/demo-tutor";
test("demo handles supported corrections and grammar follow-up without inventing reviews", () => {
  const ask = (content: string) => demoTutor([{ role: "user", content }]);
  assert.match(
    ask("Correct my sentence: I go to school yesterday."),
    /I went to school yesterday/,
  );
  assert.match(ask("He didn’t went home."), /He didn’t go home/);
  assert.match(
    ask("Check my paragraph: Yesterday my cat invented a new planet."),
    /I have not assessed your paragraph/,
  );
  const lesson = ask("Explain Present Perfect simply.");
  assert.match(
    demoTutor([
      { role: "user", content: "Explain Present Perfect simply." },
      { role: "assistant", content: lesson },
      { role: "user", content: "have" },
    ]),
    /Correct!/,
  );
  assert.match(ask("What is the weather in London?"), /scripted learning demo/);
});
test("demo vocabulary and speaking use bounded prepared content", () => {
  assert.match(
    demoTutor([
      { role: "user", content: "Give me five B1 words about technology." },
    ]),
    /Device/,
  );
  const first = demoTutor([
    { role: "user", content: "Ask me an English speaking question." },
  ]);
  const next = demoTutor([
    { role: "user", content: "Ask me an English speaking question." },
    { role: "assistant", content: first },
    { role: "user", content: "I enjoy music." },
  ]);
  assert.notEqual(first, next);
  assert.match(next, /does not judge your answer/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  signAdminToken,
  verifyAdminToken,
  passwordMatches,
} from "../src/lib/admin-auth";
import { csv, resultsCsv } from "../src/lib/csv";
import { adminLoginSchema, participantSchema } from "../src/lib/validation";
import type { AdminResults } from "../src/lib/types";

test("admin tokens expire, resist tampering, and are revoked by password or secret rotation", () => {
  const secret = "test-secret-".repeat(4),
    password = "test-password",
    expires = 2_000_000;
  const token = signAdminToken(secret, password, expires);
  assert.equal(verifyAdminToken(token, secret, password, expires - 1), true);
  assert.equal(verifyAdminToken(token, secret, password, expires), false);
  assert.equal(verifyAdminToken(token, secret, "new-password", 1), false);
  assert.equal(verifyAdminToken(token, "other-secret", password, 1), false);
  for (const invalid of [
    undefined,
    null,
    {},
    23,
    "",
    "garbage",
    token + ".extra",
    token.replace(/^2/, "3"),
    "9999999999999999." + "a".repeat(64),
    token.slice(0, -1) + "z",
    "2000000." + "0".repeat(64),
  ]) {
    assert.equal(verifyAdminToken(invalid, secret, password, 1), false);
  }
  assert.equal(passwordMatches(password, password), true);
  assert.equal(passwordMatches("", password), false);
  assert.equal(passwordMatches(password + " ", password), false);
  assert.equal(
    adminLoginSchema.safeParse({ password, role: "admin" }).success,
    false,
  );
  assert.equal(
    adminLoginSchema.safeParse({ password: "a".repeat(201) }).success,
    false,
  );
});

test("participant names normalize spaces and reject control characters, invalid lengths, and extra fields", () => {
  assert.deepEqual(participantSchema.parse({ name: "  Айгерим   A2  " }), {
    name: "Айгерим A2",
  });
  for (const name of ["Ab", "a".repeat(40)])
    assert.equal(participantSchema.safeParse({ name }).success, true);
  for (const name of [
    " ",
    "A",
    "a".repeat(41),
    "\tAb",
    "Ab\n",
    "Ab\r",
    "Ab\0",
    "Ab\x7f",
  ])
    assert.equal(participantSchema.safeParse({ name }).success, false, name);
  assert.equal(
    participantSchema.safeParse({ name: "Ab", session_id: "another" }).success,
    false,
  );
});

test("CSV preserves Cyrillic, quotes, line breaks, nulls and numbers while neutralizing formulas", () => {
  assert.equal(
    csv([["Айгерим", 'a,"b"', "a\nb", null, 2.5, -25]]),
    '\uFEFFАйгерим,"a,""b""","a\nb",,2.5,-25\r\n',
  );
  for (const prefix of ["=", "+", "-", "@", "\t", "\r"])
    assert.ok(csv([[prefix + "cmd"]]).includes("'" + prefix + "cmd"));
  const data: AdminResults = {
    summary: {
      participants: 1,
      named: 1,
      pairs: 0,
      before: null,
      after: null,
      difference: null,
      practiceSessions: 0,
    },
    participants: [
      {
        shortId: "abc123",
        name: "=student",
        before: {
          total: 50,
          vocabulary: 0,
          grammar: 100,
          speaking: 50,
          writing: 50,
          at: "2026-09-29T16:00:00+06:00",
        },
        after: null,
        difference: null,
        lastActivityAt: "2026-09-29T10:00:00Z",
      },
    ],
    practice: [],
    truncated: { participants: false, practice: false },
  };
  const output = resultsCsv(data, "assessments");
  assert.match(
    output,
    /'\=student,abc123,50,0,100,50,50,2026-09-29T10:00:00.000Z/,
  );
  assert.equal(output.split("\r\n")[0].split(",").length, 15);
  assert.equal(output.split("\r\n")[1].split(",").length, 15);
  assert.equal(
    resultsCsv(data, "practice"),
    "\uFEFFname,short_id,level,category,correct,total,percentage,completed_at\r\n",
  );
});

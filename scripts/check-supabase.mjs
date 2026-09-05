import { createClient } from "@supabase/supabase-js";
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || key.startsWith("sb_publishable_")) {
  console.error(
    "Missing SUPABASE_URL or a server secret in SUPABASE_SERVICE_ROLE_KEY. Check .env.local.",
  );
  process.exit(1);
}
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (u, init) =>
      fetch(u, { ...init, signal: AbortSignal.timeout(12000) }),
  },
});
const tables = {
  anonymous_sessions: "session_id,created_at,last_seen_at",
  quiz_sessions:
    "id,session_id,level,category,total_questions,correct_answers,score_percentage,completed_at",
  quiz_attempts:
    "id,run_id,session_id,question_id,category,is_correct,created_at",
  assessments:
    "id,session_id,assessment_type,version,vocabulary_score,grammar_score,speaking_score,writing_score,total_score,created_at",
  ai_usage: "id,session_id,created_at",
  activity_events: "id,session_id,name,detail,created_at",
  ai_budgets: "bucket,requests,expires_at",
};
let failed = false;
for (const [name, columns] of Object.entries(tables)) {
  // Use a real GET with zero returned rows. HEAD responses may conceal errors.
  const { error } = await db.from(name).select(columns).limit(0);
  failed ||= !!error;
  console.log(
    `${error ? "FAIL" : "OK"} table ${name}${error ? ` (${error.code || "connection error"})` : ""}`,
  );
}
const { data, error } = await db.rpc("research_summary");
const summaryValid =
  !error && typeof data?.pairs === "number" && Array.isArray(data?.skills);
failed ||= !summaryValid;
console.log(
  `${summaryValid ? "OK" : "FAIL"} RPC research_summary${error ? ` (${error.code || "connection error"})` : ""}`,
);
// Do not invoke mutation RPCs to test their existence or write synthetic research evidence.
console.log(
  "Read-only check: no credentials, participant rows, or aggregate values were printed.",
);
if (failed)
  console.error(
    "Apply 202609050002_restore_schema_and_rpc.sql in the project SQL Editor, then rerun this check.",
  );
process.exitCode = failed ? 1 : 0;

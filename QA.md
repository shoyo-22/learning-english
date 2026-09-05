# Verification record

Checked locally on 5 September 2026.

## Automated checks

- Strict TypeScript: passed.
- ESLint: passed with no warnings.
- Production Next.js build: passed, including all eight UI routes and six API route groups.
- Domain tests: question coverage across A1–B2 and every category, answer normalization, rejection of duplicate/missing/unknown answers, input limits and untrusted score fields, comparable assessment skill structure, percentage-point arithmetic, and fractional assessment scores.
- PostgreSQL integration test: executed the actual migration in an isolated PGlite instance; verified RLS/role restrictions, atomic quiz rollback, retry idempotency, first-assessment preservation, Before/practice/After ordering, matched-only aggregation, and durable AI request limits.
- HTTP checks against the running Next.js server: valid practice scoring, withheld answer keys, HttpOnly cookie, malformed payload rejection, cross-origin rejection, safe unavailable-AI response, and unavailable-database response without invented results.

## Browser checks

Using the app’s browser preview:

- Desktop home and research layouts inspected at 1440 × 1000.
- Every main route checked at 390 × 844 with document width equal to viewport width: Home, Learn, Practice, AI Assistant, Prompts, Speaking, Research, About.
- Home additionally checked at 320px and 768px; no horizontal overflow.
- Mobile menu opens, navigates, and closes.
- Home Start Learning CTA works; learning tabs change methods, prompts, and examples.
- A1 multiple-choice correct and incorrect feedback, question progress, and 50% final score verified.
- A2 grammar feedback, 100% completion, Practice Again, and Restart verified on mobile.
- B1 fill-in answer and B2 written correction verified through the real scoring endpoint.
- Practice save failure is explicitly marked as unsaved and includes retry.
- Assistant examples populate the input; empty sending is disabled; missing credentials produce a clean error and retry control; clear conversation works.
- Prompt category filtering and actual clipboard contents verified.
- Speaking topic selection, five-question display, Copy Questions clipboard contents, and Try Another Topic verified.
- Research empty state, optional labeled demo chart, exact-value table, axes and legend inspected.
- Assessments are visibly disabled when storage is unavailable, with an explanation. Database tests verify the successful persistence and pairing logic.

## Fixes discovered during QA

- Corrected origin validation to work with the incoming browser Host header when Next.js uses a different internal URL; canonical `APP_URL` remains supported.
- Removed intrinsic hero-card width that caused mobile horizontal overflow.
- Kept fractional assessment scores (62.5%, rather than rounding to 63%).
- Included corrections and explanations in the final practice review.
- Added the Next.js smooth-scroll declaration to avoid navigation warnings.
- Increased mobile caption sizing and touch targets, and kept the conversation’s example label visible on small screens.

## External-service validation scope

Supabase is now configured and its recovery migration was applied through the authenticated project SQL Editor on 5 September 2026. Hosted verification is detailed below. A complete assessment submission through the browser was not performed against the live research database; successful writes were tested in a transaction that rolled back. The project has not been published to Vercel. The assistant is a scripted demo, so live OpenAI generation is outside this version’s scope.

## Demo-mode update

The OpenAI provider integration has now been replaced by a visibly labeled scripted tutor. Previous live-AI configuration requirements and unavailable-AI observations above describe the original version and are superseded by this update. Demo replies are never stored in `ai_usage` and do not unlock the After assessment. New tests cover prepared corrections, vocabulary, grammar follow-up, speaking progression, and honest unsupported-input responses.

Supabase configuration was found in `.env.example` with a publishable key in the service-role field. Settings were moved into ignored `.env.local`, the public key was preserved separately, and a random session signing secret was generated. A read-only, zero-row request reached the supplied project but returned `PGRST205` for `anonymous_sessions`. The user subsequently supplied a valid server secret key. The investigation and resolution are recorded below. No participant records were fetched or written.

## Supabase recovery verification

- The server secret was valid; SQL catalog inspection confirmed that the application tables and RPCs had not been installed. Earlier HEAD-only responses were not reliable evidence of table existence. The new diagnostic uses GET with `limit(0)` and explicit columns.
- Applied `202609050002_restore_schema_and_rpc.sql` successfully to the hosted project. All seven tables and four server RPCs are installed, RLS is enabled, and browser roles cannot access them. Existing migrations were preserved.
- `npm run db:check` passed for all tables and `research_summary` through the server secret key. It prints neither credentials nor participant rows.
- Ran the rollback smoke test in the hosted SQL Editor as `service_role`: passed permission checks, rejection of After without Before/practice, immutable first scores, duplicate quiz retry, and matched-pair aggregation. All synthetic research rows were rolled back.
- The local application’s `/api/research` returned HTTP 200 with `source: live`. The connected HTTP test is read-only and separate from the unavailable-storage test.
- In-memory tests additionally exercised recovery from empty, tables-only, and complete schemas, preserved existing assessments, applied recovery twice, and rejected an incompatible schema atomically. The reusable SQL smoke test also runs in these tests, with before/after aggregate equality proving fixture rollback.
- Final checks: TypeScript, ESLint, and production build passed. Connected test run: 13 passed, 1 intentionally skipped (the unavailable-storage HTTP scenario).
- Browser verification: Research displayed “LIVE DATABASE · ANONYMOUS RECORDS”, zero completed pairs, and an enabled Start Before Test button. No assessment was submitted.

## English / Russian / Kazakh localization

- Localized all eight pages, route metadata, navigation, instructional and research content, client errors, chart axes/legends/table labels, and accessibility labels. English exercises, answer options/explanations, prompts, and demo responses retain their teaching language and stable internal identifiers.
- Browser checks: language selection persisted across navigation and reload; switching Kazakh → Russian during a quiz preserved the selected answer and allowed correct scoring. Switching the finished result back to Kazakh preserved the score and translated the unavailable-storage notice.
- The practice completion check ran on an isolated local production server with Supabase disabled. It created no hosted research scores or practice activity.
- All eight routes had no horizontal overflow at 390px in Russian and Kazakh. Chart and exact-value table labels were checked in Kazakh. Header spacing was adjusted for 320px screens.
- Automated coverage checks validate translated content, static translation calls, bounded locale input, and matching interpolation placeholders. The HTTP localization check covers all eight pages in each of en/ru/kk plus invalid-cookie fallback.
- Final validation: 17 connected-mode tests passed; the unavailable-storage HTTP scenario passed separately on the isolated server. ESLint, strict TypeScript, and the final production build passed. Decimal scores use locale-aware formatting (62.5 in English; 62,5 in Russian and Kazakh).

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

## External-service limitations

No live Supabase project, OpenAI credentials/model, or Vercel deployment credentials were provided. Therefore:

- No real participant records were created or modified.
- The Supabase-hosted migration and real service-role transport still require a connected-project smoke test.
- Successful live OpenAI generation, its loading duration, and provider failure behavior cannot be certified from the unavailable-service test.
- The complete successful assessment UI-to-hosted-database journey must be smoke-tested after configuration; its scoring and PostgreSQL transaction logic pass local tests.
- The project has not been published to Vercel.

Use README.md to configure those services, then run the same-browser Before → practice → After flow and confirm the resulting aggregate. No local test fixture or demo score is presented as real research evidence.

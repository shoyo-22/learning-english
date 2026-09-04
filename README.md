# English Lab

An educational research application for **“The Importance of ChatGPT in Learning English.”** Built with Next.js 16 App Router, React, strict TypeScript, Tailwind CSS, Lucide icons, Recharts, Zod, Supabase PostgreSQL, and a scripted demo tutor.

## Run locally

Prerequisites: Node.js 22.13+ (tested with Node 24), npm, and—when enabling live services—a Supabase project with a server-side secret key.

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Next.js. Without credentials, educational pages, speaking prompts, prompt copying, and server-checked practice work. Practice explicitly reports that results were not saved; assessments remain disabled; research has an empty state and an optional **labeled demo chart**; the assistant provides clearly labeled prepared demo replies. There are no live AI calls or invented live statistics.

## Environment variables

All application credentials stay on the server. No `NEXT_PUBLIC_*` variables or browser Supabase client are needed.

| Variable                    | Purpose                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`              | Supabase project URL, from project settings.                                                                                                         |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key. Never use it in client code.                                                                                           |
| `SESSION_SECRET`            | At least 32 random characters; required alongside Supabase configuration for durable signed anonymous cookies. Generate with `openssl rand -hex 32`. |
| `APP_URL`                   | Optional canonical origin, such as `https://your-project.vercel.app`. Recommended in production; must match the URL the user visits.                 |

Never commit `.env.local`. Restart the development server after changing environment values. Do not paste secrets into project source or client code. In development without a session secret, a temporary signing key is used and no database writes are enabled; these anonymous cookies are not durable across server restarts.

## Supabase setup

1. Create a Supabase PostgreSQL project.
2. Open the SQL Editor with the project owner account.
3. Run **`supabase/migrations/202609050001_initial.sql`** once against a new database. Alternatively, use the Supabase CLI migration workflow for your linked project (`supabase db push`). The file creates tables, constraints, indexes, Row Level Security, permission grants, and transactional functions.
4. Add the URL, service-role key, and session secret to `.env.local` or your deployment environment.
5. Restart the app, complete a practice run, and check the Research activity metrics.

Tables:

- `anonymous_sessions`: signed-cookie browser identifiers, creation and last-seen times.
- `quiz_sessions`: completed practice runs with server-computed scores.
- `quiz_attempts`: question IDs and correctness for completed runs, written atomically with the run. Raw student answers are not stored.
- `assessments`: one immutable first Before and After submission per browser and assessment version.
- `ai_usage`: successful AI exchange metadata; no conversations.
- `activity_events`: visits, practice starts, answered-question events, copied prompts, and opened speaking topics.
- `ai_budgets`: atomic daily/global and hourly/browser API request budgets.

RLS is enabled on every table. Anonymous and authenticated browser roles cannot read or write these research tables or execute the server functions. The server uses its service-role key. There is no public research editor endpoint.

### Editing research data

Project title, author, supervisor, objectives, hypothesis, and conclusion are centralized in `src/data/project.ts`. The illustrative chart values are in `demoResearch` in the same file. They are **never seeded into PostgreSQL** and always remain labeled as demo data. Change or remove them there.

Actual research records are maintained through the protected Supabase project dashboard, not an unprotected student-facing editor. For authorized corrections, edit the relevant record in `assessments`, preserving its anonymous identifier, assessment version, and provenance in your separate research log. Keep `total_score` equal to the mean of the four skill scores. Export the `assessments` table as CSV from Supabase for your research dataset. Do not insert illustrative demo scores into the real dataset. App submissions themselves cannot overwrite existing assessments.

The grouped chart uses actual matched database records as soon as a pair exists; demo values are never mixed with those records. The database function `research_summary()` computes aggregate metrics, so the browser does not fetch entire tables.

## Demo assistant (no OpenAI account or key)

The assistant intentionally uses deterministic, prepared responses from `src/lib/demo-tutor.ts`. `/api/ai` validates input and returns `{ mode: "demo", tracked: false }`; it never contacts an AI provider. The OpenAI SDK and its environment variables have been removed.

Supported activities include the sample past-tense correction, curated mistake corrections, a Present Perfect explanation and follow-up, technology/travel vocabulary, and sequential speaking questions. Unknown requests receive a clear explanation of the demo limits. Arbitrary paragraphs are not falsely marked as reviewed. The UI labels the demo before sending and on assistant messages.

Messages go only to this application's server and are not persisted. Demo responses are not inserted into `ai_usage`, do not consume provider budgets, and do not unlock the After assessment. Complete a saved practice quiz for that step. Existing genuine historical AI records remain intact. The old AI metadata/budget tables remain for compatibility, but the demo does not write to them.

This version can demonstrate the product and platform-practice experiment. Its scripted assistant is not evidence about the effects of real ChatGPT; the research page explicitly states that limitation.

### Supabase key troubleshooting

Put real settings in `.env.local`, never `.env.example`. Next.js does not load `.env.example`.

`SUPABASE_SERVICE_ROLE_KEY` accepts a server-side secret key (`sb_secret_...`) or a legacy service-role key. A publishable key (`sb_publishable_...`) cannot perform this application's protected database operations. See [Supabase API key roles](https://supabase.com/docs/guides/getting-started/api-keys). Keep the table protections enabled; do not make research writes public to work around a missing server key.

## Research methodology and integrity

- Both assessments have eight items, two each for Vocabulary, Grammar, Speaking, and Writing, using different but structurally comparable forms.
- **Speaking measures conversational response selection; Writing measures editing knowledge.** This text-only instrument does not rate pronunciation, spoken fluency, or independent written production.
- No assessment answers or corrections are returned before or after submission. Answer keys are confined to server imports. Practice returns feedback only after an answer is submitted.
- Before scores must be saved first. A completed practice run or successful AI exchange after the Before record unlocks the After test. The server enforces this order transactionally. The suggested 15–20 minute duration is not enforced.
- First submissions are immutable per browser, type, and version. Retry requests return the saved record without inserting duplicates. Quiz run IDs provide idempotent saves.
- Aggregates include only matched Before/After records for version `v1`. Unpaired records do not affect averages. Changing the assessment requires a new version and corresponding aggregate query update; do not silently compare changed instruments.
- Differences are **percentage points**. Browser identifiers are not verified people. Visits, practice activity, and assessment pairs are separate metrics.
- One recorded visit means one app initialization per tab session where sessionStorage is available. It is not a verified person count. Question-answer events may include abandoned practice; the dashboard’s question count explicitly describes questions in completed practice.
- No control group, no standardized CEFR calibration, no psychometric equating, and only two items per skill: report these limitations during the defense. Before/After differences do not establish causation.
- Anonymous participation is optional. The same browser and cookies must be retained. The research database does not collect names, email, phone, exact location, or IP addresses. Infrastructure providers may keep their own operational logs.

## Code map

```text
src/app/                 Server-rendered routes and metadata
src/app/api/             Validated, small Route Handlers
src/components/          Interactive learning, practice, assistant, research UI
src/data/questions.ts    40 curated exercises: 10 per level, 2 per category
src/data/assessments.ts   Server-only assessment forms and version
src/data/learning.ts      Methods, examples, tips
src/data/prompts.ts       Copyable prompt library
src/data/speaking.ts      Seven speaking topics with five questions each
src/data/project.ts      Editable project information and labeled demo data
src/lib/server.ts        Sessions, database access, request limits, safe errors
src/lib/scoring.ts       Answer normalization and trusted scoring
supabase/migrations/     Reproducible PostgreSQL schema and aggregate functions
```

The primary language is English. Educational text is kept in centralized data files; a future translation dictionary can be added without duplicating page components. Styling uses CSS tokens and Tailwind tooling; semantic native controls are used where a component library would add unnecessary complexity. Animations are restrained CSS transitions and respect reduced-motion preferences.

## Quality checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

`npm test` runs scoring, bank coverage, input validation, and PostgreSQL integration tests using an isolated in-memory PGlite database. The migration itself is executed in those tests, including RLS privileges, first-submission preservation, missing-Before/learning rejection, atomic rollback, idempotent practice saves, matched aggregates, and AI budgets. These tests do not connect to your real database.

Optional API checks against a running, unconfigured local server:

```sh
TEST_BASE_URL=http://127.0.0.1:3000 npm test
```

`npm run format` formats the source. See `QA.md` for the executed checks and external-service validation limits.

## Deploy to Vercel

1. Push the repository to your own Git hosting project and import it into Vercel.
2. Select the Next.js preset and Node.js 22 or newer. Use `npm run build` and the default Next.js output; this app is not a static export.
3. Apply the Supabase migration before enabling research workflows.
4. Set the server environment variables in Vercel. Set `APP_URL` to the production origin or leave it unset for deployments with different preview origins; in that case requests must match the incoming Host header.
5. Deploy. Check the demo assistant, save one practice session, then complete the Before → practice → After flow in the same browser. Inspect saved records and compare the dashboard against them.

No separate backend, Redis, Docker, or custom domain is required. Supabase access uses HTTPS, not a long-lived database socket. Deployment credentials and a live project are required to publish; this repository does not provision external services automatically.

## Suggested presentation flow

Home → Learn → Demo assistant correction → Practice feedback → Prompts copy → Speaking topic → Research Before/After and methodology → About and conclusion. Use real research results only after collecting them; otherwise select the explicitly labeled example chart and explain that data collection is pending.

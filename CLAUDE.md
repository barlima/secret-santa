# Secret Santa — notes for Claude

Mobile-first Secret Santa web app for one family. Spec, mockups and the stage plan live in the claude.ai Project "Gift Randomizer" (`claude/secret-santa-project-description.md`, `claude/designs/*.dc.html`, `claude/implementation-plan.md`). Update the plan's "Etapy" and "Stan obecny" tables after each stage.

## Stack

- Next.js 16 (App Router, `src/`, alias `@/*`), React 19, TypeScript strict, Tailwind CSS v4 (tokens in `src/app/globals.css` → `@theme`).
- Supabase (Postgres + Auth), project ref `tuesactvqjcyetmkwysy` (eu-central-1). Hosted on Vercel (team `barlimas-projects`, project `secret-santa`).
- Fonts via `next/font/google`: Bricolage Grotesque (`font-display`, 600/800) and Figtree (`font-sans`).
- `src/proxy.ts` is Next 16's middleware: it refreshes the Supabase session cookie.
- Env vars are read lazily via `src/lib/supabase/env.ts` (never at module load), so `next build` works without them. CI builds with no Supabase env on purpose.

## Supabase clients (`src/lib/supabase/`)

| File | Use from | Acts as |
| --- | --- | --- |
| `client.ts` | Client Components | signed-in user, RLS |
| `server.ts` | Server Components / Actions / Route Handlers | signed-in user, RLS |
| `admin.ts` | Server Actions only (`server-only`) | secret key, bypasses RLS — only for creating/deleting auth users and claiming a participant |

Never read `assignments` with the admin client. Results must stay private via RLS.

## Database

- Migrations: `supabase/migrations/<timestamp>_<name>.sql`, applied with Supabase MCP `apply_migration`. The connector cancels SQL containing `delete` / `revoke` / `drop` — hand those to Bartek for the SQL Editor and verify afterwards with a query.
- After every DDL change: run `get_advisors` (security) and regenerate `src/lib/database.types.ts` with `generate_typescript_types`.
- `.mcp.json` points the Supabase MCP at the dev project in read-only mode. Never give it write access to production.

## Workflow

- One branch per stage (`feat/01-scaffold`, `feat/02-i18n`, …), PR into `main`. Vercel builds a preview for each push.
- Commit messages, PR titles and PR descriptions are always in English (chat with Bartek stays in Polish).
- `gh pr create` fails (GraphQL is blocked) — open PRs with `gh api repos/barlima/secret-santa/pulls -f title=… -f head=… -f base=main -F body=@file.md`.
- npm can't reach the registry from cloud Claude sessions. Verify through GitHub Actions (`gh run view --log-failed`) and Vercel build status (`gh api repos/barlima/secret-santa/commits/<sha>/statuses`). The Vercel connector gets 403 for the team — don't rely on it.
- `package-lock.json` is committed; CI runs `npm ci`. Cloud sessions can't update it (no npm registry, no artifact downloads), so when adding a dependency, ask Bartek to run `npm install <pkg>` locally and push the lockfile.
- Vercel build logs aren't reachable from cloud sessions. `vercel.json` pins the Next.js preset (the project was created before the app existed, as "Other").
- Secrets never go into the repo or chat. `SUPABASE_SECRET_KEY` is read only in `admin.ts`.

## UI conventions

- Design at 390 px first, one column, 16 px side padding (`px-4`), primary button pinned to the bottom.
- Body text ≥ 16 px, names 20–24 px, tap targets ≥ 44 px.
- Colours only through tokens: `red`, `red-dark`, `pine`, `pine-light`, `gold`, `gold-light`, `snow`, `sand`, `forest`, `moss`, `mist`, `error`. Gold only on dark surfaces or decoration.
- Respect `prefers-reduced-motion` for every animation.
- All user-facing copy goes through translations (PL / EN / DE) from stage 2 on.

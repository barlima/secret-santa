# Secret Santa — notes for Claude

Mobile-first Secret Santa web app for one family. Spec, mockups and the stage plan live in the claude.ai Project "Gift Randomizer" (`claude/secret-santa-project-description.md`, `claude/designs/*.dc.html`, `claude/implementation-plan.md`). Update the plan's "Etapy" and "Stan obecny" tables after each stage.

## Stack

- Next.js 16 (App Router, `src/`, alias `@/*`), React 19, TypeScript strict, Tailwind CSS v4 (tokens in `src/app/globals.css` → `@theme`).
- Supabase (Postgres + Auth), project ref `tuesactvqjcyetmkwysy` (eu-central-1). Hosted on Vercel (team `barlimas-projects`, project `secret-santa`).
- Fonts via `next/font/google`: Bricolage Grotesque (`font-display`, 600/800) and Figtree (`font-sans`).
- `src/proxy.ts` is Next 16's middleware: it refreshes the Supabase session cookie.
- Env vars are read lazily via `src/lib/supabase/env.ts` (never at module load), so `next build` works without them. CI builds with no Supabase env on purpose.

## Translations (`next-intl`, no locale in the URL)

- Locales `pl` (default), `en`, `de` in `src/i18n/config.ts`. `src/i18n/request.ts` picks the locale: `NEXT_LOCALE` cookie → `Accept-Language` → `pl`.
- Copy lives in `messages/{pl,en,de}.json`, namespaced per screen (`picker`, `setPassword`, `waiting`, `reveal`, `admin.*`, …). `en.json` is the source of key types (`src/i18n/global.d.ts`), so `t("…")` keys are type-checked.
- Add every new string to all three files. `npm run check:messages` (also in CI) fails on missing/extra keys, lost ICU arguments or unbalanced braces.
- Use ICU plurals for counts; Polish needs `one` / `few` / `many` / `other`.
- `<LanguageSwitcher tone="light" | "dark" />` (Server Component) posts to the `setLocale` Server Action, which sets the cookie for a year; the route re-renders in the new language. Put it on every screen.
- Server Components: `getTranslations("namespace")`. Client Components: `useTranslations("namespace")` (the root layout wraps everything in `NextIntlClientProvider`).

## Routes and sign-in

| Route | Who | What |
| --- | --- | --- |
| `/` | signed out | Name picker (`listParticipants`) |
| `/p/[id]` | signed out | Set password (first visit) or enter password; Server Actions in `src/app/p/[id]/actions.ts` |
| `/me` | signed in | Waiting room → reveal, chosen by `getMyDrawState()` (`src/lib/draw.ts`); live via `LiveRefresh` |
| `/admin`, `/admin/spouses`, `/admin/draw` | signed in admin | Admin panel tabs; `src/app/admin/layout.tsx` checks `is_admin`, shows the stale-draw banner and hosts the redraw prompt |

- `src/lib/supabase/proxy.ts` redirects signed-in visitors away from `/` and `/p/*` to `/me`, and signed-out visitors away from `/me` and `/admin` to `/`.
- Login uses a synthetic email `<participant-id>@santa.local` (`src/lib/auth/participant-email.ts`). Passwords: 6–72 characters.
- `setPassword`: admin client creates the auth user, then claims the participant with `update … where auth_user_id is null`; if nobody was claimed, the new auth user is deleted (`alreadyClaimed`). Claiming fires the draw trigger.
- Current user: `getCurrentParticipant()` in `src/lib/participants.ts` (`null` = signed out, `{ participant: null }` = signed in but removed by the admin).
- Public sign-ups must stay disabled in Supabase Auth; only the `setPassword` action creates users.
- Live updates: `participants` and `draw` are in the `supabase_realtime` publication (`assignments` never is). `src/app/me/LiveRefresh.tsx` calls `router.refresh()` on changes, every 15 s and when the tab becomes visible.
- Reveal: the own assignment is read through RLS with a join to the receiver's name. "Gift opened" lives in localStorage under `santa:opened:<participant>:<draw run_at>`, so a redraw shows a closed gift again.

## Admin panel

- Data: `getAdminData()` (`src/lib/admin.ts`, cached per request) reads participants, spouse pairs and the draw row as the admin through RLS. It never reads `assignments`.
- Server Actions in `src/app/admin/actions.ts` run as the signed-in admin: RLS and admin-only RPCs are the real guard. They return `AdminActionState` (`src/app/admin/state.ts`): `error`, `askRedraw`, `seq`, and the typed name on errors.
- Removing a participant deletes their login via the `participants_delete_auth_user` trigger. Resetting a password calls `rpc('reset_participant_password')` (deletes the login; the draw result stays).
- After a change to a finished draw the DB only sets `draw.stale`. Actions return `askRedraw`; pass results through `useRedrawCheck()` so the layout-level sheet asks "run a new draw?". The stale banner stays until `rpc('reset_draw')`.
- Confirmations use `ConfirmSheet` (native `<dialog>` bottom sheet).

## Supabase clients (`src/lib/supabase/`)

| File | Use from | Acts as |
| --- | --- | --- |
| `client.ts` | Client Components | signed-in user, RLS |
| `server.ts` | Server Components / Actions / Route Handlers | signed-in user, RLS |
| `admin.ts` | Server Actions only (`server-only`) | secret key, bypasses RLS — only `setPassword` (create the auth user, claim the participant). The admin panel does not use it. |

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
- Colours only through tokens: `red`, `red-dark`, `pine`, `pine-light`, `gold`, `gold-light`, `snow`, `sand`, `forest`, `moss`, `mist`, `ink`, `paper`, `line`, `divider`, `error`, `error-soft`; `pine-soft`, `wait`, `wait-soft`, `amber`, `amber-soft`; dark-screen decoration: `bulb-red`, `wire`, `socket`, `bulb-off`, `socket-off`, `chip-dashed`, `mist-dim`. Gold only on dark surfaces or decoration.
- Shared UI in `src/components/`: `icons.tsx`, `PasswordField`, `SubmitButton`, `SignOutButton`, `LanguageSwitcher`.
- Respect `prefers-reduced-motion` for every animation.
- All user-facing copy goes through translations (PL / EN / DE) from stage 2 on.

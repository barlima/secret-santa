# Secret Santa

A mobile-first Secret Santa app for one family: everyone picks their name, sets a password, and once the whole group has joined the app draws who buys a gift for whom. Each person sees only their own match.

Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Vercel

## Local development

```bash
cp .env.example .env.local   # fill in keys from Supabase → Project Settings → API Keys
npm install
npm run dev                   # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (run `npx next typegen` first on a fresh clone) |
| `npm run check:messages` | Checks that `messages/{pl,en,de}.json` have the same keys and ICU arguments |
| `npm test` | Unit tests (Node's test runner): locale negotiation, name helpers, string of lights, WCAG contrast of the colour tokens |
| `npm run test:e2e` | Playwright end-to-end run of the whole draw against a deployed URL (see below) |

## Structure

```
src/
  app/                 routes (App Router)
  components/          shared UI (LanguageSwitcher, …)
  i18n/                next-intl config, locale detection, setLocale action
  lib/supabase/        browser, server, admin and proxy clients
  lib/database.types.ts  generated from the Supabase schema
  proxy.ts             refreshes the Supabase session on each request
messages/              UI copy in Polish, English and German
scripts/               repo checks (translations)
tests/unit/            unit tests (no dependencies)
e2e/                   Playwright end-to-end test
supabase/migrations/   SQL migrations (tables, RLS, draw logic)
```

Database schema, draw rules and the stage plan are described in [CLAUDE.md](CLAUDE.md).

## End-to-end test

`e2e/draw.spec.ts` runs the whole event on a deployed app: the admin adds four test people and a spouse pair, everyone sets a password, and each person must see exactly one name (never themselves, never their spouse, every name once). It then removes the test people and resets the draw.

It writes real data, so it **refuses to run unless the admin is alone on the list**. Run it before adding the family.

```bash
npm install -D @playwright/test && npx playwright install chromium   # once
E2E_BASE_URL=https://<deployment> \
E2E_ADMIN_NAME="<admin full name>" \
E2E_ADMIN_PASSWORD=<admin password> \
E2E_VERCEL_BYPASS=<only for protected previews> \
npm run test:e2e
```

## Launch checklist

1. Supabase → Authentication → Sign In / Providers: "Allow new users to sign up" is **off**. Optionally turn on leaked password protection.
2. Run the end-to-end test once against production while the admin is alone.
3. Admin panel: reset the draw if it shows a banner, add **everyone**, pair the spouses.
4. Share the link. The draw runs by itself when the last person sets a password.

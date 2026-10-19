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
supabase/migrations/   SQL migrations (tables, RLS, draw logic)
```

Database schema, draw rules and the stage plan are described in [CLAUDE.md](CLAUDE.md).

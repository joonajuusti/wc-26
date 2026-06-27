<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database safety

NEVER run production database commands against the live tournament database. The
production DB (Turso, configured in `.env.local`) holds real tournament data and must
not be mutated or pointed at from local development.

**Forbidden locally** (these use the prod DB via `.env.local`):
- `npm run dev`
- `npm run db:migrate`
- `npm start`
- bare `npx tsx scripts/seed.ts`

**Always use the local variants instead** (they target `local.db` only):
- `npm run dev:local` — run the dev server against the local DB
- `npm run migrate:local` — run migrations against the local DB
- `npm run seed:local` — seed the local DB

`npm run db:generate` is safe — it only writes migration files and touches no database.

# Code style

NEVER add comments to code — not `//`, not `/* */`, not JSDoc `/** */`. Code must be
self-documenting; if a name or structure needs explaining, rename or restructure it
instead of commenting. This applies to every file: source, styles, and scripts. Existing
comments (if any) are left alone unless explicitly told otherwise.

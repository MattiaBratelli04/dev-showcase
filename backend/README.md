# backend/ — Backend

Server-only code: database access, auth config, schema.

- `prisma/schema.prisma` — data model (User, Project, Account, Session, VerificationToken)
- `prisma/migrations/` — applied SQL migrations
- `lib/prisma.ts` — Prisma Client instance (uses the `@prisma/adapter-pg` driver adapter)
- `lib/auth.ts` — NextAuth config (credentials login, session callbacks)

Nothing here should import from `frontend/`. Imported by route handlers under `app/api/**` and by `middleware.ts`.

# frontend/ — Frontend

Client-facing UI code: components and view helpers. No database or auth logic.

- `components/browser-card/` — Browser Card (project thumbnail)
- `components/browser-modal/` — full-screen Browser Modal overlay
- `components/layout/` — Navbar
- `components/providers/` — client-side context providers (NextAuth SessionProvider)
- `lib/utils.ts` — UI helpers (`cn` for Tailwind class merging)

Nothing here should import from `backend/`. Imported by pages under `app/**`.

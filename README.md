# DevShelf

Portfolio platform for developers: each project is shown as a browser-style card that expands into a full-screen preview.

## Struttura del progetto

```
app/              → Next.js App Router: pagine (frontend) + api routes (backend).
                    Next.js richiede che stia qui, non è spostabile.
backend/          → Backend: Prisma schema/migrations, client DB, config NextAuth
frontend/         → Frontend: componenti UI, helper client-side
prisma.config.ts  → connection string e path dello schema per la Prisma CLI
```

Vedi `backend/README.md` e `frontend/README.md` per il dettaglio di ciascuna cartella.

## Getting Started

Il database Postgres gira in un container Docker locale (`devshelf-postgres`). Se non è attivo:

```bash
docker start devshelf-postgres
```

Poi:

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Comandi utili

```bash
npx prisma migrate dev   # crea/applica una migration dopo aver modificato backend/prisma/schema.prisma
npx prisma studio        # GUI per esplorare i dati
npx prisma generate      # rigenera il client dopo un pull di modifiche allo schema
```

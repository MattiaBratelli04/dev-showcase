# Manuale Sviluppatore — DevShelf

## 1. Panoramica tecnica

DevShelf è un'applicazione full-stack costruita su **Next.js 16** con App Router. Backend e frontend convivono nello stesso progetto: le API sono Route Handler di Next.js sotto `app/api/`, il database è **PostgreSQL** gestito via **Prisma ORM 7**, e l'autenticazione usa **NextAuth.js v5**.

Il codice è organizzato in tre macro-aree (vedi anche `backend/README.md` e `frontend/README.md`):

```
app/         → routing Next.js: pagine + api routes (obbligatorio qui, non spostabile)
backend/     → Prisma schema/migrations, client DB, config NextAuth
frontend/    → componenti UI, helper client-side
```

---

## 2. Stack tecnologico

| Livello | Tecnologia | Versione |
|---------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.9 |
| Linguaggio | TypeScript | 5.x |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Animazioni | Framer Motion | 12.x |
| Icone | lucide-react | 1.x |
| ORM | Prisma | 7.8.0 |
| Driver DB | `pg` + `@prisma/adapter-pg` | 8.x / 7.8.0 |
| Database | PostgreSQL | 16 (Docker locale) |
| Autenticazione | NextAuth.js | 5.0.0-beta.31 |
| Validazione | Zod | 3.x |
| Form | React Hook Form | 7.x |
| Hash password | bcryptjs | 3.x |

> **Nota su Prisma 7:** rispetto alle versioni precedenti, la `datasource.url` **non va più messa nello schema** (`schema.prisma`). La connessione si configura in due punti separati: `prisma.config.ts` (usato dalla CLI per migration/generate/studio) e `backend/lib/prisma.ts` (usato dall'app a runtime, tramite un **driver adapter** — `@prisma/adapter-pg` — invece del motore Rust integrato delle versioni precedenti).

Upload immagini e OAuth Google sono **predisposti ma non ancora integrati**: `uploadthing`/`@uploadthing/react` sono installati e `.env.example` prevede le chiavi, ma nessuna route li usa davvero; `backend/lib/auth.ts` ha solo `CredentialsProvider` (login email+password), non `GoogleProvider`.

---

## 3. Prerequisiti

- Node.js 20+ (sviluppato e testato su v20.19.5)
- npm
- Docker (per Postgres locale) — in alternativa un'istanza Postgres 14+ raggiungibile

---

## 4. Setup ambiente di sviluppo

### 4.1 Clonare e installare

```bash
git clone <repo>
cd portfolioJac
npm install
```

### 4.2 Database Postgres locale (Docker)

```bash
docker run -d --name devshelf-postgres \
  -e POSTGRES_USER=devshelf \
  -e POSTGRES_PASSWORD=devshelf \
  -e POSTGRES_DB=devshelf \
  -p 5432:5432 \
  -v devshelf-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

Le esecuzioni successive bastano con:
```bash
docker start devshelf-postgres
```

### 4.3 Variabili d'ambiente

Copia `.env.example` in `.env` e compila almeno:

```env
DATABASE_URL="postgresql://devshelf:devshelf@localhost:5432/devshelf"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

`UPLOADTHING_*` e `GOOGLE_CLIENT_*` sono opzionali/non ancora usati (vedi nota sopra).

### 4.4 Migration e client Prisma

```bash
npx prisma migrate dev   # crea/applica le migration in backend/prisma/migrations
npx prisma generate      # rigenera il client (fatto automaticamente da migrate dev)
```

> La primissima invocazione della CLI Prisma su una macchina nuova può richiedere 2-3 minuti a freddo (carica una libreria interna pesante, `effect`) — non è un blocco, le esecuzioni successive sono quasi istantanee (grazie alla cache del filesystem).

### 4.5 Avviare il server di sviluppo

```bash
npm run dev
```

App su `http://localhost:3000`.

---

## 5. Schema del database

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  // niente url qui in Prisma 7 — vedi prisma.config.ts
}

model User {
  id            String    @id @default(cuid())
  name          String
  username      String    @unique
  email         String    @unique
  emailVerified DateTime?
  password      String?
  bio           String?
  image         String?
  githubUrl     String?
  linkedinUrl   String?
  websiteUrl    String?
  techStack     String[]
  isPublic      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  projects Project[]
  accounts Account[]
  sessions Session[]
}

model Project {
  id            String   @id @default(cuid())
  title         String
  description   String?
  screenshotUrl String?
  projectUrl    String?
  techStack     String[]
  category      String?
  isPublic      Boolean  @default(false)
  fakeData      Boolean  @default(false)   // interruttore "mostra banner dati fittizi"
  fakeDataItems Json?                      // futuro: lista dettagliata dei valori sostituiti
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Account, Session: tabelle standard richieste dall'adapter Prisma di NextAuth.
model Account { /* ... */ }
model Session { /* ... */ }

// VerificationToken: tabella standard NextAuth (pensata per magic-link email),
// riusata anche per i token di reset password (vedi §7 "Reset password").
model VerificationToken { /* ... */ }
```

Schema completo in `backend/prisma/schema.prisma`. Vedi anche `docs/architettura-sistema.md` per il diagramma ER e il dizionario dati.

---

## 6. Struttura delle cartelle

```
portfolioJac/
├── app/                              # routing (obbligatorio qui per Next.js)
│   ├── layout.tsx
│   ├── page.tsx                      # redirect a /explore
│   ├── globals.css
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx    # richiedi link di reset
│   │   └── reset-password/page.tsx     # imposta nuova password (legge ?token&email)
│   ├── dashboard/
│   │   ├── page.tsx                    # area privata utente
│   │   └── settings/page.tsx           # pannello impostazioni profilo
│   ├── explore/page.tsx              # esplora profili pubblici
│   ├── profile/[username]/page.tsx   # profilo pubblico
│   ├── projects/
│   │   ├── new/page.tsx               # wizard nuovo progetto (4 step)
│   │   └── [id]/edit/page.tsx         # modifica progetto (form precompilato, no step)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts
│       │   ├── register/route.ts
│       │   ├── forgot-password/route.ts # genera token in VerificationToken
│       │   └── reset-password/route.ts  # valida token, aggiorna password
│       ├── projects/
│       │   ├── route.ts              # GET (lista mie), POST (crea)
│       │   └── [id]/route.ts         # GET, PUT, DELETE (con controllo ownership)
│       ├── profile/
│       │   ├── me/route.ts           # GET/PUT profilo utente autenticato
│       │   └── [username]/route.ts   # GET profilo pubblico + progetti pubblici
│       └── explore/route.ts          # GET lista profili pubblici (con filtro/paginazione)
│
├── backend/
│   ├── lib/
│   │   ├── prisma.ts                 # PrismaClient + adapter-pg
│   │   └── auth.ts                   # config NextAuth (Credentials + JWT)
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
├── frontend/
│   ├── components/
│   │   ├── browser-card/BrowserCard.tsx
│   │   ├── browser-modal/BrowserModal.tsx
│   │   ├── layout/Navbar.tsx
│   │   └── providers/SessionProvider.tsx
│   └── lib/
│       └── utils.ts                  # cn() per merge classi Tailwind
│
├── proxy.ts                           # (ex middleware.ts) protegge /dashboard e /projects
├── prisma.config.ts                  # connection string + path schema per la CLI
├── next.config.ts                    # serverExternalPackages per pg/Prisma (vedi §7)
├── .env                              # non committare
└── .env.example
```

Non esistono ancora (vedi roadmap in `docs/changelog.md`): upload immagini reale, OAuth Google.

---

## 7. Autenticazione (NextAuth v5)

### `backend/lib/auth.ts`

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: { email: {...}, password: {...} },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: ... } })
        if (!user?.password) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        return isValid ? { id: user.id, name: user.name, email: user.email, username: user.username, image: user.image } : null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    // id e username propagati dal token JWT alla session
  },
})
```

### `proxy.ts`

Protegge `/dashboard/**` e `/projects/**`: se non autenticato, reindirizza a `/auth/login?callbackUrl=<path originale>`.

> **Attenzione — non rinominarlo in `middleware.ts`.** In Next.js 16 quella convenzione è deprecata e girerebbe sul vecchio runtime **Edge**, che non supporta i driver Node nativi (`pg`) usati da Prisma tramite `@prisma/adapter-pg` — il risultato è un crash silenzioso (`node:util/types` non trovato) non appena `auth()` viene invocato, cioè su ogni richiesta a `/dashboard`/`/projects`. `proxy.ts` invece usa di default il runtime Node.js. Vedi `docs/changelog.md` (Unreleased → Fixed) per i dettagli di quando è stato scoperto.

### Reset password

Non usa NextAuth direttamente: due Route Handler dedicati generano e verificano un token, riusando la tabella `VerificationToken` (pensata da NextAuth per i magic-link via email, qui riadattata):

1. `POST /api/auth/forgot-password` — se l'email esiste ed ha una password (non è solo-OAuth), genera un token con `crypto.randomBytes(32).toString("hex")`, lo salva con scadenza **1 ora**, e cancella eventuali token precedenti per lo stesso indirizzo. La risposta è **sempre generica** (stesso messaggio, esista o meno l'email) per non permettere enumerazione utenti.
2. `POST /api/auth/reset-password` — verifica che il token esista, appartenga a quell'email e non sia scaduto; se valido, hasha la nuova password (bcrypt, salt 12) e **cancella il token** (uso singolo — un secondo tentativo con lo stesso link fallisce).

**Nessun servizio email è collegato**: il link di reset viene loggato via `console.log` sul server e restituito nella risposta JSON (campo `devResetUrl`), che la pagina `/auth/forgot-password` mostra direttamente all'utente. Per passare a un invio email reale in produzione, sostituire il `console.log` in `app/api/auth/forgot-password/route.ts` con una chiamata a un provider (Resend, Nodemailer+SMTP, ecc.) e rimuovere `devResetUrl` dalla risposta.

### `next.config.ts` — `serverExternalPackages`

```typescript
const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/client", "@prisma/adapter-pg"],
}
```

Senza questa opzione, **Turbopack** (bundler di default da Next.js 16) prova a impacchettare `pg` dentro le API route invece di trattarlo come dipendenza nativa esterna, fallendo con `Cannot find package 'pg-<hash>'` e restituendo `500` su qualsiasi endpoint che tocchi il database (inclusi login e registrazione). Se in futuro si aggiungono altre dipendenze Node-native (driver di altri DB, librerie con binding nativi), vanno aggiunte qui.

---

## 8. API Routes

| Metodo | Route | Auth | Descrizione |
|--------|-------|:---:|-------------|
| POST | `/api/auth/register` | – | Crea utente (valida con Zod, hash bcrypt salt=12, verifica unicità email/username) |
| GET / POST | `/api/auth/[...nextauth]` | – | Handler NextAuth (login, sessione) |
| POST | `/api/auth/forgot-password` | – | Genera token di reset (1h, uso singolo), risposta sempre generica (no user enumeration) |
| POST | `/api/auth/reset-password` | – | Verifica token + email, aggiorna password, invalida il token |
| GET | `/api/projects` | ✓ | Lista progetti dell'utente autenticato |
| POST | `/api/projects` | ✓ | Crea progetto (Zod valida titolo, url, tech stack max 10) |
| GET/PUT/DELETE | `/api/projects/[id]` | ✓ | Dettaglio/aggiorna/elimina — verifica ownership (403 se non tuo) |
| GET | `/api/profile/me` | ✓ | Dati profilo utente autenticato |
| PUT | `/api/profile/me` | ✓ | Aggiorna bio/immagine/link social/tech stack/visibilità (Zod) |
| DELETE | `/api/profile/me` | ✓ | Elimina definitivamente l'account (cascade su Project/Account/Session via schema Prisma) |
| GET | `/api/profile/[username]` | – | Profilo pubblico + soli progetti pubblici (404 se profilo privato/inesistente) |
| GET | `/api/explore` | – | Lista profili pubblici con progetti pubblici, filtro `?tech=`, paginazione `?page=` |

Specifica completa request/response in `docs/architettura-sistema.md`.

Convenzione errori: sempre `{ error: string }` col relativo status code (400 validazione, 401 non autenticato, 403 non proprietario, 404 non trovato, 500 generico).

---

## 9. Componenti principali (`frontend/components/`)

- **`BrowserCard`** — miniatura progetto stile finestra browser; prop `showMenu` attiva il menu ⋮ (Modifica/Rendi pubblico-privato/Copia link/Elimina), usato in dashboard e non nel profilo pubblico.
- **`BrowserModal`** — overlay a schermo intero con animazione (Framer Motion), mostra lo screenshot e il banner "dati fittizi" se `project.fakeData` è `true`.
- **`Navbar`** — barra di navigazione globale (`app/layout.tsx`).
- **`SessionProvider`** — wrapper client-side del `SessionProvider` di NextAuth, necessario perché `useSession()` funzioni nei Client Component.

---

## 10. Upload immagini

Non ancora integrato con un servizio reale: il wizard `/projects/new` accetta solo un **URL di un'immagine già online**, incollato dall'utente. `uploadthing` è tra le dipendenze e le chiavi sono previste in `.env.example`, ma manca la route `app/api/uploadthing` e la configurazione (`ourFileRouter`) — è il prossimo passo naturale per abilitare il drag & drop reale mostrato (ma non funzionante) nello step 2 del wizard.

---

## 11. Script disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Server di sviluppo (Turbopack) |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia il build di produzione |
| `npm run lint` | ESLint (config `eslint-config-next`) |
| `npx prisma migrate dev` | Crea/applica una migration dopo modifiche allo schema |
| `npx prisma generate` | Rigenera il Prisma Client |
| `npx prisma studio` | GUI per esplorare/modificare i dati nel browser |

Non esiste ancora uno script di seed (`prisma db seed`) — il DB si popola manualmente via UI o Prisma Studio/TablePlus.

---

## 12. Deploy

Non ancora configurato in questo repo (nessuna pipeline CI/CD, nessun target di deploy impostato). Percorso previsto, coerente con lo stack:

1. **Database**: Postgres gestito (es. Neon o Supabase) al posto del container Docker locale — basta puntare `DATABASE_URL` alla connection string di produzione.
2. **App**: Vercel (build command `npm run build`, framework Next.js riconosciuto automaticamente).
3. **Migration in produzione**: `DATABASE_URL="<prod>" npx prisma migrate deploy` (non `migrate dev`, che è pensato solo per lo sviluppo).

Dettagli su pipeline e ambienti in `docs/versioning-e-workflow.md` (quando disponibile).

---

## 13. Convenzioni di codice

- TypeScript strict mode abilitato
- Server/Client Component: `"use client"` solo dove serve interattività (form, hook di stato, `useSession`)
- Validazione input sempre con **Zod** nelle API route
- Risposte API sempre `NextResponse.json(...)`, errori sempre `{ error: string }`
- Nomi file componenti: **PascalCase** (`BrowserCard.tsx`); nomi file utility/config: **camelCase** (`prisma.ts`)
- Regola di dipendenza tra cartelle: `frontend/` non importa mai da `backend/` e viceversa — la connessione tra i due avviene solo dentro `app/` (vedi `backend/README.md` e `frontend/README.md`)

# Manuale Sviluppatore — DevShelf

## 1. Panoramica tecnica

DevShelf è un'applicazione full-stack costruita su **Next.js 14** con App Router. Il backend è interamente gestito tramite API Routes di Next.js, il database è **PostgreSQL** gestito via **Prisma ORM**, e l'autenticazione usa **NextAuth.js v5**.

---

## 2. Stack tecnologico

| Livello | Tecnologia | Versione |
|---------|-----------|---------|
| Framework | Next.js | 14.x |
| Linguaggio | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Componenti UI | Shadcn/ui | latest |
| Animazioni | Framer Motion | 11.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15+ |
| Autenticazione | NextAuth.js | 5.x (beta) |
| Upload file | Uploadthing | 7.x |
| Validazione | Zod | 3.x |
| Form | React Hook Form | 7.x |
| Deploy | Vercel | — |
| DB hosting | Neon / Supabase | — |

---

## 3. Prerequisiti

- Node.js >= 18.17
- npm >= 9 (o pnpm/yarn)
- PostgreSQL >= 15 installato localmente oppure account Neon/Supabase
- Account Uploadthing (gratuito) per l'upload immagini
- (Opzionale) Account Google per OAuth

---

## 4. Setup ambiente di sviluppo

### 4.1 Clonare il repository

```bash
git clone https://github.com/tuousername/devshelf.git
cd devshelf
npm install
```

### 4.2 Variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/devshelf"

# NextAuth
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opzionale)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Uploadthing
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""
```

Per generare `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4.3 Setup database

```bash
# Crea il database (se in locale)
createdb devshelf

# Applica lo schema Prisma
npx prisma migrate dev --name init

# (Opzionale) Seed con dati di test
npx prisma db seed
```

### 4.4 Avviare il server di sviluppo

```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`.

---

## 5. Schema del database

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String    @id @default(cuid())
  name        String
  username    String    @unique
  email       String    @unique
  password    String?   // null se login OAuth
  bio         String?
  avatarUrl   String?
  githubUrl   String?
  linkedinUrl String?
  websiteUrl  String?
  techStack   String[]  // array di tag
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  projects    Project[]
  sessions    Session[]
  accounts    Account[]
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
  fakeData      Json?    // overlay dati fittizi
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Tabelle necessarie per NextAuth
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 6. Struttura delle cartelle

```
devshelf/
├── app/
│   ├── layout.tsx                  # Root layout con providers
│   ├── page.tsx                    # Homepage pubblica
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   └── page.tsx                # Area privata utente
│   ├── profile/
│   │   └── [username]/page.tsx     # Profilo pubblico
│   ├── projects/
│   │   ├── new/page.tsx            # Wizard nuovo progetto
│   │   └── [id]/
│   │       └── edit/page.tsx       # Modifica progetto
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts
│       │   └── register/route.ts
│       ├── projects/
│       │   ├── route.ts            # GET list, POST create
│       │   └── [id]/route.ts       # GET, PUT, DELETE
│       ├── profile/
│       │   └── [username]/route.ts # Profilo pubblico
│       └── uploadthing/
│           └── route.ts
│
├── components/
│   ├── ui/                         # Shadcn components
│   ├── browser-card/
│   │   ├── BrowserCard.tsx
│   │   └── BrowserCardMenu.tsx
│   ├── browser-modal/
│   │   └── BrowserModal.tsx
│   ├── profile/
│   │   ├── ProfileHeader.tsx
│   │   └── TechBadge.tsx
│   ├── projects/
│   │   ├── ProjectWizard.tsx
│   │   └── UploadDropzone.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── prisma.ts                   # Prisma client singleton
│   ├── auth.ts                     # NextAuth config
│   ├── uploadthing.ts              # Uploadthing config
│   └── utils.ts                   # cn() e altre utility
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── middleware.ts                   # Protezione route
├── .env                            # Variabili d'ambiente (non committare)
└── .env.example                    # Template variabili
```

---

## 7. Autenticazione (NextAuth v5)

### Configurazione (`lib/auth.ts`)

```typescript
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        return isValid ? user : null
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
})
```

### Middleware (`middleware.ts`)

```typescript
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard") ||
                      req.nextUrl.pathname.startsWith("/projects")

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*"],
}
```

---

## 8. API Routes

### `GET /api/projects` — Lista progetti utente autenticato

```typescript
// app/api/projects/route.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(projects)
}
```

### `POST /api/projects` — Crea progetto

```typescript
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()
  const { title, description, screenshotUrl, projectUrl,
          techStack, category, isPublic, fakeData } = body

  const project = await prisma.project.create({
    data: {
      title,
      description,
      screenshotUrl,
      projectUrl,
      techStack,
      category,
      isPublic: isPublic ?? false,
      fakeData,
      userId: session.user.id,
    },
  })

  return Response.json(project, { status: 201 })
}
```

### `PUT /api/projects/[id]` — Aggiorna progetto (verifica ownership)

```typescript
// app/api/projects/[id]/route.ts
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const existing = await prisma.project.findUnique({ where: { id: params.id } })
  if (!existing || existing.userId !== session.user.id) {
    return new Response("Forbidden", { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.project.update({
    where: { id: params.id },
    data: body,
  })

  return Response.json(updated)
}
```

---

## 9. Componente BrowserCard

```typescript
// components/browser-card/BrowserCard.tsx
"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface BrowserCardProps {
  project: {
    id: string
    title: string
    screenshotUrl: string | null
    techStack: string[]
    projectUrl: string | null
  }
  onClick: () => void
}

export function BrowserCard({ project, onClick }: BrowserCardProps) {
  return (
    <motion.div
      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-white dark:bg-zinc-900 shadow-sm"
      whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Barra browser */}
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white dark:bg-zinc-700 rounded-md px-3 py-1 text-xs text-zinc-400 truncate">
          {project.projectUrl ?? "localhost:3000"}
        </div>
      </div>

      {/* Screenshot */}
      <div className="relative w-full aspect-video bg-zinc-50 dark:bg-zinc-950">
        {project.screenshotUrl ? (
          <Image
            src={project.screenshotUrl}
            alt={project.title}
            fill
            className="object-cover object-top"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-300 text-sm">
            Nessuna anteprima
          </div>
        )}
      </div>

      {/* Footer card */}
      <div className="p-3">
        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
          {project.title}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
```

---

## 10. Componente BrowserModal

```typescript
// components/browser-modal/BrowserModal.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, ArrowLeft, ArrowRight, RotateCcw, ExternalLink } from "lucide-react"
import Image from "next/image"

interface BrowserModalProps {
  project: {
    title: string
    screenshotUrl: string | null
    projectUrl: string | null
    fakeData: any
  } | null
  onClose: () => void
}

export function BrowserModal({ project, onClose }: BrowserModalProps) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra browser completa */}
            <div className="flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-1.5">
                <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <ArrowLeft size={14} />
                <ArrowRight size={14} />
                <RotateCcw size={14} />
              </div>
              <div className="flex-1 bg-white dark:bg-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-500 truncate">
                {project.projectUrl ?? `https://${project.title.toLowerCase().replace(/\s/g, "-")}.vercel.app`}
              </div>
              {project.projectUrl && (
                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} className="text-zinc-400 hover:text-zinc-600" />
                </a>
              )}
              <button onClick={onClose}>
                <X size={16} className="text-zinc-400 hover:text-zinc-600" />
              </button>
            </div>

            {/* Banner privacy */}
            {project.fakeData && (
              <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs text-center py-1.5">
                I dati mostrati in questa anteprima sono fittizi e non rappresentano dati reali
              </div>
            )}

            {/* Screenshot */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {project.screenshotUrl ? (
                <Image
                  src={project.screenshotUrl}
                  alt={project.title}
                  fill
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-400">
                  Nessuna anteprima disponibile
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## 11. Upload con Uploadthing

### Configurazione (`lib/uploadthing.ts`)

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "./auth"

const f = createUploadthing()

export const ourFileRouter = {
  projectScreenshot: f({ image: { maxFileSize: "5MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user?.id) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url }
    }),

  userAvatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user?.id) throw new Error("Unauthorized")
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

---

## 12. Script npm disponibili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvia server di sviluppo su porta 3000 |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia server di produzione |
| `npm run lint` | ESLint check |
| `npx prisma studio` | GUI per esplorare il DB |
| `npx prisma migrate dev` | Applica nuove migrazioni |
| `npx prisma generate` | Rigenera Prisma client |
| `npx prisma db seed` | Popola il DB con dati di test |

---

## 13. Deploy su Vercel + Neon

### 1. Database (Neon)
1. Crea un account su [neon.tech](https://neon.tech)
2. Crea un nuovo progetto → copia la connection string
3. Incollala come `DATABASE_URL` nelle env di Vercel

### 2. Uploadthing
1. Crea un'app su [uploadthing.com](https://uploadthing.com)
2. Copia `UPLOADTHING_SECRET` e `UPLOADTHING_APP_ID`

### 3. Vercel
1. Importa il repository su Vercel
2. Aggiungi tutte le variabili d'ambiente
3. Deploy — Vercel eseguirà `npm run build` automaticamente

### 4. Prima migrazione in produzione
```bash
DATABASE_URL="tua-connection-string-neon" npx prisma migrate deploy
```

---

## 14. Convenzioni di codice

- **TypeScript strict mode** abilitato
- **Server Components** per default; `"use client"` solo dove necessario
- Fetch dati direttamente nei Server Components con Prisma (no API layer inutile lato client)
- Validazione input sempre con **Zod** sia client che server side
- Gestione errori API: sempre rispondere con status code appropriato e body JSON `{ error: string }`
- Nomi file componenti: **PascalCase** (`BrowserCard.tsx`)
- Nomi file utility/config: **camelCase** (`prisma.ts`)

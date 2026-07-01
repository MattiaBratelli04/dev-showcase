# Analisi del Progetto — DevShelf

## 1. Visione generale

**DevShelf** è una piattaforma web full-stack che permette a sviluppatori di creare il proprio profilo personale e caricare i progetti che hanno realizzato. Ogni progetto viene visualizzato come una scheda browser (Browser Card) — una miniatura stilizzata di una finestra browser con barra degli indirizzi, dot di controllo e anteprima screenshot. Al click, la scheda si espande in un overlay modale che simula un browser a schermo intero, mostrando il progetto con dati fittizi per tutelare la privacy.

---

## 2. Obiettivi del prodotto

| Obiettivo | Descrizione |
|-----------|-------------|
| Portfolio personale | Ogni utente ha una pagina pubblica con i suoi progetti |
| Presentazione visiva | I progetti appaiono come schede browser realistiche, non come semplici card testuali |
| Privacy | I dati sensibili mostrati nei progetti sono sostituiti da placeholder fittizi |
| Autenticazione | Ogni utente gestisce solo i propri progetti tramite account protetto |
| Scoperta | Gli utenti possono esplorare i profili e i progetti degli altri |

---

## 3. Utenti target

- **Sviluppatori junior/senior** che vogliono un portfolio visivo e interattivo
- **Studenti di informatica** che vogliono mostrare i loro side projects
- **Freelancer** che vogliono presentare il proprio lavoro a potenziali clienti

---

## 4. Architettura tecnica

### Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend + Backend | Next.js 14 (App Router) |
| Database | PostgreSQL |
| ORM | Prisma |
| Autenticazione | NextAuth.js v5 |
| Styling | Tailwind CSS |
| Componenti UI | Shadcn/ui |
| Animazioni | Framer Motion |
| Upload immagini | Uploadthing |
| Validazione form | Zod + React Hook Form |
| Deploy | Vercel (frontend) + Neon/Supabase (DB) |

### Struttura cartelle

```
/app
  /auth
    /login        → pagina login
    /register     → pagina registrazione
  /dashboard      → dashboard privata utente autenticato
  /profile/[username]  → profilo pubblico utente
  /projects
    /new          → form upload nuovo progetto
    /[id]/edit    → modifica progetto
  /api
    /auth/[...nextauth]   → NextAuth handler
    /projects             → CRUD progetti
    /uploadthing          → upload handler

/components
  /ui             → componenti base (Shadcn)
  /browser-card   → componente scheda browser
  /browser-modal  → modale full-screen browser
  /profile        → componenti profilo utente
  /dashboard      → componenti dashboard

/lib
  /prisma.ts      → client Prisma
  /auth.ts        → config NextAuth
  /uploadthing.ts → config upload
  /utils.ts       → utility functions

/prisma
  schema.prisma   → schema database
```

---

## 5. Modello dati (schema Prisma)

### Entità principali

```
User
├── id
├── name
├── username (unico, usato nell'URL pubblico)
├── email
├── password (hash bcrypt)
├── bio
├── avatarUrl
├── githubUrl
├── linkedinUrl
├── websiteUrl
├── techStack (array di stringhe: es. ["React","Node","PostgreSQL"])
├── createdAt
└── projects → Project[]

Project
├── id
├── title
├── description
├── screenshotUrl (immagine caricata tramite Uploadthing)
├── projectUrl (URL reale del progetto, opzionale)
├── techStack (array: tecnologie usate nel progetto)
├── category (es. "Web App", "Mobile", "API", "Design")
├── isPublic (boolean)
├── fakeData (JSON — dati fittizi da sovrapporre nello screenshot)
├── createdAt
├── updatedAt
└── userId → User
```

---

## 6. Flussi utente principali

### Flusso 1 — Registrazione e setup profilo
1. L'utente va su `/auth/register`
2. Inserisce nome, username, email, password
3. Viene reindirizzato alla dashboard
4. Completa il profilo: bio, avatar, link social, tech stack
5. Il profilo pubblico è disponibile su `/profile/[username]`

### Flusso 2 — Upload progetto
1. L'utente clicca "Aggiungi progetto" dalla dashboard
2. Compila: titolo, descrizione, categoria, tech stack
3. Carica uno screenshot del progetto (drag & drop)
4. Opzionalmente inserisce l'URL reale del progetto
5. Definisce eventuali dati fittizi (nomi, email, numeri) da sovrapporre
6. Salva → il progetto appare nella dashboard come Browser Card

### Flusso 3 — Visualizzazione progetto
1. Un visitatore va su `/profile/[username]`
2. Vede la griglia di Browser Cards
3. Clicca su una card → si apre il Browser Modal
4. Nel modal: barra browser con URL fake, screenshot del progetto, overlay con dati fittizi
5. Può chiudere il modal o navigare al progetto reale (se l'utente ha scelto di renderlo pubblico)

### Flusso 4 — Esplorazione pubblica
1. Dalla homepage, un utente non autenticato può sfogliare i profili pubblici
2. Può cercare per tecnologia o categoria
3. Può cliccare su un profilo per vedere i suoi progetti

---

## 7. Specifiche UI/UX

### Homepage (`/`)
- Hero section: headline + CTA "Inizia gratis" e "Esplora i profili"
- Griglia di profili featured (mockup con avatar, username, numero progetti, tech stack badges)
- Footer con link

### Dashboard (`/dashboard`)
- Header con avatar utente, username, link al profilo pubblico
- Griglia di Browser Cards dei propri progetti
- Bottone "+" in basso a destra (FAB) per aggiungere nuovo progetto
- Ogni card ha un menu contestuale (tasto destra o icona ⋮): Modifica, Elimina, Copia link, Rendi pubblico/privato

### Browser Card (componente)
```
┌─────────────────────────────────┐
│ ● ● ●  [  example.com/app    ] │  ← barra browser fake
├─────────────────────────────────┤
│                                 │
│       [screenshot progetto]     │
│                                 │
└─────────────────────────────────┘
    Titolo progetto
    React · Node · PostgreSQL
```
- Effetto hover: scala leggermente (1.03) + ombra più pronunciata
- Click → apre Browser Modal con animazione slide-up

### Browser Modal (componente overlay)
```
┌────────────────────────────────────────────────┐
│ ← → ↺  [  https://myapp.example.com        ] X│ ← barra browser realistica
├────────────────────────────────────────────────┤
│                                                │
│   [screenshot a piena larghezza]               │
│   + overlay dati fittizi se definiti           │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```
- Sfondo scuro semi-trasparente dietro il modal
- Animazione apertura: scale + fade da 0.9 → 1.0
- Bottone "Vai al progetto reale" (se URL disponibile e profilo pubblico)

### Pagina Profilo pubblica (`/profile/[username]`)
- Cover + avatar + nome + username + bio
- Badge tech stack colorati
- Link social (GitHub, LinkedIn, sito)
- Griglia Browser Cards dei progetti pubblici
- Filtro per tecnologia/categoria

### Form nuovo progetto (`/projects/new`)
- Step 1: Info base (titolo, descrizione, categoria)
- Step 2: Upload screenshot (drag & drop con anteprima live)
- Step 3: Tech stack (input tag)
- Step 4: Dati fittizi (opzionale — definisci cosa oscurare)
- Progress bar in alto, navigazione Indietro/Avanti

---

## 8. Funzionalità privacy (Fake Data Overlay)

Quando l'utente carica un progetto, può definire una lista di "sostituzione dati fittizi":

```json
{
  "fakeData": [
    { "type": "email", "value": "user@example.com" },
    { "type": "name", "value": "Mario Rossi" },
    { "type": "phone", "value": "+39 000 0000000" },
    { "type": "revenue", "value": "€ 12.450" }
  ]
}
```

Nel Browser Modal, questi valori vengono visualizzati come overlay trasparenti posizionati sopra lo screenshot (coordinate relative), oppure come un banner "Dati sostituiti per privacy" con tooltip.

---

## 9. Autenticazione e sicurezza

- Password hashata con bcrypt (salt rounds: 12)
- Sessioni gestite da NextAuth (JWT)
- Route `/dashboard`, `/projects/new`, `/projects/[id]/edit` protette da middleware
- Ogni API route verifica che l'utente sia il proprietario della risorsa prima di modificarla
- Upload immagini validato: solo `.jpg`, `.png`, `.webp`, max 5MB

---

## 10. API Routes

| Metodo | Route | Descrizione |
|--------|-------|-------------|
| POST | `/api/auth/register` | Registrazione nuovo utente |
| GET | `/api/projects` | Lista progetti utente autenticato |
| POST | `/api/projects` | Crea nuovo progetto |
| GET | `/api/projects/[id]` | Dettaglio progetto |
| PUT | `/api/projects/[id]` | Aggiorna progetto |
| DELETE | `/api/projects/[id]` | Elimina progetto |
| GET | `/api/profile/[username]` | Profilo pubblico + progetti pubblici |
| POST | `/api/uploadthing` | Upload screenshot/avatar |

---

## 11. Requisiti non funzionali

| Requisito | Target |
|-----------|--------|
| Performance | First Contentful Paint < 1.5s |
| Responsive | Funzionante su mobile, tablet, desktop |
| Accessibilità | Aria labels, navigazione da tastiera |
| SEO | Meta tag dinamici per i profili pubblici (Open Graph) |
| Scalabilità | Architettura stateless, pronta per deploy serverless |

---

## 12. Roadmap futura (v2+)

- Like / bookmark progetti di altri utenti
- Commenti sui progetti
- Notifiche in-app
- Statistiche visite sul profilo
- Tema dark/light toggle
- Import automatico da GitHub (leggi i repository e crea progetti automaticamente)
- Embedding widget: ogni utente può embeddare la sua griglia di progetti su siti esterni

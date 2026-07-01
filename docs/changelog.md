# Changelog e Piano di Manutenzione — DevShelf

Codice progetto: DVS-2026-01 · Versione: 1.0 · Data: 2026-07-01

---

## Parte 1 — Changelog

Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/); versioning secondo `docs/versioning-e-workflow.md` (SemVer).

### [Unreleased]

**Added**
- `/projects/[id]/edit`: pagina di modifica progetto, form precompilato, verificata end-to-end con un run Playwright reale (registrazione → creazione → modifica → salvataggio → verifica in dashboard)
- `/dashboard/settings`: pannello impostazioni profilo (nome, bio, foto, link social, tech stack, visibilità profilo), collegato al backend `PUT /api/profile/me` già esistente; link aggiunti in Navbar e dashboard. Verificato end-to-end con Playwright, inclusa la persistenza reale su reload della pagina
- Flusso di reset password completo: `/auth/forgot-password` (richiesta) e `/auth/reset-password` (nuova password), API `POST /api/auth/forgot-password` e `POST /api/auth/reset-password`, token monouso con scadenza 1h basato sulla tabella `VerificationToken`. Nessun servizio email collegato: il link viene mostrato a video e loggato lato server (vedi limitazione sotto). Verificato end-to-end con Playwright: richiesta, no-leak su email inesistente, reset riuscito, vecchia password rifiutata, nuova password funzionante, token non riutilizzabile
- Eliminazione account: sezione "Zona pericolosa" in `/dashboard/settings`, richiede di digitare il proprio username per abilitare il pulsante + conferma finale. `DELETE /api/profile/me` elimina l'utente e, in cascata (`onDelete: Cascade` nello schema), tutti i suoi progetti/account/sessioni — soddisfa il requisito GDPR "diritto alla cancellazione" della SRS. Verificato end-to-end con Playwright inclusi: pulsante disabilitato su testo errato, cascade delete di un progetto associato, login con vecchie credenziali rifiutato dopo l'eliminazione, verifica diretta via API che il profilo pubblico restituisca 404

**Fixed**
- `middleware.ts` → rinominato `proxy.ts`: convenzione deprecata in Next.js 16, girava ancora sul runtime Edge (legacy) e andava in crash (`node:util/types` non trovato) non appena `auth()` toccava il driver `pg`/Prisma — **nessuna route protetta funzionava correttamente prima di questo fix**, non solo la pagina di modifica
- `next.config.ts`: aggiunto `serverExternalPackages: ["pg", "@prisma/client", "@prisma/adapter-pg"]` — Turbopack falliva a impacchettare `pg` dentro le API route (`Cannot find package 'pg-<hash>'`), causando 500 su login e registrazione
- `frontend/components/browser-card/BrowserCard.tsx`: aggiunto `aria-label="Menu progetto"` al pulsante ⋮ (gap di accessibilità, richiesto anche dalla SRS)

**Limitazioni note** (funzionalità referenziate in UI o nei manuali ma non ancora implementate — vedi backlog in `docs/piano-di-progetto.md` §1.6):
- Reset password: nessun servizio email reale collegato (il link è mostrato a video invece che inviato per email) — va sostituito prima di andare in produzione
- Upload screenshot: solo incolla-URL, nessuna integrazione reale con Uploadthing (dipendenza installata ma non collegata)
- Nessuna autenticazione OAuth (Google) nonostante le variabili siano previste in `.env.example`
- Nessuna suite di test automatizzata a repository (piano definito in `docs/piano-di-testing.md`; il test dell'edit-flow di cui sopra è stato uno script Playwright ad-hoc, non ancora parte di una suite versionata)

### [0.1.0] — 2026-07-01

**Added**
- Autenticazione via NextAuth v5 (Credentials Provider, sessioni JWT), registrazione con validazione Zod e hash bcrypt
- CRUD progetti completo (`/api/projects`, `/api/projects/[id]`) con controllo di ownership
- Dashboard privata con Browser Card, menu contestuale (modifica, pubblico/privato, copia link, elimina)
- Wizard di creazione progetto in 4 step (`/projects/new`)
- Browser Modal a schermo intero con banner "dati fittizi"
- Profilo pubblico (`/profile/[username]`) e pagina Esplora (`/explore`) con filtro per tecnologia
- Proxy (ex middleware) di protezione route (`/dashboard`, `/projects`)
- Database PostgreSQL locale via Docker, schema Prisma versionato con migration

**Changed**
- Migrazione da Prisma < 7 a **Prisma 7.8.0**: rimossa `datasource.url` dallo schema, introdotto `prisma.config.ts` e driver adapter `@prisma/adapter-pg` per la connessione a runtime (breaking change della libreria, non una scelta di design)
- Riorganizzazione del codice in `backend/` (Prisma, auth, accesso dati) e `frontend/` (componenti UI), mantenendo `app/` come richiesto dalle convenzioni di routing di Next.js
- Aggiornamento di `manuale-utente.md` e `manuale-sviluppatore.md` per riflettere lo stack e la struttura reali (erano allineati a una versione precedente del progetto, Next.js 14 / Prisma 5)

**Fixed**
- Build di produzione: `useSearchParams()` nella pagina di login causava un errore di prerendering; risolto avvolgendo il componente in un `Suspense` boundary

**Removed**
- File inutilizzati: SVG di esempio di `create-next-app`, cartella `prisma/` duplicata e non referenziata, cache di build (`tsconfig.tsbuildinfo`, `.DS_Store`)

---

## Parte 2 — Piano di Manutenzione e SLA

### 2.1 Classificazione della gravità dei bug

| Severità | Definizione | Esempio |
|----------|-------------|---------|
| **Critica** | Il sistema è inutilizzabile o dati vengono persi/esposti indebitamente | Un utente può leggere/modificare progetti di un altro utente; il login non funziona |
| **Alta** | Una funzionalità core non funziona, ma esiste un workaround o è isolata | Il wizard di creazione progetto si blocca a uno step |
| **Media** | Difetto che degrada l'esperienza ma non blocca il flusso | Un'etichetta tech stack non si aggiorna senza refresh manuale |
| **Bassa** | Difetto estetico o marginale | Allineamento errato di un'icona in dark mode |

### 2.2 Tempi di risposta e risoluzione (target)

| Severità | Tempo di prima risposta | Tempo di risoluzione target |
|----------|--------------------------|-------------------------------|
| Critica | 24 ore | 72 ore |
| Alta | 3 giorni lavorativi | 2 settimane |
| Media | 1 settimana | Prossima release pianificata |
| Bassa | Best-effort | Nessun impegno di tempistica, gestita a batch |

Questi target sono validi per un progetto con team ridotto/singolo sviluppatore (coerente con `docs/piano-di-progetto.md` §4); vanno rinegoziati se il progetto passa a un team più ampio o a un contratto di supporto con SLA contrattuali verso clienti.

### 2.3 Canali di segnalazione

- **Bug e richieste di funzionalità**: GitHub Issues del repository (`github.com/MattiaBratelli04/dev-showcase`)
- **Vulnerabilità di sicurezza**: da segnalare privatamente (non come Issue pubblica) al maintainer, prima della divulgazione pubblica

### 2.4 Cadenza di manutenzione

- **Patch di sicurezza** (dipendenze con vulnerabilità note): applicate appena disponibili, fuori dal ciclo di release ordinario se la severità è alta/critica
- **Aggiornamento dipendenze non di sicurezza**: revisione mensile
- **Backup database**: a carico del provider di hosting scelto in produzione (es. Neon/Supabase offrono backup automatici); da verificare esplicitamente in fase di deploy (`docs/manuale-sviluppatore.md` §12) prima del Go-Live
- **Monitoraggio**: da introdurre in fase di deploy (es. Vercel Analytics + log delle Route Handler); non ancora attivo in sviluppo locale

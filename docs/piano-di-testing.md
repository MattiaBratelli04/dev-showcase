# Piano di Testing e Qualità (QA) — DevShelf

Codice progetto: DVS-2026-01 · Versione: 1.0 · Data: 2026-07-01

> **Stato attuale:** il progetto non ha ancora infrastruttura di test automatizzati (nessun framework configurato, nessun file `*.test.ts`). Questo documento definisce la strategia da adottare — è quindi un piano, non una fotografia di copertura esistente. Coerente con `docs/piano-di-progetto.md`, fase 7.

---

## 1. Strategia di Test

### 1.1 Unit Test

**Strumento proposto:** [Vitest](https://vitest.dev) (si integra bene con TypeScript/ESM e Next.js, più veloce di Jest).

**Cosa testare:**
- Schemi di validazione Zod (`registerSchema`, `projectSchema`, `updateSchema` nelle route `app/api/**`): input validi accettati, input invalidi rigettati con il messaggio atteso
- Funzioni pure in `backend/` e `frontend/lib/utils.ts` (es. `cn()`)
- Logica di autorizzazione isolata (es. la funzione `getProjectOrFail` in `app/api/projects/[id]/route.ts`: proprietario vs non proprietario vs risorsa inesistente)

**Dove:** file `*.test.ts` accanto al codice testato (es. `backend/lib/auth.test.ts`), eseguiti con `npm run test`.

### 1.2 Integration Test

**Strumento proposto:** Vitest + database Postgres di test dedicato (container Docker separato da quello di sviluppo, es. `devshelf-postgres-test`), migrato con `prisma migrate deploy` prima della suite e resettato tra un run e l'altro.

**Cosa testare:** le API route end-to-end contro un DB reale (non mockato — coerente con l'architettura: niente logica SQL fuori da Prisma da poter mockare in modo significativo):

| Endpoint | Casi da coprire |
|----------|------------------|
| `POST /api/auth/register` | creazione riuscita; email duplicata → 400; username duplicato → 400; password troppo corta → 400 |
| `GET/POST /api/projects` | lista vuota per utente nuovo; creazione progetto; richiesta senza sessione → 401 |
| `GET/PUT/DELETE /api/projects/[id]` | proprietario può leggere/modificare/eliminare; un altro utente autenticato riceve 403; id inesistente → 404 |
| `GET /api/profile/[username]` | profilo pubblico restituisce solo progetti `isPublic`; profilo privato → 404 |
| `GET /api/explore` | filtro `?tech=` restituisce solo utenti con quella tecnologia in un progetto pubblico; paginazione corretta |

### 1.3 End-to-End Test

**Strumento proposto:** [Playwright](https://playwright.dev) (browser reale, gestisce bene redirect/middleware di Next.js).

**Flussi critici da automatizzare** (corrispondono agli Use Case della SRS, `docs/DevShelf_Documento_Requisiti.docx`):

- UC-01 Registrazione utente → dashboard raggiunta
- UC-02 Login (credenziali corrette e sbagliate)
- UC-03 Aggiunta progetto (wizard 4 step completo) → Browser Card visibile in dashboard
- UC-04 Apertura Browser Modal, chiusura con X / click fuori
- UC-05 Toggle pubblico/privato ed eliminazione progetto dal menu ⋮
- UC-06 Esplorazione profili pubblici da `/explore` e navigazione al profilo

### 1.4 Penetration Test

Non richiede necessariamente un tool dedicato in questa fase; si propone una checklist minima allineata ai requisiti non funzionali di sicurezza della SRS (§1.2):

- **Controllo ownership**: tentare di modificare/eliminare un progetto altrui via chiamata diretta all'API (bypassando la UI) → deve rispondere `403`
- **Autenticazione**: chiamare le route protette senza cookie di sessione → `401`; cookie manomesso/scaduto → trattato come non autenticato, non come errore 500
- **Hashing password**: verificare che `password` non sia mai presente in nessuna risposta JSON delle API (`select` espliciti in Prisma, mai `include` generico su `User`)
- **Validazione upload URL**: `screenshotUrl`/`projectUrl` validati come URL da Zod, ma senza allowlist di dominio — accettano anche URL malevoli; da rivalutare quando si introdurrà l'upload reale (Uploadthing)
- **Dipendenze**: `npm audit` periodico; nessuna vulnerabilità "high"/"critical" non risolta prima di una release
- Per un audit più approfondito (SQL injection, XSS, CSRF) uno strumento come [OWASP ZAP](https://www.zaproxy.org/) baseline scan contro l'ambiente di staging, prima del Go-Live

---

## 2. Matrice di tracciabilità Requisiti → Test

| Requisito (SRS) | Tipo di test | Stato |
|------------------|--------------|-------|
| RF-01, RF-02, RF-03 (registrazione, unicità, login) | Integration + E2E | Da implementare |
| RF-04 (reset password) | — | Non applicabile: funzionalità non ancora implementata (vedi `docs/changelog.md`) |
| RF-05 (sessione JWT) | Integration | Da implementare |
| RF-09..RF-15 (gestione progetti, fake data) | Integration + E2E | Da implementare |
| RF-16..RF-20 (Browser Card/Modal, esplorazione) | E2E | Da implementare |
| Sicurezza (ownership, bcrypt, GDPR delete) | Penetration checklist | Da implementare (nota: cancellazione account non ancora implementata, vedi reality-check in `docs/changelog.md`) |
| Prestazioni (FCP < 1.5s) | Lighthouse CI | Da implementare |
| Accessibilità (WCAG 2.1 AA) | axe-core / Lighthouse a11y | Da implementare |

---

## 3. Criteri di Accettazione

Il software è considerato pronto per una release (vedi milestone M5 in `docs/piano-di-progetto.md`) quando:

1. **Build pulita**: `npm run build` e `npx tsc --noEmit` senza errori
2. **Unit + Integration test verdi al 100%**, con copertura minima dell'**70%** su `backend/` e `app/api/**`
3. **E2E dei 6 Use Case critici** (UC-01…UC-06) verdi su almeno Chromium
4. **Zero vulnerabilità "high"/"critical"** in `npm audit`
5. **Checklist di penetration test (§1.4) superata** senza eccezioni aperte
6. **Nessuna regressione**: le funzionalità già coperte da test in una release precedente restano verdi
7. **Performance**: First Contentful Paint < 1.5s su build di produzione (misurato con Lighthouse su rete simulata "Fast 3G" o superiore)
8. **Accessibilità**: nessun errore "critical"/"serious" in un audit axe-core sulle pagine pubbliche (`/`, `/explore`, `/profile/[username]`)

Una release che non soddisfa un criterio può comunque procedere solo con **deroga esplicita e motivata** (es. bug noto a basso impatto, accettato temporaneamente), mai per omissione.

# Strategia di Versioning e Gestione del Codice — DevShelf

Codice progetto: DVS-2026-01 · Versione: 1.0 · Data: 2026-07-01

---

## 1. Stato attuale

Il repository (`github.com/MattiaBratelli04/dev-showcase`) ha oggi un solo branch, `main`, su cui è stato sviluppato finora direttamente (team di un solo sviluppatore, fase iniziale del progetto). Da questo documento in poi si adotta il workflow descritto sotto, valido sia per uno sviluppatore singolo sia per un team che si unisse in futuro.

---

## 2. Repository branching strategy

Si adotta **GitHub Flow**: un modello semplice, adatto a un progetto con deploy continuo e senza necessità di mantenere più versioni in produzione contemporaneamente (a differenza di GitFlow, pensato per release pianificate e supporto multi-versione, qui sovradimensionato).

### Branch principali

| Branch | Scopo | Regole |
|--------|-------|--------|
| `main` | Sempre deployabile. Rappresenta lo stato in produzione (o pronto per esserlo). | Nessun push diretto una volta introdotte le PR (vedi §4); protetto da branch protection su GitHub una volta attivo il team. |
| `feature/<nome-breve>` | Una funzionalità o fix in lavorazione, isolato da `main`. | Nasce da `main`, vive il tempo della feature, viene eliminato dopo il merge. Es. `feature/edit-progetto`, `feature/upload-immagini`. |
| `hotfix/<nome-breve>` | Fix urgente su un bug in produzione. | Nasce da `main`, merge rapido dopo verifica minima, stessa regola di PR delle feature ma prioritario. |

Non si usa un branch `develop` separato (tipico di GitFlow): `main` è l'unica sorgente di verità, ogni feature branch parte da lì e ci ritorna via PR.

### Flusso tipico

```
main ──●───────────────●──────────────●───▶
        \              /              /
         feature/x ───┘   feature/y ─┘
```

1. `git checkout -b feature/nome-breve` da `main` aggiornato
2. Commit incrementali sulla feature branch
3. Push e apertura Pull Request verso `main`
4. Code review (vedi §4) + eventuale CI verde
5. Merge (preferibilmente **squash merge**, per mantenere `main` con una storia lineare e leggibile)
6. Eliminazione del branch dopo il merge

---

## 3. Policy di Versioning (SemVer)

Il progetto adotta [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH` (es. `0.1.0`, valore attuale in `package.json`).

| Incremento | Quando | Esempio |
|------------|--------|---------|
| **MAJOR** | Cambi non retrocompatibili: rottura di contratti API pubblici, migration di schema che richiedono intervento manuale, cambio di autenticazione che invalida sessioni esistenti | `1.4.2` → `2.0.0` |
| **MINOR** | Nuove funzionalità retrocompatibili (es. nuova API, nuova pagina) | `1.4.2` → `1.5.0` |
| **PATCH** | Bug fix, refactoring interno, aggiornamenti di dipendenze senza impatto funzionale | `1.4.2` → `1.4.3` |

**Fase attuale (`0.x.y`):** finché la major version resta `0`, per convenzione SemVer l'API è considerata instabile e i cambi "breaking" incrementano il MINOR invece del MAJOR (es. `0.1.0` → `0.2.0`). Si passerà a `1.0.0` al primo rilascio considerato stabile per utenti reali (indicativamente: fine delle funzionalità core della SRS, vedi `docs/piano-di-progetto.md`).

Il numero di versione si aggiorna in `package.json` ad ogni release e viene taggato su Git (`git tag vX.Y.Z`) in corrispondenza del commit di merge su `main`.

---

## 4. Linee guida per le Pull Request

Ogni modifica a `main` (tranne configurazione iniziale/emergenze) passa da una PR. Regole minime:

1. **Titolo descrittivo**, focalizzato sul "perché" più che sul "cosa" (il diff mostra già il cosa)
2. **Descrizione della PR** con: contesto del cambiamento, come è stato testato, eventuali breaking change
3. **Build e typecheck puliti** prima di richiedere review: `npm run build` e `npx tsc --noEmit` senza errori
4. **Review richiesta prima del merge** — anche in un team di una persona, si consiglia una "self-review" a mente fresca (rileggere il diff su GitHub prima di premere merge) per intercettare errori banali
5. **Nessun secret committato**: `.env` è in `.gitignore`, mai forzarne l'aggiunta
6. **Merge strategy**: squash merge di default, per mantenere `main` leggibile; merge commit solo per PR con più commit logicamente distinti che vale la pena preservare
7. **Migration Prisma**: se la PR include modifiche a `backend/prisma/schema.prisma`, deve includere anche il file di migration generato (`backend/prisma/migrations/`), mai lo schema da solo

---

## 5. Commit message

Si segue lo stile presente nella storia del repo (messaggi imperativi, in italiano o inglese indifferentemente, es. `doc: add doc`, `Ridirezione / a /explore`). Non è richiesto un formato rigido (es. Conventional Commits) data la dimensione del progetto, ma si raccomanda:

- Un commit = una modifica logica coerente
- Prima riga breve (≤ 72 caratteri) che riassume il cambiamento
- Corpo del messaggio (opzionale) per spiegare il *perché*, non il *cosa* (già visibile nel diff)

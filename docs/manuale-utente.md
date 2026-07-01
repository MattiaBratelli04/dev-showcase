# Manuale d'uso — DevShelf

---

## Cos'è DevShelf?

DevShelf è un sito web che ti permette di raccogliere tutti i tuoi progetti in un unico posto e mostrarli agli altri in modo visivo e professionale. Ogni progetto appare come una piccola finestra del browser: cliccaci sopra e si apre grande, come se stessi navigando sul sito.

---

## Come iniziare

### Creare un account

1. Vai su `/auth/register`.
2. Compila il modulo:
   - **Nome completo**
   - **Username** — il soprannome con cui apparirai sul sito (es. `marco_dev`). Farà parte del tuo indirizzo pubblico (`/profile/marco_dev`), quindi scegli con cura: deve essere unico.
   - **Email** — deve essere unica, servirà per accedere
   - **Password**
3. Al termine della registrazione vieni autenticato automaticamente e portato in dashboard.

### Accedere se hai già un account

1. Vai su `/auth/login`.
2. Inserisci email e password.
3. Conferma per entrare nella dashboard.

### Password dimenticata

1. Dalla pagina di login, clicca **"Password dimenticata?"**.
2. Inserisci la tua email e clicca **"Invia link di reset"**.
3. Per motivi di privacy, il messaggio di conferma è sempre lo stesso sia che l'email esista sia che non esista (così nessuno può scoprire quali indirizzi sono registrati).
4. **Nota per l'ambiente di sviluppo/demo attuale:** non essendo collegato nessun servizio email reale, il link di reset viene mostrato direttamente in pagina (e loggato nella console del server) invece di essere inviato via email. In produzione questo passaggio verrebbe sostituito da un vero invio email.
5. Apri il link, scegli la nuova password (minimo 8 caratteri) e confermala.
6. Il link è valido **un'ora** ed è **utilizzabile una sola volta**: dopo averlo usato (o se scade) va richiesto uno nuovo.
7. Dopo il reset vieni reindirizzato al login, dove puoi accedere con la nuova password.

---

## Aggiungere un progetto

1. Dalla dashboard, clicca **"Aggiungi progetto"** (o il pulsante **+** in basso a destra su mobile).
2. Compila il wizard in 4 passi (una barra di progresso in alto mostra a che punto sei):

**Passo 1 — Info base**
- Titolo (obbligatorio)
- Descrizione (facoltativa, max 500 caratteri)
- Categoria: Web App, App Mobile, API / Backend, Design System, Tool / Script, Altro

**Passo 2 — Screenshot**
- Incolla l'URL di un'immagine già ospitata online (JPG/PNG/WebP). Vedrai subito un'anteprima.
- *Nota: il drag & drop con upload diretto del file non è ancora attivo — per ora serve un URL.*

**Passo 3 — Tecnologie**
- Scrivi una tecnologia e premi Invio per aggiungerla come etichetta (fino a 10). Clicca la **X** su un'etichetta per rimuoverla.

**Passo 4 — Dettagli finali**
- **URL del progetto** *(facoltativo)*: se il progetto è online, incolla qui l'indirizzo reale.
- **Rendi pubblico**: se attivo, il progetto compare sul tuo profilo pubblico; altrimenti resta visibile solo a te in dashboard.
- **Attiva avviso dati fittizi**: mostra ai visitatori un banner "Dati fittizi" sullo screenshot, utile se l'immagine contiene dati sensibili non reali.
3. Clicca **"Pubblica progetto 🚀"**. Il progetto compare subito in dashboard come Browser Card.

---

## Gestire i tuoi progetti

Su ogni Browser Card in dashboard, l'icona **⋮** apre un menu con:

- **Modifica** — apre la pagina di modifica del progetto, con lo stesso form del wizard di creazione (senza gli step: tutti i campi su un'unica pagina) precompilato con i dati esistenti
- **Rendi pubblico / Rendi privato** — cambia la visibilità con un click, senza riaprire il modulo
- **Copia link** — copia negli appunti il link diretto al progetto
- **Elimina** — rimuove il progetto (ti viene chiesta conferma prima)

Ogni card mostra anche un'etichetta **Pubblico**/**Privato** in alto a sinistra, per capire a colpo d'occhio la visibilità.

---

## Aprire un progetto

Clicca su una Browser Card (fuori dal menu ⋮) per aprire il **Browser Modal**: una finestra a schermo intero che mostra lo screenshot come se stessi navigando nel progetto vero, con tanto di barra indirizzi finta.

- Se hai attivato "dati fittizi", vedrai il banner di avviso.
- Se hai inserito un URL del progetto reale, un'icona di collegamento esterno ti permette di aprirlo in una nuova scheda.
- Per chiudere: clicca la **X**, oppure clicca fuori dalla finestra (sullo sfondo scuro).

---

## La tua pagina pubblica

Hai una pagina personale raggiungibile da chiunque su:

**`/profile/<tuo-username>`**

Mostra la tua foto profilo, bio, link social (GitHub, LinkedIn, sito), le etichette delle tue tecnologie e la griglia dei soli progetti impostati come **pubblici**. È possibile filtrare i progetti mostrati per tecnologia.

Se il tuo profilo non è impostato come pubblico, la pagina restituisce "Profilo non trovato" ai visitatori.

---

## Impostazioni profilo

Da **Impostazioni** (link in alto nella barra di navigazione, o "Impostazioni profilo" dalla dashboard) puoi modificare:

- **Nome completo** e **Bio** (max 300 caratteri)
- **URL foto profilo** (incolla il link di un'immagine già online, non c'è ancora upload diretto)
- **Link social**: GitHub, LinkedIn, sito web
- **Tecnologie che conosci**: stesso tag-input del wizard progetti, fino a 20 etichette
- **Profilo pubblico**: se disattivato, la tua pagina `/profile/<username>` non è più raggiungibile dai visitatori (stesso comportamento del "Privato" sui singoli progetti, ma a livello di intero profilo)

Username ed email sono mostrati per riferimento ma non modificabili da questa pagina. Le modifiche si salvano cliccando **"Salva modifiche"** e restano effettive anche dopo un ricaricamento della pagina (salvate nel database, non solo nel browser).

### Eliminare l'account

In fondo alla pagina Impostazioni trovi la **"Zona pericolosa"**. L'eliminazione è **definitiva e irreversibile**: cancella subito il tuo profilo, tutti i tuoi progetti e le tue sessioni attive — non c'è modo di recuperarli in seguito.

Per procedere:
1. Scrivi il tuo username esatto nel campo di conferma (il pulsante resta disattivato finché non corrisponde)
2. Clicca **"Elimina account definitivamente"**
3. Conferma un'ultima volta nella finestra di dialogo del browser

Dopo l'eliminazione vieni disconnesso automaticamente e riportato alla homepage.

---

## Sfogliare i profili degli altri (Esplora)

Dalla pagina **Esplora** (`/explore`) puoi sfogliare tutti i profili pubblici che hanno almeno un progetto pubblico, con ricerca e filtro per tecnologia. Ogni risultato mostra nome, username, bio, tech stack e il numero di progetti pubblici.

---

## Domande frequenti

**Posso caricare quanti progetti voglio?**
Sì, non c'è nessun limite.

**Cosa succede se cambio il mio username?**
Al momento non è possibile cambiarlo dall'interfaccia una volta creato l'account.

**Posso avere progetti che solo io vedo?**
Sì. Lascia disattivata l'opzione "Rendi pubblico" in fase di creazione, oppure disattivala in seguito dal menu ⋮ della card.

**Posso recuperare la password se la dimentico?**
Sì, dalla pagina di login clicca "Password dimenticata?" (vedi sezione dedicata sopra). In questo ambiente di sviluppo il link non arriva per email ma viene mostrato direttamente a video.

**Come faccio a eliminare il mio account?**
Da Impostazioni → Zona pericolosa (vedi sezione dedicata sopra). L'operazione è immediata e irreversibile.

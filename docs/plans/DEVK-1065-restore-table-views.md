# DEVK-1065 — Ripristino delle view di Kai Table

## 1. Goal

Ripristinare il funzionamento completo di `IbViewModule` sopra la Kai Table rifattorizzata da
DEVK-912 e DEVK-1066, mantenendo l'interfaccia grafica esistente e usando come source of truth dello
stato tabella il nuovo flusso canonico NgRx/URL.

Il risultato deve permettere di:

- mostrare sempre una view sintetica **Default**, prima e non modificabile permanentemente;
- salvare e ripristinare filtri, ordinamento, page size e aggregazioni;
- creare una view dallo stato corrente, anche quando deriva da Default o da una view modificata;
- salvare le modifiche di una view nominata senza creare duplicati impliciti;
- rinominare, duplicare, riordinare con drag-and-drop ed eliminare le view nominate;
- impedire eliminazione, rinomina e riordinamento della Default;
- gestire il cambio view con modifiche non salvate tramite `Salva / Non salvare / Annulla`;
- persistere le view in uno storage locale dedicato e isolato per `tableName`;
- usare l'ID della view nel payload URL canonico, così reload e browser back/forward mantengono la
  selezione coerente;
- validare il flusso negli esempi `full`, `api` e `with-routing`.

Fuori scope: persistenza di `pageIndex`, selezione righe, route/active row, dati della tabella,
sincronizzazione live fra schede browser e migrazione delle view precedenti.

## 2. Current State

### 2.1 Branch e prerequisiti

- La branch corrente `refactor/DEVK-1065-table-views-replace` coincide al momento con
  `origin/develop/20.0.0-table-refactoring` al commit `9aecb5f`.
- DEVK-912 ha introdotto il boundary pubblico `IbTableViewsHost`, eliminando le importazioni dirette
  da `ui/kai-table` verso `ui/views`.
- DEVK-1066 ha spostato lo stato canonico in `IbKaiTableStateFacade`/NgRx e usa il payload URL v2 con
  `selectedView` serializzato nel campo `sv`.
- La Kai Table attende già la risoluzione asincrona di una view prima dell'inizializzazione e applica
  una view atomicamente tramite `tableStateActions.applyView`, azzerando `pageIndex`.

### 2.2 Modulo Views ancora presente

La grafica e gran parte dei vecchi handler sono ancora sotto
`src/app/inobeta-ui/ui/views/`:

- `components/table-view-group/`: adapter verso `IbTableViewsHost`, stato attivo e dirty tracking;
- `components/view-list/`: tab Default, tab nominate e pulsante di creazione;
- `components/table-view/`: menu rinomina/duplica/elimina;
- `components/default-table-view/`: tab sintetica non dotata di menu;
- `components/view-dialog/`: dialog riutilizzata per CRUD e modifiche non salvate;
- `view.service.ts`: dialog, toast e dispatch delle vecchie action NgRx;
- `store/`: slice `ibViews` con array globale di view.

Il modello corrente `IView` salva `id`, `name`, `groupName` e uno snapshot composto da `filter`,
`filters?`, `pageSize`, `aggregatedColumns` e `sort`.

### 2.3 Persistenza attuale

- `IbViewModule` registra `ibViewsFeature`, ma non configura autonomamente alcuna persistenza.
- La demo persiste `ibViews` soltanto perché `src/app/app.config.ts` include il feature key nella
  hydration globale `__redux-store-inobeta-ui__`.
- Un consumer della libreria che importa solo `IbViewModule` non ottiene quindi la persistenza
  richiesta.
- Le view esistenti nel vecchio payload non devono essere migrate: DEVK-1065 parte da uno storage
  dedicato vuoto.

### 2.4 Incongruenze funzionali osservate

1. `setViewGroupName()` legge ancora la view attiva dal metodo URL legacy `getActiveView()`, che cerca
   `ibview`; il payload v2 usa invece `sv`. Dopo reload la tabella può avere lo stato corretto ma la
   linguetta Default selezionata.
2. Browser back/forward aggiorna la facade e la tabella, ma non `_activeView` del widget.
3. `resolveView()` cerca per ID nell'intero store, senza limitarsi al `groupName`; una view di un'altra
   tabella può essere risolta in caso di collisione o URL alterato.
4. La Kai Table assegna il `groupName` al view host dopo `facade.initialize()`, mentre la facade può
   aver già chiamato `resolveView()`.
5. La Default usa page size e filtro hardcoded/legacy (`emptyFilterSchema`) invece della baseline
   derivata da `tableDef`.
6. Il dirty check usa `JSON.stringify`, ignora il campo filtri canonico e può produrre falsi positivi
   per ordine diverso delle chiavi.
7. `setupViewGroup()` aggiunge Save/Undo soltanto se esiste anche una filter action; le view non sono
   quindi pienamente utilizzabili su una tabella senza `ib-filter`.
8. La lista ordina alfabeticamente tramite selector. Non esistono stato o action di riordinamento.
9. Save e rename riemettono la view attiva come se fosse una selezione utente, causando reset pagina e
   scritture URL non necessarie.
10. Il pulsante `+` parte di default dallo snapshot della Default, non sempre dallo stato corrente.
11. Il dialog per modifiche non salvate non distingue in modo esplicito i tre esiti Save/Discard/Cancel.
12. Il nome viene controllato solo come stringa non vuota; non esiste unicità case-insensitive per
    tabella.

### 2.5 Esempi di validazione esistenti

- `kai-table-full-example.ts`: tabella locale `tableName="fullExample"`, filtri completi, sort,
  page size e aggregazione su `amount`.
- `server-side/kai-table-api-example.ts`: datasource remoto `tableName="remoteExample"`; consente di
  verificare che una view produca la request server-side coerente.
- `kai-table-with-routing.ts`: tabella locale `tableName="routingExample"` con child route; la
  navigazione corrente non preserva esplicitamente i query param.

Tutti e tre importano già `IbViewModule` e proiettano `<ib-table-view-group />`.

## 3. Assumptions / Open Questions

### Decisioni confermate

1. Una view salva esclusivamente raw filters, sort, page size e aggregated columns.
2. `pageIndex`, selezione righe, active row/route e righe dati non fanno parte dello snapshot.
3. La Default rappresenta la baseline normale della tabella: default tecnici più campi `initial*` di
   `tableDef`, senza applicare una view salvata; quando viene applicata, `pageIndex` torna a zero.
4. La Default non viene mai scritta in localStorage, resta prima e non è rinominabile, eliminabile o
   trascinabile.
5. Save sulla Default apre la creazione di una nuova view usando lo stato corrente.
6. Il pulsante `+` e Duplica catturano sempre lo stato corrente, non lo snapshot precedentemente
   salvato, e selezionano la nuova view.
7. Cambiando view con stato dirty viene mostrato `Salva / Non salvare / Annulla`. Se è attiva Default,
   Save richiede anche il nome della nuova view; annullare il secondo dialog annulla il cambio.
8. I nomi sono trim-mati, obbligatori e unici case-insensitive all'interno dello stesso `tableName`.
   Rinominare mantenendo il proprio nome normalizzato è valido.
9. Le view nominate sono riordinabili con drag-and-drop orizzontale; l'ordine dell'array persistito è
   l'ordine visuale.
10. Lo storage è dedicato al modulo Views e isolato per `tableName`; non dipende dalla hydration NgRx
    dell'applicazione.
11. Non viene letta né cancellata la vecchia chiave `__redux-store-inobeta-ui__.ibViews`; i dati
    precedenti vengono semplicemente ignorati.
12. La view selezionata non viene persistita come preferenza separata: è ripristinata dall'URL. Senza
    view nell'URL si apre Default, salvo l'API esistente `tableDef.initialView`, che resta supportata.
13. Eliminare la view attiva applica immediatamente Default e aggiorna l'URL con `selectedView: null`.
14. Non è richiesto ascoltare l'evento browser `storage`; le modifiche di altre schede diventano
    visibili dopo reload.
15. L'etichetta visibile è esattamente `Default`, fornita dalla traduzione
    `shared.ibTableView.defaultView`.
16. Le API pubbliche del modulo Views possono cambiare perché non risultano consumer. Gli export
    pubblici di Kai Table devono invece restare compatibili; sono consentite soltanto estensioni
    additive del contratto.
17. I `tableName` degli esempi restano invariati per non invalidare URL e isolamento dello storage.

Non rimangono open question bloccanti.

## 4. Proposed Approach

### 4.1 Storage dedicato e modello canonico

Sostituire lo slice NgRx `ibViews` con persistenza sincrona e tipizzata nel modulo Views:

- token configurabile `IB_VIEWS_STORAGE_KEY`, con prefisso di default dedicato;
- una chiave per gruppo, nel formato stabile `<prefix>:<groupName>`;
- payload versionato interno `{ version: 1, views: [...] }`;
- array persistito già nell'ordine visuale, senza un secondo campo `position`;
- ID stabile generato con `crypto.randomUUID()` e fallback non bloccante;
- validazione difensiva del dato letto; JSON malformato o shape invalida produce lista vuota senza
  bloccare la tabella;
- errori di scrittura non vengono ingoiati: il service mantiene lo stato precedente e mostra un toast
  traducibile.

Il nuovo modello pubblico del feature sarà `IbSavedTableView` (nome da confermare nel codice solo in
caso di collisione), con dati canonici `filters`, `sort`, `pageSize` e `aggregatedColumns`. Il sentinel
Default resta dettaglio interno e non viene persistito né esposto al boundary Kai Table.

### 4.2 Default come baseline della tabella

La Default non deve costruire autonomamente uno snapshot. La facade Kai Table calcola una baseline
stabile usando lo stesso resolver di DEVK-1066:

- default tecnici;
- `initialSort`, `initialFilters`, `initialPageSize` e `initialAggregatedColumns`;
- `selectedView: null`;
- nessuna risoluzione di `initialView` nello snapshot Default;
- nessun `pageIndex` nello snapshot view; l'applicazione usa il reset a zero già garantito dal reducer.

`IbTable` passa questa baseline al view host tramite un hook additivo. Se il consumer usa un proprio
host compilato contro l'API precedente, il metodo base no-op conserva la compatibilità binaria e di
compilazione.

### 4.3 Sincronizzazione canonica della selezione

L'ordine di bootstrap diventa:

1. assegnare `tableName/groupName` al view host;
2. permettere al provider di caricare sincronicamente le view del gruppo;
3. inizializzare la facade, che può risolvere `initialView` o la view URL nel gruppo corretto;
4. fornire accessor stato corrente e snapshot Default;
5. sincronizzare la tab attiva dal `selectedView` canonico senza emettere un nuovo intent;
6. sottoscrivere gli intent di selezione prodotti dall'utente.

Un secondo hook additivo sul host aggiorna la tab attiva per inizializzazione, reload e browser
back/forward. Soltanto un click utente/creazione/eliminazione attiva emette `activeViewChanged`; save,
rename e reorder aggiornano storage/UI senza riapplicare la view.

### 4.4 Dirty tracking e comandi

- Il dirty check confronta solo i quattro campi persistibili, dopo normalizzazione canonica e con una
  comparazione profonda non sensibile all'ordine delle chiavi.
- La Default viene confrontata con la baseline ricevuta dalla tabella; una modifica non viene mai
  persistita sulla Default.
- Una view nominata viene confrontata con il proprio snapshot salvato.
- Save nominato sostituisce soltanto `data` e azzera dirty, mantenendo ID, nome, ordine, selezione e
  pagina corrente.
- Rename e reorder non emettono table intent e non modificano l'URL.
- Create/Duplicate salva lo stato corrente e seleziona il nuovo ID; l'applicazione della view continua
  a usare l'invariante DEVK-1066 `pageIndex = 0`.
- Delete attivo seleziona/applica Default; delete non attivo non cambia lo stato tabella.

### 4.5 Drag-and-drop e dialog

- Importare `DragDropModule` nel feature module.
- Rendere trascinabili soltanto le tab nominate; Default e pulsante `+` restano fuori dalla drop list.
- Usare `track view.id` e persistere il nuovo array al drop.
- Tipizzare il risultato dialog come azione esplicita (`save`, `discard`, `cancel`) invece di booleani
  ambigui.
- Mostrare la validazione di required/duplicato con chiavi ngx-translate; nessuna stringa visibile va
  hardcoded nei componenti o template.

### 4.6 Public API

- Conservare invariati gli export Kai Table esistenti, incluso `IbTableViewsHost` e
  `IbTableViewsData`.
- Aggiungere al base host soltanto hook concreti/no-op per baseline e sincronizzazione selezione.
- Mantenere `public_api.ts` come barrel root; non serve una nuova entry point.
- Il barrel Views smette di esportare lo store rimosso e può esportare il nuovo modello, il token,
  `IbViewService`, `IbViewModule` e `IbTableViewGroup`.
- I simboli NgRx Views obsoleti possono essere rimossi perché la breaking change del solo modulo Views
  è stata esplicitamente accettata.

## 5. Step-by-Step Plan

### Step 1 — Estendere in modo compatibile il bridge Kai Table/Views

**Target executor:** `kai-table-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`
- `src/app/inobeta-ui/ui/kai-table/table-state.facade.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`

**Read-only reference files:**

- `src/app/inobeta-ui/ui/kai-table/table-state-resolver.ts`
- `src/app/inobeta-ui/ui/kai-table/table.types.ts`
- `src/app/inobeta-ui/ui/kai-table/store/url-state/actions.ts`
- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts`

**Objective:** fornire al view host la baseline Default e la selezione canonica, assegnando il gruppo
prima della risoluzione URL senza introdurre dipendenze da `ui/views`.

**Key requirements:**

1. Aggiungere al base host hook concreti/no-op per ricevere la Default e sincronizzare l'ID attivo;
   non aggiungere nuovi membri abstract obbligatori.
2. Conservare i membri e i tipi pubblici esistenti di `IbTableViewsHost`/`IbTableViewsData`.
3. Calcolare nella facade uno snapshot Default stabile da `tableDef` e default tecnici, ignorando
   `initialView`, URL e `initialPageIndex`.
4. Chiamare `setViewGroupName(tableName)` prima di `facade.initialize()`.
5. Dopo l'init, fornire accessor corrente, baseline Default e ID canonico attivo.
6. Sincronizzare il host su ogni snapshot canonico successivo, incluso back/forward, senza feedback
   verso `applyView`.
7. Aggiungere i toolbar portals Views anche se non esiste `ib-filter`; aggiungere l'azione filtro solo
   quando disponibile.
8. Rimuovere l'assegnazione legacy del view host al compatibility data source se non ha più effetti.

**Constraints:** nessuna importazione da `ui/views`, nessuna modifica allo schema URL, nessuna
rimozione di export Kai Table, nessun cambiamento a data source o mobile non necessario.

**Validation:** `npm run packagr`; verifica statica che `ui/kai-table` non importi `ui/views`.

**Stop condition:** fermarsi se la baseline richiede di modificare la precedenza URL o lo schema v2;
riportare `NEED CLARIFICATION` invece di cambiare tali contratti.

**Executor Input:**

~~~
## TASK:
Extend the Kai Table views bridge with a Default baseline and canonical active-view synchronization.

## CONTEXT:
DEVK-1066 made IbKaiTableStateFacade/NgRx the canonical table state. The current views host is assigned its group only after facade initialization, has no Default baseline from tableDef, and is not synchronized when selectedView changes through URL hydration.

## OBJECTIVE:
Allow a decoupled views provider to resolve the correct group before initialization, render the canonical selected view, and apply a table-derived Default state without breaking existing Kai Table public exports.

## REQUIREMENTS:
1. Modify only the allowed Kai Table files.
2. Add only concrete/no-op compatibility hooks to IbTableViewsHost for Default data and active-view synchronization; do not add required abstract methods.
3. Preserve all existing IbTableViewsHost and IbTableViewsData members.
4. Derive the Default view snapshot from technical defaults plus tableDef initial sort, raw filters, page size and aggregations; force selectedView null, exclude initialView/URL, and do not persist pageIndex.
5. Set the view group name before facade.initialize so resolveView is group-aware.
6. Pass current-state accessor and Default baseline after initialization.
7. Synchronize the host from every canonical selectedView change without causing an activeViewChanged loop.
8. Make views toolbar portals independent from the presence of ib-filter; keep the filter portal conditional.
9. Remove obsolete assignment of the host to the compatibility data source if it is no longer consumed.

## CONSTRAINTS:
- Do not import anything from ui/views.
- Do not change the URL payload, reducer invariants, tableName semantics, mobile behavior, or existing public exports.
- Do not use any or add user-visible strings.
- Keep view application page reset behavior unchanged.

## OUTPUT:
Return changed files, the initialization order, the Default-baseline rule, and commands executed.

## ACCEPTANCE CRITERIA:
- `npm run packagr` succeeds.
- Existing custom IbTableViewsHost subclasses remain source-compatible.
- setViewGroupName runs before resolveView can be called by facade initialization.
- Canonical selectedView changes can update a host without emitting a second table intent.
- Views toolbar portals are available on a table without ib-filter.
- No Kai Table file imports ui/views.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 2 — Introdurre storage locale e service Views tipizzati

**Target executor:** `task-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Routing note:** non esiste un executor specializzato per `ui/views`; questa è una scope exception
limitata al modello, storage, service e dialog del feature.  
**Allowed files:**

- `src/app/inobeta-ui/ui/views/view.types.ts` (new)
- `src/app/inobeta-ui/ui/views/view.tokens.ts` (new)
- `src/app/inobeta-ui/ui/views/view-storage.service.ts` (new, se mantenuto separato)
- `src/app/inobeta-ui/ui/views/view.service.ts`
- `src/app/inobeta-ui/ui/views/components/view-dialog/view-dialog.component.ts`
- `src/app/inobeta-ui/ui/views/translations.ts`
- `src/assets/i18n/it.json`

**Read-only reference files:**

- `src/app/inobeta-ui/storage/storage.service.ts`
- `src/app/inobeta-ui/ui/views/store/views/table-view.ts`
- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`
- `src/app/inobeta-ui/ui/kai-table/table.types.ts`

**Objective:** rendere CRUD, ordine e validazione indipendenti dallo store applicativo, mantenendo
temporaneamente compilabili le call site correnti fino allo Step 3.

**Key requirements:**

1. Definire un modello `Ib*` canonico per view salvata e snapshot persistibile.
2. Introdurre `IB_VIEWS_STORAGE_KEY` con un default dedicato e chiavi isolate per `groupName`.
3. Leggere/scrivere un envelope versionato e validare shape e tipi.
4. Esporre uno stream/lista reattiva per gruppo e implementare
   get/resolve/create/save/rename/delete/reorder con scope obbligatorio per gruppo.
5. Impedire a livello service operazioni sul sentinel Default.
6. Normalizzare i nomi con trim e imporre unicità case-insensitive per gruppo.
7. Preservare l'ordine dell'array; save e rename non devono spostare la view.
8. Gestire localStorage assente/malformato senza throw e notificare errori di write tramite toast.
9. Tipizzare i dialog result e supportare Save/Discard/Cancel.
10. Aggiungere le chiavi di traduzione necessarie, inclusi Default, Non salvare, nome duplicato ed
    eventuale errore storage, nel catalogo library e nell'asset italiano richiesto dalla demo. Poiché
    il loader fonde `shared` in modo shallow, nell'asset l'intero sotto-albero `shared.ibTableView`
    deve restare completo e sincronizzato: una patch parziale nasconderebbe le chiavi della libreria.
11. Conservare temporaneamente firme strutturalmente compatibili con il componente corrente, senza
    reintrodurre dispatch NgRx.

**Constraints:** nessuna migrazione dal vecchio store, nessun listener cross-tab, nessun `any` nuovo,
nessuna modifica ai componenti lista/gruppo in questo step.

**Validation:** `npm run packagr`; ispezione del barrel Views.

**Stop condition:** fermarsi se è necessario modificare `IbStorageService` globale; il wrapper Views
deve contenere validazione e gestione errori nel proprio perimetro.

**Executor Input:**

~~~
## TASK:
Implement typed, per-table localStorage persistence and dialog contracts for the Views feature.

## CONTEXT:
IbViewService currently dispatches the ibViews NgRx feature and persistence works only when an application hydrates that feature. DEVK-1065 must use a dedicated storage key, start from empty data, preserve user ordering, and enforce unique names per table.

## OBJECTIVE:
Provide a typed Views repository/service that owns CRUD, ordering, validation, storage errors, dialogs and toasts without depending on NgRx hydration.

## REQUIREMENTS:
1. Modify only the allowed Views files.
2. Add Ib-prefixed saved-view and canonical snapshot types containing raw filters, sort, pageSize and aggregatedColumns only.
3. Add configurable IB_VIEWS_STORAGE_KEY and store a versioned payload under one key per groupName.
4. Expose a reactive per-group view list and implement group-scoped read/resolve/create/save/rename/delete/reorder operations.
5. Keep stable IDs and stable array positions on save/rename; create appends and reorder persists the supplied order.
6. Use crypto.randomUUID with a safe fallback.
7. Trim names, reject blank names, and reject case-insensitive duplicates within the same group; allow a renamed view to retain its own normalized name.
8. Reject all persistent operations targeting the internal Default sentinel.
9. Treat missing, malformed or invalid stored data as an empty list without throwing; report write failures with a translated toast and retain the previous in-memory state.
10. Introduce explicit save/discard/cancel dialog results and translated validation feedback.
11. Add the required Italian keys to the library catalog and keep the complete shared.ibTableView subtree synchronized in src/assets/i18n/it.json; a partial subtree would override and hide library keys because the current loader merges shared shallowly.
12. Keep current component call sites compiling until the next step, but do not dispatch old TableViewActions.

## CONSTRAINTS:
- Do not read, migrate, or delete __redux-store-inobeta-ui__.ibViews.
- Do not add a storage event listener.
- Do not modify Kai Table or list/group/tab components.
- Do not hardcode visible strings or introduce any.
- Do not broaden changes to the global storage abstraction.

## OUTPUT:
Return changed files, storage format/key strategy, public symbols, validation rules, and commands executed.

## ACCEPTANCE CRITERIA:
- `npm run packagr` succeeds.
- Views CRUD no longer dispatches NgRx actions.
- Data for two groupName values is stored and resolved independently.
- Reorder survives a fresh read from storage.
- Blank and case-insensitive duplicate names are rejected.
- Default cannot be persisted, renamed, deleted, saved, or reordered through the service.
- No migration code references the old Redux hydration key.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 3 — Collegare UI Views, dirty state e drag-and-drop

**Target executor:** `task-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Routing note:** scope exception per l'Angular UI di `ui/views`, poiché non è disponibile un executor
Views dedicato.  
**Allowed files:**

- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts`
- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.html`
- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.scss`
- `src/app/inobeta-ui/ui/views/components/view-list/view-list.component.ts`
- `src/app/inobeta-ui/ui/views/components/view-list/view-list.component.html`
- `src/app/inobeta-ui/ui/views/components/view-list/view-list.component.scss`
- `src/app/inobeta-ui/ui/views/components/table-view/table-view.component.ts`
- `src/app/inobeta-ui/ui/views/components/table-view/table-view.component.html`
- `src/app/inobeta-ui/ui/views/components/default-table-view/default-table-view.component.ts`
- `src/app/inobeta-ui/ui/views/components/default-table-view/default-table-view.component.html`
- `src/app/inobeta-ui/ui/views/view.module.ts`

**Read-only reference files:** Step 1 e Step 2 production files; `table.component.ts`;
`table-state.facade.ts`.

**Objective:** sostituire il vecchio stato locale/store con un widget guidato dalla selezione
canonica, completando tutti i flussi utente concordati.

**Key requirements:**

1. Rimuovere da `IbTableViewGroup` dipendenze da Store e `IbTableUrlService`.
2. Caricare e osservare le view del solo `viewGroupName` tramite il nuovo service.
3. Risolvere una view soltanto nel gruppo attivo.
4. Implementare gli hook additivi dello Step 1 per baseline Default e selezione canonica, senza
   emettere intent durante hydration/back-forward.
5. Separare aggiornamenti interni da selezioni utente: save, rename e reorder non applicano la view.
6. Usare lo stato corrente per `+` e Duplica e selezionare la nuova view.
7. Save Default crea una nuova view; Save nominato aggiorna soltanto il suo snapshot.
8. Implementare il dialog dirty a tre esiti; Cancel resta sulla view corrente.
9. Delete attivo applica Default; proteggere comunque Default anche negli handler.
10. Confrontare profondamente lo snapshot canonico escludendo page index e ordine delle chiavi.
11. Integrare CDK drag-and-drop orizzontale sulle sole view nominate e persistere l'ordine.
12. Mantenere layout e stile attuali salvo aggiustamenti minimi per drop list/drag preview.
13. Usare template null-safe, `track view.id`, TranslatePipe e nessuna sintassi TypeScript nel markup.

**Constraints:** nessun accesso diretto a Router/URL/store, nessuna nuova slice NgRx, nessun listener
cross-tab, nessun redesign CSS.

**Validation:** `npm run build` e `npm run packagr`.

**Stop condition:** se la selezione canonica non può essere sincronizzata tramite gli hook dello Step
1, fermarsi; non leggere direttamente il query string come workaround.

**Executor Input:**

~~~
## TASK:
Rewire the Views UI to dedicated storage, canonical table selection, dirty workflows, and horizontal drag-and-drop.

## CONTEXT:
The current components still select ibViews from NgRx, read a legacy ibview URL field, hardcode Default data, alphabetically sort views, and emit active-view changes for metadata-only operations. Steps 1 and 2 provide additive table-host hooks and typed storage/service APIs.

## OBJECTIVE:
Make the existing view tabs fully functional while preserving their current visual design.

## REQUIREMENTS:
1. Modify only the allowed Views component/module files.
2. Remove Store and IbTableUrlService usage from IbTableViewGroup.
3. Load, display and resolve only views belonging to the configured groupName.
4. Keep an implicit Default tab first, never persisted and never draggable/editable/deletable.
5. Consume the Default baseline supplied by Kai Table and use canonical selectedView synchronization for init, reload and back/forward without emitting a user intent.
6. Emit activeViewChanged only for actual user selection, create/duplicate selection, or active-view deletion fallback.
7. Make Add and Duplicate capture the current accessor snapshot and select the new view.
8. Save Default as a new named view; save a named view in place without reapplying it or resetting page state.
9. Rename and reorder without applying the view or changing the table URL.
10. On dirty switch expose Save, Discard and Cancel. For dirty Default, Save must complete create-name flow before switching; cancelling either dialog keeps the current state/view.
11. Delete active view by applying Default; deleting inactive view must not alter table state.
12. Compare only normalized raw filters, sort, pageSize and aggregatedColumns with order-insensitive deep equality.
13. Add horizontal CDK drag-and-drop for named tabs only, persist order, and track list items by ID.
14. Preserve existing layout and use translated/null-safe Angular templates.

## CONSTRAINTS:
- Do not read Router, URL query params, NgRx Store, or the old views selectors.
- Do not add pageIndex, row selection, route state, or table data to a view.
- Do not implement cross-tab live synchronization.
- Do not redesign the component or hardcode visible strings.
- Do not use casts or TypeScript syntax in templates.

## OUTPUT:
Return changed files, event flow, dirty-state rules, drag/drop behavior, and commands executed.

## ACCEPTANCE CRITERIA:
- `npm run build` and `npm run packagr` succeed.
- Default is first, labelled through shared.ibTableView.defaultView, and has no edit/delete/drag affordance.
- Add/Duplicate persist current state and select the new ID.
- Save/Rename/Reorder do not emit a table selection intent.
- Back/forward canonical selection updates the highlighted tab without a feedback loop.
- Reorder remains after reload from the dedicated storage.
- IbTableViewGroup contains no Store, IbTableUrlService, getActiveView, or selectViews usage.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 4 — Rimuovere lo store Views obsoleto e finalizzare gli export

**Target executor:** `task-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/inobeta-ui/ui/views/store/actions.ts` (delete)
- `src/app/inobeta-ui/ui/views/store/index.ts` (delete)
- `src/app/inobeta-ui/ui/views/store/reducer.ts` (delete)
- `src/app/inobeta-ui/ui/views/store/views/index.ts` (delete)
- `src/app/inobeta-ui/ui/views/store/views/reducer.ts` (delete)
- `src/app/inobeta-ui/ui/views/store/views/table-view.ts` (delete)
- `src/app/inobeta-ui/ui/views/view.module.ts`
- `src/app/inobeta-ui/ui/views/index.ts`
- `src/app/inobeta-ui/ui/views/components/index.ts`
- `src/app/app.config.ts`
- `public_api.ts` (solo verifica/minima correzione del barrel)

**Read-only reference files:** tutti i production file Views modificati negli Step 2-3;
`src/app/inobeta-ui/ui/kai-table/index.ts`.

**Objective:** eliminare la dipendenza da `provideState(ibViewsFeature)` e pubblicare soltanto la nuova
superficie Views, senza alterare gli export Kai Table.

**Key requirements:**

1. Rimuovere provider/import NgRx da `IbViewModule`.
2. Rimuovere i production file dello store Views e il relativo export dal barrel.
3. Rimuovere `ibViews` dalla whitelist hydration della demo; non cancellare dati legacy a runtime.
4. Esportare i nuovi tipi/token/service richiesti e il componente host.
5. Non rimuovere o rinominare simboli dal barrel Kai Table.
6. Lasciare invariato il re-export root di `ui/views/index`, salvo correzioni strettamente necessarie.
7. Evitare di ampliare la superficie pubblica con componenti interni nuovi.

**Constraints:** nessuna modifica funzionale a storage/UI, nessuna pulizia di altri feature key,
nessuna migrazione.

**Validation:** `npm run packagr` e ricerca di `ibViewsFeature`/`provideState` sotto `ui/views`.

**Stop condition:** se un simbolo store Views è usato fuori dal feature, riportare il consumer prima
di rimuoverlo; non modificare quel consumer fuori dai file consentiti.

**Executor Input:**

~~~
## TASK:
Remove the obsolete Views NgRx feature and finalize Views public exports.

## CONTEXT:
After Steps 2 and 3, Views state and persistence are owned by the dedicated localStorage service. The old ui/views/store feature and demo hydration whitelist are obsolete. Breaking changes inside the Views module are accepted, but Kai Table exports must remain unchanged.

## OBJECTIVE:
Ship IbViewModule without NgRx feature registration and expose the new supported Views API through the existing root barrel.

## REQUIREMENTS:
1. Modify/delete only allowed files.
2. Remove provideState(ibViewsFeature), Store feature imports, and production store files.
3. Remove ibViews from the demo hydration whitelist without deleting the legacy localStorage value at runtime.
4. Remove store/action/reducer/selectors from the Views barrel.
5. Export the new saved-view types, storage token, service, module, and table-view-group host as needed.
6. Keep public_api.ts re-exporting the Views barrel and preserve every Kai Table export.
7. Keep DragDropModule and other imports required by the final Views UI.

## CONSTRAINTS:
- Do not modify functional component/service behavior.
- Do not alter Kai Table files or exports.
- Do not add migration or cleanup code for old persisted data.
- Do not clean unrelated hydration feature keys.

## OUTPUT:
Return deleted/changed files, final public Views symbols, and validation commands.

## ACCEPTANCE CRITERIA:
- `npm run packagr` succeeds.
- ui/views has no provideState, ibViewsFeature, TableViewActions, selectViews, or selectTableViews production reference.
- src/app/app.config.ts no longer whitelists ibViews.
- public_api.ts still re-exports both Kai Table and Views barrels.
- No Kai Table public symbol is removed or renamed.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 5 — Testare storage, service, dialog e validazione nomi

**Target executor:** `unit-jasmine-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/inobeta-ui/ui/views/view-storage.service.spec.ts` (new, se applicabile)
- `src/app/inobeta-ui/ui/views/view.service.spec.ts`
- `src/app/inobeta-ui/ui/views/components/view-dialog/view-dialog.component.spec.ts` (new)

**Read-only reference files:** Step 2 e Step 4 production files.

**Objective:** fissare il contratto di persistenza autonoma, isolamento, ordine, lock Default e
risultati dialog.

**Key requirements:** coprire CRUD, reload, due gruppi, reorder, malformed payload, write failure,
required/trim/unicità case-insensitive, rename con stesso nome, Default guard e tre esiti dialog.

**Constraints:** nessuna modifica production salvo fix minimo documentato; usare Jasmine/Karma,
NoopAnimations e harness Material.

**Validation:** test focalizzati dei file aggiunti e assenza di `fdescribe`/`fit`.

**Stop condition:** se un test richiede ripristinare NgRx Views, fermarsi; lo store non fa parte del
nuovo contratto.

**Executor Input:**

~~~
## TASK:
Write focused Jasmine tests for Views storage, service, dialogs, and name validation.

## CONTEXT:
Views now persist a versioned payload under a dedicated per-group localStorage key and no longer use NgRx hydration. Names are required and unique case-insensitively. Dialogs expose save/discard/cancel outcomes.

## OBJECTIVE:
Verify the persistence and domain invariants independently from IbTableViewGroup.

## REQUIREMENTS:
1. Modify only allowed spec files.
2. Cover create, resolve, save, rename, delete and reorder.
3. Simulate a fresh service/read and prove persisted views and order reload correctly.
4. Prove two groupName values are isolated.
5. Prove blank/whitespace and case-insensitive duplicate names are rejected, while keeping the current normalized rename is allowed.
6. Prove Default sentinel operations are rejected and never written.
7. Cover missing, malformed, wrong-version/invalid-shape storage and localStorage write failure.
8. Cover translated create/rename/delete and save/discard/cancel dialog results with Material harnesses.
9. Verify no TableViewActions dispatch or MockStore setup remains.

## CONSTRAINTS:
- Do not restore or mock the old Views NgRx feature.
- Do not modify production code except a minimal test-discovered fix, reported explicitly.
- Use NoopAnimationsModule, TranslateModule and CDK/Material harnesses where relevant.
- Do not use fdescribe or fit.

## OUTPUT:
Return changed specs, covered cases, focused test commands and results.

## ACCEPTANCE CRITERIA:
- Focused Views storage/service/dialog tests pass with `ng test --include='src/app/inobeta-ui/ui/views/**/*.spec.ts' --watch=false` or narrower equivalent commands.
- A test proves order survives reload.
- A test proves group isolation.
- A test proves duplicate-name and Default guards.
- No tested setup provides ibViews NgRx state.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 6 — Testare i flussi UI del view host

**Target executor:** `unit-jasmine-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts`
- `src/app/inobeta-ui/ui/views/components/view-list/view-list.component.spec.ts` (new)
- `src/app/inobeta-ui/ui/views/components/table-view/table-view.component.spec.ts` (new, se utile)
- `src/app/inobeta-ui/ui/views/store/views/reducer.spec.ts` (delete)

**Read-only reference files:** Step 1-4 production files; Step 5 specs per riuso stub.

**Objective:** coprire selezione canonica, dirty state e tutti i comandi UI senza dipendere da Store o
URL legacy.

**Key requirements:** coprire Default baseline/lock, create dallo stato corrente, save Default/named,
rename, duplicate, delete attivo/inattivo, reorder, dirty switch Save/Discard/Cancel, sync URL simulata,
group-scoped resolve e toolbar portals.

**Constraints:** niente MockStore Views o spy `getActiveView`; testare emissioni e non-emissioni con
assertion esplicite.

**Validation:** test focalizzato `table-view-group.component.spec.ts` e suite Views.

**Stop condition:** non reintrodurre proprietà private della Kai Table nel test; usare il contratto
`IbTableViewsHost`.

**Executor Input:**

~~~
## TASK:
Rewrite and expand Views host/component Jasmine tests for the final DEVK-1065 UI flows.

## CONTEXT:
IbTableViewGroup no longer reads NgRx Views state or legacy URL fields. It receives Default data and canonical selectedView through IbTableViewsHost hooks and emits only user selection intents. Named tabs support horizontal reorder.

## OBJECTIVE:
Prove all view-management flows and feedback-loop protections at the component boundary.

## REQUIREMENTS:
1. Modify only allowed spec files and delete the obsolete Views reducer spec.
2. Remove MockStore ibViews, selectViews and IbTableUrlService.getActiveView setup.
3. Test group setup before resolve and group-scoped resolve, including same ID in another group.
4. Test Default baseline rendering, label key, first position and lack of rename/delete/drag affordances.
5. Test canonical selectedView synchronization for saved view, null Default and unknown ID without activeViewChanged feedback.
6. Test Add and Duplicate capture current accessor state, persist and select the new view.
7. Test Save on Default creates; Save on named view updates in place and emits no selection intent.
8. Test Rename and reorder preserve active state and emit no table intent; reorder persists.
9. Test active and inactive delete behavior; active delete emits Default with viewId null.
10. Test dirty comparison for filters, sort, pageSize and aggregations, ignoring pageIndex and object-key order.
11. Test dirty switch Save/Discard/Cancel for named and Default flows, including cancellation of the name dialog.
12. Test toolbar portals remain available without a filter component dependency.
13. Use explicit expectations in every CRUD test; remove empty/commented assertions.

## CONSTRAINTS:
- Do not provide the old Views NgRx feature or read legacy URL state.
- Do not modify production code except a minimal test-discovered fix, reported explicitly.
- Use NoopAnimationsModule, TranslateModule and Material/CDK harnesses where applicable.
- Do not use fdescribe or fit.

## OUTPUT:
Return changed/deleted specs, covered scenarios and focused test results.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts' --watch=false` passes.
- The complete Views spec glob compiles without the deleted store production files.
- Tests explicitly prove non-emission on save, rename, reorder and canonical hydration.
- Tests explicitly prove Default lock and drag/drop persistence.
- No fdescribe, fit, MockStore ibViews, getActiveView or commented-out assertion remains.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 7 — Coprire il bridge Kai Table e la sincronizzazione URL

**Target executor:** `unit-jasmine-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table-views-host.stub.spec.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
- `src/app/inobeta-ui/ui/kai-table/table-state.facade.spec.ts`

**Read-only reference files:** Step 1 production files; URL codec/effect/reducer specs esistenti.

**Objective:** verificare ordine di inizializzazione, baseline Default, host sync e mantenimento del
contratto URL canonico.

**Key requirements:** testare group-before-resolve, baseline da tableDef, `initialView` esclusa dalla
Default, sync selectedView init/back-forward, no loop, apply Default `viewId:null`, action portals senza
filter e tabella senza host invariata.

**Constraints:** usare lo stub host, non importare `IbViewModule`; non duplicare i test CRUD Views.

**Validation:** test focalizzati dei tre file e `npm run packagr`.

**Stop condition:** se serve importare `ui/views` nelle spec Kai Table, fermarsi e mantenere il boundary
astratto.

**Executor Input:**

~~~
## TASK:
Add Jasmine coverage for the compatible Kai Table views bridge and canonical URL synchronization.

## CONTEXT:
Step 1 sets groupName before facade initialization, derives a Default baseline, and synchronizes the host from canonical selectedView changes through additive no-op hooks. Kai Table must remain decoupled from IbViewModule.

## OBJECTIVE:
Verify the table-side contract without testing Views CRUD internals.

## REQUIREMENTS:
1. Modify only allowed Kai Table spec/stub files.
2. Extend the stub to record Default data and canonical active-view synchronization while preserving old subclass compatibility.
3. Prove setViewGroupName happens before facade calls resolveView.
4. Prove Default data contains technical/tableDef initial sort, raw filters, pageSize and aggregations, excludes initialView and pageIndex, and represents selectedView null.
5. Prove an initial URL view and a subsequent back/forward selectedView change synchronize the host without a second applyView dispatch.
6. Prove a user Default selection dispatches applyView with selectedView null and the Default snapshot, allowing the existing canonical URL effect to write sv:null.
7. Prove unknown view fallback synchronizes Default.
8. Prove view toolbar portals are forwarded when no ib-filter exists.
9. Preserve tests showing a table without a views host behaves unchanged and no IbViewModule import is needed.

## CONSTRAINTS:
- Do not import ui/views or IbViewModule.
- Do not change production code except a minimal test-discovered fix, reported explicitly.
- Do not alter URL codec/reducer semantics.
- Do not use fdescribe or fit.

## OUTPUT:
Return changed specs/stub, covered bridge cases and test/build results.

## ACCEPTANCE CRITERIA:
- Focused table component and facade tests pass.
- `npm run packagr` succeeds.
- No Kai Table spec imports IbViewModule.
- A test proves canonical synchronization has no feedback dispatch.
- A test proves the table-derived Default baseline and viewId null behavior.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 8 — Validare e allineare gli esempi full, API e routing

**Target executor:** `examples-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/examples/kai-table-example/kai-table-full-example.ts`
- `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts`
- `src/app/examples/kai-table-example/kai-table-with-routing.ts`

**Read-only reference files:** public API finale; `github-data-source.ts`; routing configuration.

**Objective:** mantenere i tre esempi come scenari di accettazione reali e preservare il query param
della tabella durante la navigazione child.

**Key requirements:** mantenere `tableName` e layout; conservare `IbViewModule`/view group; aggiungere
`queryParamsHandling: "preserve"` alla navigazione routing; nessuna configurazione storage app-level.

**Constraints:** nessun testo/layout/dataset nuovo, nessuna modifica libreria, nessun cambio route o
tableName.

**Validation:** `npm run build` e verifica manuale dei tre scenari elencati nella checklist finale.

**Stop condition:** correggere solo blocker necessari alla validazione; non rifattorizzare gli esempi.

**Executor Input:**

~~~
## TASK:
Validate and minimally align the full, remote API, and routing Kai Table examples with restored Views.

## CONTEXT:
All three examples already import IbViewModule and project ib-table-view-group. Their stable tableName values are fullExample, remoteExample, and routingExample. The routing example currently navigates to a child route without explicitly preserving query parameters.

## OBJECTIVE:
Keep the examples as acceptance environments for local, remote, reload, URL and routed view behavior.

## REQUIREMENTS:
1. Modify only the three allowed example files and only when needed.
2. Preserve all tableName values, routes, datasets, columns and visual layout.
3. Keep IbViewModule and ib-table-view-group in all three examples.
4. Make child-detail navigation in the routing example preserve the table query parameter.
5. Do not add application-level hydration or storage configuration; IbViewModule must work autonomously.
6. Run the production demo build.
7. Report manual scenarios for local create/save/rename/reorder/delete/reload, remote request restoration, and routed query-param preservation.

## CONSTRAINTS:
- Do not modify library source, routing configuration, menu data or github-data-source.ts.
- Do not rename tableName values or add new UI text/layout.
- Do not refactor unrelated example code.

## OUTPUT:
Return changed files, build result and manual verification result for each example.

## ACCEPTANCE CRITERIA:
- `npm run build` succeeds.
- All three examples still contain IbViewModule and ib-table-view-group.
- routingExample navigation preserves query params.
- No example configures ibViews NgRx hydration or a custom persistence service.
- The three stable tableName values are unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Step 9 — Aggiornare la documentazione Storybook di Kai Table Views

**Target executor:** `storybook-executor`  
**Model:** `github-copilot/gpt-5.6-sol`  
**Allowed files:**

- `src/app/inobeta-ui/ui/kai-table/table.mdx`
- `src/app/inobeta-ui/ui/kai-table/table.stories.ts` (solo se necessario alla story documentata)

**Read-only reference files:** public API finale; esempi dello Step 8.

**Objective:** documentare il comportamento effettivo senza presentare più hydration NgRx o filtro
obbligatorio come prerequisiti.

**Key requirements:** descrivere Default, campi salvati/esclusi, localStorage per `tableName`, URL,
CRUD/reorder, modulo opzionale e assenza di migrazione; mantenere snippet compilabili.

**Constraints:** nessuna modifica component implementation o examples; nessuna promessa di cross-tab,
pageIndex o migration.

**Validation:** `npm run build-storybook`.

**Stop condition:** se Storybook fallisce per errori preesistenti non collegati alle Views, riportarli
senza ampliare lo scope.

**Executor Input:**

~~~
## TASK:
Update Kai Table Storybook documentation for the restored optional Views feature.

## CONTEXT:
IbViewModule now owns dedicated per-table localStorage persistence. Default is implicit and locked. Saved views contain raw filters, sort, pageSize and aggregations, while canonical selectedView remains in the table URL. The current MDX still contains outdated constraints such as a required filter.

## OBJECTIVE:
Document the final DEVK-1065 behavior and provide valid optional-module usage guidance.

## REQUIREMENTS:
1. Modify only allowed Storybook files.
2. Document IbViewModule as optional and ib-table-view-group as its table integration.
3. Document Default behavior and that it cannot be persisted, renamed, deleted or reordered.
4. Document create-from-current, save, rename, duplicate, delete, drag reorder and dirty-switch actions.
5. Document exactly which fields are saved and excluded.
6. Document per-tableName dedicated localStorage and URL-selected-view reload behavior.
7. State that old ibViews hydration data is not migrated and cross-tab live updates are not provided.
8. Remove the claim that ib-filter is mandatory; filters are optional state within a view.
9. Keep all snippets consistent with current public API and required tableName.

## CONSTRAINTS:
- Do not modify component implementation, examples, routes or translations.
- Do not document unsupported pageIndex, row selection, route state, migration, or live cross-tab sync.
- Do not add hardcoded application-specific text to stories.

## OUTPUT:
Return changed documentation/story files and Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` succeeds, or a pre-existing unrelated blocker is reported with its exact error.
- The MDX no longer says ib-filter is required for Views.
- The MDX describes Default, dedicated persistence, URL reload and saved/excluded fields accurately.
- Every code sample includes stable tableName and separate IbViewModule import.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Dependencies between steps

- Step 1 è indipendente e deve precedere Step 3 e Step 7.
- Step 2 è indipendente da Step 1 e deve precedere Step 3 e Step 5.
- Step 3 dipende da Step 1 e Step 2.
- Step 4 dipende da Step 3; completa la rimozione dello store prima delle suite finali.
- Step 5 dipende da Step 2 e Step 4.
- Step 6 dipende da Step 1-4.
- Step 7 dipende da Step 1; può essere eseguito in parallelo agli Step 5-6 dopo il completamento del
  production code.
- Step 8 dipende da Step 1-4 e deve essere eseguito dopo che le suite focalizzate sono verdi.
- Step 9 dipende dalla public API finale dello Step 4 e dagli esempi verificati nello Step 8.

## 6. Impacted Areas

### Library source

| Area | Impatto |
|---|---|
| `ui/kai-table/table-views-host.ts` | Hook additivi compatibili per Default e selectedView canonica |
| `ui/kai-table/table-state.facade.ts` | Baseline Default derivata dalla precedenza esistente |
| `ui/kai-table/table.component.ts` | Ordine init host, sync canonica e toolbar senza filtro obbligatorio |
| `ui/views/view*.ts` | Modello, token, storage dedicato, CRUD e dialog tipizzati |
| `ui/views/components/**` | Stato UI, dirty workflow, lock Default e drag-and-drop |
| `ui/views/store/**` | Rimozione dello slice NgRx obsoleto |
| `ui/views/view.module.ts` | Rimozione `provideState`, aggiunta CDK DragDrop |
| `src/app/app.config.ts` | Rimozione `ibViews` dalla whitelist hydration demo |

### Examples and docs

| File | Impatto |
|---|---|
| `kai-table-full-example.ts` | Scenario locale completo, normalmente nessuna modifica |
| `server-side/kai-table-api-example.ts` | Scenario remoto, normalmente nessuna modifica |
| `kai-table-with-routing.ts` | Preservazione query param in child navigation |
| `ui/kai-table/table.mdx` | Contratto Views aggiornato |

### Public API symbols

| Symbol | Azione |
|---|---|
| `IbTableViewsHost` | Estensione additiva; nessun membro esistente rimosso |
| `IbTableViewsData` | Conservato per compatibilità; mapping canonico interno |
| `IbViewModule` | Conservato; non registra più lo store NgRx |
| `IbTableViewGroup` | Conservato come componente di integrazione |
| `IbViewService` | Conservato con implementazione/API tipizzata sul nuovo storage |
| `IbSavedTableView` / tipi equivalenti `Ib*` | Nuovi export Views |
| `IB_VIEWS_STORAGE_KEY` | Nuovo token configurabile |
| `TableViewActions`, `ibViewsFeature`, selector/reducer Views | Rimossi dal barrel Views |
| `IView`, `ITableViewData`, vecchio `IbView` | Rimossi o resi interni/obsoleti secondo il modello finale |
| Export Kai Table non collegati alle Views | Invariati |

## 7. Risks

1. **Ordine di inizializzazione (alto):** la facade risolve una view prima che il widget abbia il gruppo
   corretto. Lo Step 1 deve rendere esplicito e testato `setViewGroupName` prima di `initialize`.
2. **Feedback loop URL (alto):** hydration/back-forward non deve essere trattata come click utente.
   Aggiornamento visuale e intent di selezione devono usare percorsi separati.
3. **Baseline Default (medio-alto):** riusare accidentalmente lo snapshot URL o `initialView` renderebbe
   Default non deterministica. La baseline deve ignorarli esplicitamente.
4. **Primo fetch remoto (medio):** la risoluzione storage è sincrona ma resta nel barrier asincrono
   della facade; non deve introdurre un secondo fetch quando viene evidenziata la tab attiva.
5. **Storage corrotto/quota (medio):** parse o write possono fallire. Il feature deve degradare a lista
   vuota o mantenere il dato precedente e mostrare errore, senza rompere la tabella.
6. **Collisione di namespace (medio):** due tabelle con lo stesso `tableName` condividono volutamente
   storage e URL. Non viene aggiunto namespace user/tenant; chi ne ha bisogno può configurare il
   prefisso token.
7. **Breaking API Views (accettato):** la rimozione dello store e dei relativi export rompe eventuali
   import non censiti. La breaking change è limitata al modulo Views ed è stata autorizzata.
8. **Drag-and-drop responsive (medio):** wrap e drag preview possono alterare lievemente il layout.
   Lo scope CSS deve restare locale e verificato a larghezze desktop ridotte.
9. **Dirty comparison (medio):** raw filter values possono contenere oggetti/date serializzati. La
   normalizzazione deve essere deterministica e non mutare snapshot/service state.
10. **Navigazione routing (medio):** senza `queryParamsHandling: preserve`, l'esempio child può perdere
    lo stato URL e tornare a Default.
11. **Nessuna migrazione (accettato):** le vecchie view restano nel vecchio localStorage ma non vengono
    mostrate. È comportamento concordato, non un bug.
12. **Documentazione Storybook (basso):** la build può incontrare blocker preesistenti estranei; non
    devono generare refactor fuori scope.

## 8. Validation Checklist

### Automated

- [ ] `npm run lint` passa; se il repository continua a non avere un lint target, il limite viene
  riportato esplicitamente senza sostituirlo con un comando diverso.
- [ ] `npm run test-ci` passa con coverage globale almeno 80%.
- [ ] `npm run build` passa.
- [ ] `npm run packagr` passa.
- [ ] `npm run build-storybook` passa oppure documenta un blocker preesistente non Views.
- [ ] Nessun `fdescribe` o `fit`.
- [ ] Nessuna produzione `ui/views` importa `@ngrx/store` o espone `ibViewsFeature`.
- [ ] Nessun file `ui/kai-table` importa `ui/views`.
- [ ] Nessuna nuova stringa visibile è hardcoded.

### Manual — Full/local (`fullExample`)

- [ ] Al primo caricamento compare Default, prima e selezionata.
- [ ] Default ripristina filtri/sort/page size/aggregazioni iniziali e pagina zero.
- [ ] Modificando Default, Save apre la creazione e salva lo stato corrente.
- [ ] `+` da Default e da una view dirty crea dallo stato corrente e seleziona la nuova view.
- [ ] Save su view nominata aggiorna lo snapshot senza cambiare ordine o pagina per effetto del save.
- [ ] Rename trim-ma il nome e rifiuta un duplicato case-insensitive.
- [ ] Drag-and-drop cambia ordine; reload conserva l'ordine.
- [ ] Delete attivo torna a Default; Default non presenta delete/rename/drag.
- [ ] Cambio dirty offre Salva, Non salvare e Annulla con i tre comportamenti distinti.
- [ ] Selezionare una view aggiorna il query param `fullExample`; reload conserva tab e stato.
- [ ] Browser back/forward aggiorna tab evidenziata e tabella senza loop o doppia applicazione.
- [ ] Rimuovere il query param apre Default, non l'ultima view salvata/usata.

### Manual — Remote/API (`remoteExample`)

- [ ] Una view con filtro, sort e page size produce una singola request coerente al restore.
- [ ] Cambiare view riparte da pagina zero.
- [ ] Reload con URL view selezionata mantiene tab e request.
- [ ] Error/refresh del datasource non elimina view attiva o snapshot salvato.
- [ ] Le view non introducono capability locali/aggregazioni globali non supportate dal remoto.

### Manual — With routing (`routingExample`)

- [ ] Creazione e restore view funzionano come nel full example.
- [ ] Navigare a `details/:id` conserva il query param `routingExample`.
- [ ] La child route e l'evidenziazione active row continuano a funzionare ma non sono salvate nella
  view.
- [ ] Reload diretto sulla child route mantiene sia la view URL sia la route.
- [ ] Browser back/forward fra base e dettaglio non desincronizza la tab attiva.

### Persistence and isolation

- [ ] `fullExample`, `remoteExample` e `routingExample` usano chiavi storage distinte.
- [ ] Una view creata in un esempio non compare né viene risolta negli altri.
- [ ] Un payload dedicato malformato non impedisce il rendering della tabella.
- [ ] Il vecchio `__redux-store-inobeta-ui__.ibViews` viene ignorato e non migrato.
- [ ] Modifiche da un'altra scheda richiedono reload, come concordato.

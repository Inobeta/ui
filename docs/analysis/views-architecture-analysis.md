# Views Feature — Architecture Analysis

> **Purpose:** Pre-commit analysis of the views removal diff and evaluation of the target
> architecture. No implementation plan is produced here.
>
> **Date:** 2026-06-05  
> **Last updated:** 2026-06-05 (rev 2 — feedback incorporated)  
> **Status:** Analysis only — no implementation steps

---

## 1. Cosa viene rimosso nel diff corrente

Il diff corrente cancella l'intera infrastruttura di stato e servizi del feature "viste" e
scollega il meccanismo dalla tabella. La UI (componenti) sopravvive nel working tree ma in
stato **non compilabile** perché le sue dipendenze sono state eliminate. Questa è una stato
intermedio intenzionale prima della riscrittura.

### File eliminati

| File | Contenuto |
|---|---|
| `ui/views/view.service.ts` | `IbViewService` — orchestratore di dialogs, NgRx dispatch, toast |
| `ui/views/view.module.ts` | `IbViewModule` NgModule + `provideState(ibViewsFeature)` |
| `ui/views/store/actions.ts` | `TableViewActions` (Add/Save/Rename/Delete View) |
| `ui/views/store/reducer.ts` | Feature `ibViews`, selectors `selectViews`, `selectTableViews` |
| `ui/views/store/views/reducer.ts` | Reducer CRUD sull'array `IView[]` |
| `ui/views/store/views/table-view.ts` | Tipi `IView`, `ITableViewData`, classe `IbView` |
| `ui/views/translations.ts` | Chiavi i18n (`shared.ibTableView.*`) |
| `ui/views/index.ts` + barrel interni | Esportazioni pubbliche del feature |

### Rimozioni in `public_api.ts`

```diff
- export * from './src/app/inobeta-ui/ui/views/index';
```

Questa è una **breaking change** verso i consumatori della libreria che usavano
`IbViewModule`, `IbViewService`, `IView`, ecc.

### Rimozioni dal kai-table

| Simbolo rimosso | File | Ruolo |
|---|---|---|
| `IbTable.view` (`@ContentChild`) | `table.component.ts` | Entry point per connettere view al componente |
| `IbTable.viewInit()` | `table.component.ts` | Inizializzazione del binding view-datasource |
| `IbTable.setupViewGroup()` | `table.component.ts` | Iniezione delle action templates nel portal |
| `IbTableDataSource._view` + getter/setter | `table-data-source.ts` | Bridge data layer ↔ view component |
| `IbTableDataSource._viewChangesSubscription` | `table-data-source.ts` | Sottoscrizione ai cambi di vista attiva |
| `IbTableDataSource._updateViewChangeSubscription()` | `table-data-source.ts` | Setup del canale bidirezionale datasource↔view |
| `IbTableDataSource.handleViewChange` (arrow fn) | `table-data-source.ts` | Applicazione dello stato della vista alla tabella |
| `urlStateActions.handleViewChange` | `store/url-state/actions.ts` + effects + reducer | Aggiornamento atomico di tutti i param URL al cambio vista |
| `IbTableUrlService.getActiveView()` | `table-url.service.ts` | Lettura `ibview` dal query string |
| `IbTableUrlService.handleViewChange()` | `table-url.service.ts` | Navigazione atomica su cambio vista |
| `IbTableUrlService.getViewState()` | `table-url.service.ts` | Snapshot di tutti i param URL |
| `ibview` in `IbTableQsParams` | `table-url.service.ts` | Chiave `ibview` nello schema URL |
| `IbKaiTableParams.view` | `store/url-state/interfaces.ts` | Campo view nel tipo dei parametri |

### Componenti UI sopravvissuti (broken al momento) — analisi di genericità

I 5 componenti che sopravvivono nel working tree non sono tutti ugualmente accoppiati alla
tabella. La valutazione guida sul tenerli, renderli generici o eliminarli:

| Componente | Tipo | Dipendenze pendenti | Coupling alla tabella | Decisione |
|---|---|---|---|---|
| `IbTableViewGroup` | Smart | `IbViewService` ✗, `selectTableViews` ✗, `IbTableUrlService.getActiveView()` ✗, `IView`/`ITableViewData` ✗ | **Parziale** — logica di vista generica; unico accoppiamento residuo è `*ibTableAction` nel template | **Tenere, riscrivere** |
| `IbViewList` | Dumb | `IView` ✗ (solo il tipo) | Nessuno | **Tenere, aggiornare il tipo** |
| `IbTableView` | Dumb | `IView` ✗ (solo il tipo) | Nessuno (nome ingannevole) | **Tenere, aggiornare il tipo** |
| `IbDefaultTableView` | Dumb | Nessuna | Nessuno | **Tenere invariato** |
| `IbTableViewDialog` | Dialog | Nessuna | Nessuno | **Tenere invariato** |

**`IbTableViewGroup` — analisi dettagliata**

Il selector `"ib-view-group, ib-table-view-group"` rivela che il componente aveva già una
doppia identità: `ib-view-group` è il nome generico, `ib-table-view-group` è l'alias per
la tabella. La logica interna (CRUD viste, dirty state, orchestrazione dialog) è
concettualmente generica. Il **solo elemento strettamente table-specific** è il template:

```html
<!-- *ibTableAction è la direttiva del portal della toolbar della tabella -->
<button *ibTableAction mat-icon-button (click)="handleDiscardChanges()">...</button>
<button *ibTableAction mat-icon-button (click)="handleSaveView()">...</button>
```

Questi pulsanti vengono iniettati nella toolbar di `IbTable` tramite `TemplatePortal`.
Nella nuova architettura, dove il view group non è più un figlio dichiarato della tabella,
questo meccanismo decade. I pulsanti Salva/Annulla diventeranno parte del template del
componente stesso, senza bisogno di `IbTableActionModule`. Il componente **può essere
reso completamente generico** con modifiche circoscritte al template.

**`IbViewList`, `IbTableView`, `IbDefaultTableView`** — questi tre componenti sono già
del tutto generici. L'unico cambiamento necessario è sostituire l'import del tipo `IView`
con il nuovo `IbViewSnapshot` (vedi §4.1). Nessuna logica da toccare.

**`IbTableViewDialog`** — completamente generico, zero coupling. Resta invariato.

---

## 2. Requisiti funzionali che le viste soddisfacevano

### RF-1: Preset filtro nominati
L'utente poteva creare "viste" con nome, ciascuna snapshot dello stato completo della
tabella: filtri attivi, dimensione pagina, colonne aggregate, ordinamento attivo.

### RF-2: CRUD sulle viste
- **Crea**: da dialog con nome libero
- **Salva**: aggiornamento dello snapshot della vista attiva
- **Rinomina**: cambio nome via dialog
- **Duplica**: nuova vista con lo stato corrente
- **Elimina**: con dialog di conferma

### RF-3: Rilevamento stato "dirty"
Confronto tra lo stato corrente della tabella e i dati salvati nella vista attiva.
Se diversi, la vista era marcata "dirty" e i pulsanti Salva/Annulla si attivavano.

### RF-4: Guard sulle modifiche non salvate
Al cambio vista con stato dirty, dialog contestuale:
- Vista "Tutti" (default): proposta di salvataggio come nuova vista o scarto
- Vista nominata: proposta di salvataggio nella vista corrente o scarto

### RF-5: Sincronizzazione URL
L'ID della vista attiva era persistito nel query param `ibview`. Al cambio vista, tutti
i parametri URL venivano aggiornati atomicamente (`ibview`, `ibfilter`, `ibpage`,
`ibpagesize`, `ibaggregatedcolumns`, `ibsort`). Ciò garantiva che il refresh della pagina
ripristinasse la vista attiva.

### RF-6: Vista di default "Tutti"
Vista speciale con ID fisso `__ibTableView__all`, non eliminabile, non rinominabile,
sempre in prima posizione.

---

## 3. Mappatura della logica distribuita (stato pre-diff)

La logica del feature era distribuita su **sei layer distinti**, creando un accoppiamento
a ragnatela difficile da manutenere.

```
┌─────────────────────────────────────────────────────────────────┐
│  IbTable (component)                                            │
│  - @ContentChild(IbTableViewGroup)                              │
│  - viewInit() → dataSource.view = this.view                     │
│  - setupViewGroup() → porta le action template nel portal       │
└────────────────────┬────────────────────────────────────────────┘
                     │ imposta
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  IbTableDataSource (data layer)                                 │
│  - set view(v): registra viewDataAccessor sul componente UI     │   ← DATA LAYER DIPENDE DA UI COMPONENT
│  - _updateViewChangeSubscription(): si sottoscrive a _activeView│
│  - handleViewChange(): applica dati vista (filter, sort, page)  │
│  - dispatch urlStateActions.handleViewChange                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ emette cambiamenti di stato
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  IbTableViewGroup (smart UI)                                    │
│  - handleStateChanges(changes$): riceve stream dal datasource   │   ← UI COMPONENT RICEVE STREAM DAL DATA LAYER
│  - checkViewDataChanges(): dirty check con JSON.stringify       │   ← NOTA: FIXME nel codice
│  - viewDataAccessor: callback registrata dal datasource         │
│  - _activeView BehaviorSubject                                  │
│  - Legge ibview da URL (IbTableUrlService.getActiveView)        │
│  - Seleziona viste da NgRx (selectTableViews)                   │
│  - Orchestra dialog via IbViewService                           │
└────────────────────┬────────────────────────────────────────────┘
                     │ dispatch + dialog
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  IbViewService                                                  │
│  - Dispatch NgRx (TableViewActions.*)                           │   ← MIX: store + dialog + toast
│  - Apertura dialogs (MatDialog)                                 │
│  - Notifiche utente (IbToastNotification)                       │
└────────┬─────────────────────┬───────────────────────────────────┘
         │                     │
         ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│ ibViews NgRx store + HydrationEffects                            │
│ - Stato in-memory serializzato in localStorage via meta-reducer  │   ← PERSISTENZA INDIRETTA (vedi P4)
│ - Chiave localStorage: "__redux-store-inobeta-ui__"              │
│ - Chiave nested nello stato: "ibViews"                           │
│   (richiede ibSetupHydration nel consuming app)                  │
└──────────────────────────────────────────────────────────────────┘
      +
┌────────────────────────────────────────────────────────────────┐
│ IbTableUrlService                                              │
│ - getActiveView() → legge ibview dall'URL                      │
│ - handleViewChange() → navigazione atomica                     │
│ - getViewState() → snapshot URL params                         │
└────────────────────────────────────────────────────────────────┘
```

### Problemi architetturali rilevati

**P1 — Il data layer dipendeva da un componente UI**
`IbTableDataSource.set view(v)` riceveva un'istanza di `IbTableViewGroup` e chiamava
direttamente i suoi metodi (`view.defaultView`, `view.viewDataAccessor = ...`,
`view.handleStateChanges(...)`). Un data source non deve mai dipendere da un componente UI.

**P2 — IbTableViewGroup conosceva i dettagli interni della tabella**
Il tipo `ITableViewData` conteneva `filter: IbFilterSyntaxExtended`, `pageSize`,
`aggregatedColumns`, `sort: Sort`. Queste sono strutture dati specifiche del kai-table,
non un'interfaccia generica. Questo rendeva il sistema non riutilizzabile per chart o altre
UI.

**P3 — IbViewService mescolava tre responsabilità non correlate**
Un singolo servizio gestiva: apertura di dialog Material, dispatch NgRx e notifiche toast.
Impossibile testare le tre responsabilità in isolamento e impossibile sostituirne una senza
toccare le altre.

**P4 — La persistenza delle viste era implicita e dipendente dalla configurazione del
consuming app** *(revisione rispetto alla versione precedente di questo documento)*

Le viste **erano** persistite in localStorage, ma tramite un meccanismo indiretto:
il meta-reducer di idratazione NgRx (`HydrationEffects`), configurato nell'app demo in
`app.config.ts`:

```typescript
// app.config.ts — demo app
const reduxStorageSave = ibSetupHydration("__redux-store-inobeta-ui__", [
  "ibHttpSessionState",
  "exampleLazyFeature",
  "ibTable",
  "ibViews",  // ← le viste erano incluse nel blob serializzato
]);
```

La chiave `"ibViews"` era uno slice del root NgRx state, serializzato intero sotto la
chiave `"__redux-store-inobeta-ui__"` in localStorage. Questo significa:

- La persistenza **funzionava** nella demo app: il refresh della pagina ripristinava le
  viste salvate.
- La persistenza **era opaca**: `IbViewModule` non documentava che richiedeva l'aggiunta
  di `"ibViews"` alla lista `ibReduxPersistKeys` del consuming app. Un consumer che
  dimenticava questo passaggio perdeva tutte le viste al refresh.
- La persistenza **era accoppiata al formato NgRx**: lo schema localStorage era determinato
  dalla struttura del reducer, non da un contratto esplicito della libreria.
- Il prefisso `"__redux-store-inobeta-ui__"` era scelto dall'app demo, non dalla libreria;
  non esisteva un prefisso di default per le viste a livello di libreria.

**P5 — Accoppiamento di layout tramite TemplatePortal**
`IbTableViewGroup` esponeva `@ViewChildren(IbKaiTableAction)` che `IbTable.setupViewGroup()`
iniettava nel portal della toolbar. La view component controllava quindi quali pulsanti
apparivano nella toolbar della tabella — accoppiamento di presentazione inverso e fragile.

**P6 — Dirty check fragile**
`checkViewDataChanges()` usava `JSON.stringify` per comparare due oggetti. Era presente
un commento `// FIXME: this check is really bad`. Il confronto JSON non è deterministico
per oggetti con chiavi in ordine diverso (es. `{a:1, b:2}` ≠ `{b:2, a:1}` come stringhe).

---

## 4. Valutazione dell'architettura target

### Caratteristiche richieste (da brief)

1. Viste = solo componenti UI + al massimo un service di utilità
2. Service = solo persistenza in localStorage, indipendente dal consumatore
3. Interfaccia standard che definisce cosa viene salvato: oggetto generico di parametri
4. Ogni consumatore (tabella, grafico) parsa autonomamente quella struttura nei propri filtri
5. Meccanismo generico, riutilizzabile in futuro

### Valutazione di fattibilità: **Alta**

L'architettura richiesta è pienamente realizzabile con le tecnologie già nel progetto. Non
richiede nuove dipendenze e semplifica significativamente il codice.

---

### 4.1 — Interfaccia standard (generic snapshot)

Il cambio fondamentale rispetto a `ITableViewData` è rendere `data` **opaco** al sistema
delle viste. Si aggiunge inoltre un campo `componentType` per identificare il tipo di
consumatore che ha originato la vista.

```typescript
// Prima: data era fortemente tipizzata con strutture del kai-table
interface ITableViewData {
  filter: IbFilterSyntaxExtended;  // struttura specifica del kai-filter
  pageSize: number;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
}

// Target: data è unknown → la vista non sa cosa contiene
interface IbViewSnapshot {
  id: string;           // identificatore stabile (vedi nota sul campo id)
  name: string;
  groupName: string;    // namespace del consumatore (es. il tableName)
  componentType: string; // tipo del consumatore: "table" | "line-chart" | ...
  data: unknown;        // opaco; il consumatore lo serializza/deserializza
}
```

**Ruolo del campo `id`**

Il campo `id` è necessario e non eliminabile per due ragioni indipendenti:

1. **Stabilità nelle operazioni CRUD**: `updateView` e `deleteView` devono identificare
   univocamente una vista nell'array. Usare `name` come chiave primaria non è praticabile
   perché il nome è mutabile (operazione rename). L'`id` è assegnato alla creazione e non
   cambia mai.
2. **Matching con lo stato URL**: l'ID della vista attiva viene persistito nel query param
   `ibview` affinché sopravviva al refresh della pagina (vedi §4.7). Al ripristino, il
   consumer legge l'ID dall'URL e cerca la vista corrispondente nell'array restituito dal
   service. Senza un `id` stabile questo matching sarebbe impossibile.

**Ruolo del campo `componentType`**

Consente al sistema di viste di:
- Validare che una vista caricata da localStorage appartenga al tipo di componente
  corretto (guard contro corruzione dei dati o collisioni di `groupName`)
- Filtrare viste per tipo in scenari futuri (es. mostrare solo viste di tabella in un
  pannello di gestione)
- Fornire informazioni di debugging senza dover aprire i dati opachi

Il campo è stringa libera; valori convenzionali attesi: `"table"`, `"line-chart"`, ecc.

**Implicazioni:**
- Il sistema delle viste non dipende più da `IbFilterSyntaxExtended`, `Sort` o qualsiasi
  altro tipo del kai-table
- Un componente grafico può salvare `{ timeRange, metric, granularity }` nello stesso
  sistema senza alcuna modifica al service
- Il consumatore è l'unico responsabile del casting e della validazione di `data`

---

### 4.2 — Service di persistenza in localStorage

**Decisioni recepite:**
- Il service è **sincrono**: nessun Observable, nessuno stato interno reattivo
- I dialog (add/rename/delete) **restano nel service** — è il service l'unico punto
  di orchestrazione delle viste (storage + UI di gestione + toast)
- Nessun limite massimo al numero di viste per gruppo

```typescript
// Responsabilità: leggere/scrivere snapshot in localStorage
//                 + orchestrare dialog di gestione viste
@Injectable({ providedIn: 'root' })
class IbViewService {
  // --- Persistenza ---
  getViews(groupName: string): IbViewSnapshot[]
  addView(groupName: string, snapshot: Partial<IbViewSnapshot>): IbViewSnapshot
  updateView(groupName: string, id: string, patch: Partial<IbViewSnapshot>): IbViewSnapshot
  deleteView(groupName: string, id: string): void

  // --- Orchestrazione dialog (come nel vecchio IbViewService, senza NgRx) ---
  openAddViewDialog(): Observable<{name: string}>
  openDeleteViewDialog(view: IbViewSnapshot): Observable<void>
  openRenameViewDialog(view: IbViewSnapshot): Observable<{name: string}>
  openDuplicateViewDialog(view: IbViewSnapshot): Observable<{name: string}>
  openSaveChangesDialog(view: IbViewSnapshot): Observable<{confirmed: boolean}>
  openSaveAsDialog(): Observable<{confirmed: boolean; name?: string}>
}
```

**Non fa:**
- Nessun dispatch NgRx
- Nessuna conoscenza di filter/sort/pagination
- Nessun collegamento con `IbTableUrlService`

**Chiave localStorage e prefisso applicativo**

Nella vecchia architettura non esisteva un prefisso dedicato per le viste a livello di
libreria: tutte le viste erano serializzate come slice del root NgRx state sotto la chiave
dell'applicazione (`"__redux-store-inobeta-ui__"` nella demo app), seguendo la struttura
del reducer: `{ ibViews: { views: [...] } }`.

Per la nuova architettura, il service avrà una chiave localStorage propria. Seguendo la
convenzione di naming del progetto (`ib-` per CSS, `__...__` per chiavi di stato globali):

- **Prefisso di default della libreria:** `"__ib-views__"`
- **Chiave per gruppo:** `"__ib-views__"` come chiave radice sotto cui viene serializzato
  l'intero `Record<groupName, IbViewSnapshot[]>`, oppure una chiave per gruppo
  `"__ib-views__{groupName}"` (da decidere in fase di piano)
- **Configurabilità:** il prefisso può essere sovrascritto dal consuming app tramite un
  injection token, replicando il pattern `ibSetupHydration(key, ...)` già presente

**Implicazioni positive:**
- Testabile con un semplice mock di `localStorage` o con `IbStorageService` (già presente
  nella libreria)
- Riutilizzabile da qualunque componente (tabella, grafico, form)
- Nessuna dipendenza da NgRx — la persistenza non richiede configurazione nel root store
- La struttura dello storage è ora un contratto esplicito della libreria, non un effetto
  collaterale della configurazione del consuming app

---

### 4.3 — IbTableViewGroup come componente autonomo

**Chiarimento: cos'era il "bridge" nell'architettura precedente**

Il *bridge* era il canale bidirezionale stabilito da `IbTableDataSource.set view(viewInstance)` →
`_updateViewChangeSubscription()`. Consisteva in tre flussi:

```
datasource → view group:  view.viewDataAccessor = () => { filter, sort, ... }
                          view.defaultView.data = { ...stato iniziale... }
                          view.handleStateChanges(merge(filter$, page$, sort$, aggregate$))

view group → datasource:  view._activeView$.subscribe(handleViewChange)
                          // handleViewChange applicava filter/sort/page al datasource
```

Il datasource inizializzava questo canale assegnando callback sul componente UI e
sottoscrivendosi al suo BehaviorSubject. Era il datasource a "costruire il bridge",
ricevendo il componente UI come dipendenza.

**Come il bridge viene sostituito nella nuova architettura**

Il bridge non esiste più come entità separata. Al suo posto:

- **Il consumatore fornisce `[stateAccessor]` come `@Input`**: una callback `() => unknown`
  che il view group chiama quando ha bisogno di snapshotare lo stato corrente (es. prima
  di salvare, per il dirty check). Il consumatore la implementa e la passa nel template.
- **Il view group emette `(ibViewChanged)` come `@Output`**: quando l'utente seleziona una
  vista, il view group emette lo snapshot completo. Il consumatore riceve l'evento e applica
  `snapshot.data` al proprio stato interno.

Non c'è più nessun canale di abbonamento dal datasource al componente UI. Il flusso è
puramente event-driven e a senso unico:

```
consumatore → view group:  [stateAccessor]="fn"    (snapshot on demand)
view group → consumatore:  (ibViewChanged)="fn"    (apply view data)
```

Il componente diventa:
- **Input**: `stateAccessor: () => unknown`
- **Input**: `groupName: string`
- **Input**: `componentType: string`
- **Input** (opzionale): `initialViewId: string | null` — ID della vista da attivare
  all'init (letto dall'URL dal consumatore, vedi §4.7)
- **Output**: `ibViewChanged: EventEmitter<IbViewSnapshot>`

Il consumatore (tabella):
```html
<ib-view-group
  [groupName]="tableName"
  componentType="table"
  [stateAccessor]="getCurrentTableState"
  [initialViewId]="viewIdFromUrl"
  (ibViewChanged)="applyViewToTable($event)"
/>
```

**Confronto con l'architettura precedente:**

| Aspetto | Prima | Target |
|---|---|---|
| Chi costruisce il canale dati | `IbTableDataSource.set view()` | Il consumatore via `@Input` |
| Chi registra `viewDataAccessor` | Il datasource (programmatico) | Il consumatore (dichiarativo, `@Input`) |
| Chi applica la vista al consumatore | `handleViewChange` nel datasource | Handler di `(ibViewChanged)` nel consumatore |
| Chi legge l'ID attivo dall'URL | `IbTableViewGroup` (import diretto) | Il consumatore, passato come `[initialViewId]` |
| Persistenza viste | NgRx + hydration (implicita) | localStorage via `IbViewService` (esplicita) |
| Dipendenza da tipi del kai-table | Sì (`IbFilterSyntaxExtended`, `Sort`) | No (`unknown`) |
| Coupling al portal della toolbar | Sì (`*ibTableAction`, `IbTableActionModule`) | No (pulsanti nel template del view group) |

---

### 4.4 — Responsabilità del consumatore (IbTable)

`IbTable` diventa l'adattatore tra il sistema generico delle viste e il suo stato interno:

```typescript
// Fornisce lo snapshot corrente al view group
getCurrentTableState = (): IbTableState => ({
  filter: this.filter.selectedCriteria,
  pageSize: this.dataSource.paginator.pageSize,
  aggregatedColumns: this.dataSource.aggregatedColumns,
  sort: { ...this.dataSource.sortState },
});

// Applica uno snapshot al proprio stato interno
applyViewToTable(view: IbViewSnapshot) {
  const data = view.data as IbTableState; // cast consapevole
  this.dataSource.filter.value = data.filter;
  this.dataSource.paginator.pageSize = data.pageSize;
  this.dataSource.aggregatedColumns = { ...data.aggregatedColumns };
  this.dataSource.sortState = data.sort;
  // scrive ibview nell'URL tramite il proprio url state management
  this.tableUrl.setActiveView(this.tableName, view.id);
}
```

Il kai-table è l'unico responsabile del parsing di `unknown → IbTableState`.
Il view group non ne sa nulla.

---

### 4.5 — Componenti dumb e dialog

`IbViewList`, `IbTableView`, `IbDefaultTableView` sono già correttamente separati: non
hanno logica applicativa e dipendono solo dal tipo `IView` da aggiornare in `IbViewSnapshot`.
Una volta aggiornata la dipendenza dal tipo, restano invariati.

`IbTableViewDialog` è completamente generico e resta invariato.

**Tutti i componenti devono diventare `standalone: true`** (decisione recepita), eliminando
la dipendenza da `IbViewModule`.

---

### 4.6 — Dirty state

Il dirty check attuale (`JSON.stringify` con commento `FIXME`) verrà sostituito con un
confronto **indipendente dall'ordine delle chiavi**. La responsabilità della comparazione
resta nel view group, che chiama `stateAccessor()` e confronta il risultato con
`activeView.data`.

La strategia di confronto da adottare: serializzazione con chiavi ordinate
(`JSON.stringify` con replacer di ordinamento) oppure una funzione di deep-equal ricorsiva.
Entrambe garantiscono determinismo indipendente dall'ordine di inserimento delle chiavi
nell'oggetto stato.

---

### 4.7 — URL state e persistenza della vista attiva

**Decisione confermata: la vista attiva deve sopravvivere al refresh della pagina.**

L'ID della vista attiva viene scritto nell'URL dal consumatore (non dal view group).
Il pattern è:

1. **Al cambio vista** (`ibViewChanged`): il consumatore scrive `?{tableName}=...ibview=<id>...`
   nel query string, analogamente a come già gestisce filtri e paginazione.
2. **All'init** (`ngAfterContentInit` o equivalente): il consumatore legge `ibview` dai
   parametri URL e lo passa come `[initialViewId]` al view group.
3. **Il view group** usa `initialViewId` per caricare la vista corrispondente da localStorage
   e impostarla come vista attiva all'avvio, emettendo `ibViewChanged` con `initial: true`
   (o analogo flag) per evitare loop di inizializzazione.

Questo schema mantiene la separazione: il view group non conosce il router, il consumatore
non conosce localStorage.

---

## 5. Stato intermedio post-commit

Dopo il commit del diff corrente, i componenti sopravvissuti saranno non compilabili:

- `IbTableViewGroup` importa `IbViewService` (eliminato), `selectTableViews` (eliminato),
  `IbTableUrlService.getActiveView` (eliminato), `IView`/`ITableViewData` (eliminati)
- `IbViewList` e `IbTableView` importano `IView` (eliminato)

**Questo deve essere considerato nella gestione della branch:** il commit del diff corrente
non deve essere fatto su `main` senza contestualmente completare almeno la riscrittura
minima dei componenti sopravvissuti.

---

## 6. Decisioni architetturali recepite

Le domande aperte della versione precedente di questo documento sono state risolte:

| # | Domanda | Decisione |
|---|---|---|
| Q1 | La vista attiva deve sopravvivere al refresh via URL? | **Sì** — l'ID è nel query string, gestito dal consumatore (vedi §4.7) |
| Q2 | Il localStorage key deve includere un prefisso applicativo? | **Sì** — prefisso di default `"__ib-views__"`, derivato dalla convenzione `"__redux-store-inobeta-ui__"` già in uso; configurabile tramite injection token |
| Q3 | Il service deve esporre Observable o array semplice? | **Array semplice sincrono** — nessuno stato interno, nessun Observable |
| Q4 | I dialogs restano nel service o si spostano nel componente? | **Nel service** — `IbViewService` è l'unico punto di orchestrazione (storage + dialogs + toast) |
| Q5 | Il dirty check deve essere deterministico rispetto all'ordine dei campi? | **Sì** — comparazione con serializzazione a chiavi ordinate o deep-equal ricorsivo |
| Q6 | I componenti diventano standalone? | **Sì** — tutti i componenti del feature diventano `standalone: true` |
| Q7 | Esiste un limite massimo al numero di viste per gruppo? | **No** — nessun limite imposto dalla libreria |

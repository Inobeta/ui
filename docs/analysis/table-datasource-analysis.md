# DEVK-912 — Analisi: eliminazione di `IbTableDataSource`

> **Tipo documento:** analisi architetturale — nessun piano di lavoro.
> **Aggiornamento:** decisioni architetturali recepite; domande aperte chiuse.

---

## Decisioni architetturali (chiuse)

| # | Decisione |
|---|---|
| D1 | `IbTableRemoteDataSource` → **Opzione B**: Angular Service con strategia iniettabile |
| D2 | Un unico slice NgRx **`ibKaiTable`** (il dead code `kaiTableReducers` viene rimosso) |
| D3 | `MatTable` rimane; il contratto CDK `DataSource<T>` viene **eliminato** (MatTable accetta `T[]`) |
| D4 | Il paginator Angular Material viene sincronizzato tramite `effect()` in `IbTable` |
| D5 | Migrazione **big-bang** (nessun adapter layer temporaneo) |

---

## 1. Stato attuale di `IbTableDataSource`

### 1.1 Responsabilità

`IbTableDataSource<T>` estende il CDK `DataSource<T>` e aggrega **cinque** responsabilità
distinte in un unico oggetto:

| # | Responsabilità | Dove nel codice |
|---|---|---|
| R1 | **Contratto CDK** (`connect` / `disconnect`) | `connect()` restituisce `_renderData`; `disconnect()` unsubscribe |
| R2 | **Pipeline reattiva** filter → sort → paginate → render | `_updateChangeSubscription()`, `combineLatest` a cascata |
| R3 | **Trasformazioni client-side** (filter, sort, paginate) | `_filterData`, `filterPredicate`, `_orderData`, `sortData`, `_pageData`, `_updatePaginator` |
| R4 | **Registro colonne e aggregazione** | `columns` setter, `_columns`, `_sortedColumns`, `applySortOnColumn`, `_aggregateData`, `_aggregatePaginatedData`, `aggregate` Subject |
| R5 | **Side-effect Redux (URL state)** | `store.dispatch(urlStateActions.setFilters/setSort/setAggregatedColumns)` chiamati **dentro** operatori `map` della pipeline |

La coesistenza di R2 + R5 è il problema principale: le trasformazioni (che dovrebbero
essere pure) contengono side-effect Redux incorporati.

### 1.2 Dipendenze

```
IbTableDataSource
  ├── @angular/cdk/collections     DataSource<T>                (R1 — da eliminare con D3)
  ├── @angular/material/sort       MatSort, Sort                (R2, R3)
  ├── @angular/material/paginator  MatPaginator, PageEvent      (R2, R3)
  ├── rxjs                         BehaviorSubject, Subject, combineLatest, merge
  ├── ui/kai-filter                IbFilter, IbFilterSyntax, applyFilter   (R3)
  ├── ui/kai-table/cells           IbAggregateResult            (R4)
  ├── ui/kai-table/columns         IbColumn, IbSelectionColumn  (R4)
  ├── ui/kai-table/tokens          IB_AGGREGATE  (inject)       (R4)
  ├── @ngrx/store                  Store  (inject)              (R5)
  └── store/url-state/actions      urlStateActions              (R5)
```

Le due chiamate `inject()` — `inject(IB_AGGREGATE)` e `inject(Store)` — sono dichiarate
come **field initializer di classe** (non nel costruttore). Questo impone che ogni
`new IbTableDataSource(...)` venga eseguito dentro un contesto di iniezione Angular
(NG0203 altrimenti). È un vincolo nascosto che non emerge dall'interfaccia pubblica.

### 1.3 Superficie esposta ai componenti consumatori

**Scritta da `IbTable` (table.component.ts):**

| Membro | Dove |
|---|---|
| `data` setter | `@Input() set data(data)` |
| `tableName` | `ngOnInit` |
| `paginator` setter | `ngOnInit` |
| `sort` setter | `dsInit()` in `ngAfterContentInit` |
| `filter` setter | `ngAfterContentInit` |
| `columns` setter | `ngAfterContentInit` |
| `selectionColumn` | `ngAfterContentInit` |
| `aggregatedColumns` | `ngAfterContentInit` (valore letto da URL) |
| `initializeSortState()` | `dsInit()` |
| `applySortOnColumn()` | `ngAfterContentInit` |

**Letta da `IbColumn`:**

| Membro | Uso |
|---|---|
| `_table.dataSource.aggregatedColumns` | `get aggregationFunction()` |
| `_table.dataSource.aggregatedData` | `get aggregatedData()` |
| `_table.dataSource.aggregate.next(...)` | `handleAggregationChange()` |

**Letta da `IbKaiTableMobileComponent`:**

| Membro | Uso |
|---|---|
| `connect()` | subscription su `_renderData` → `this.data.set(data)` |
| `sort.active / sort.direction` | `currentSort` signal aggiornato dopo ogni emissione |

**Letta dal servizio di export:**

| Membro | Uso |
|---|---|
| `filteredData` | dati da esportare (insieme correntemente filtrato) |
| `sortedColumns` | ordine colonne nell'export |

---

## 2. Analisi di `IbTableRemoteDataSource`

### 2.1 Cosa fa diversamente dalla classe base

`IbTableRemoteDataSource<T, V>` estende `IbTableDataSource<T>` e:

1. **Override completo di `_updateChangeSubscription()`** — rimpiazza la pipeline
   client-side con:
   `combineLatest([filter, sort, page])` → `merge(refresh, pipeline)` →
   `debounceTime(500)` → `switchMap(fetchData)` → `map(result → _renderData.next())`.
2. **Aggiunge `_state: BehaviorSubject<IbKaiTableState>`** — stati `loading` / `idle` / `http_error`.
3. **Aggiunge `_refresh: Subject<void>` + `refresh()`** — ritrigger manuale del fetch.
4. **Override di `_filterData()` come no-op** — il server ha già filtrato; il filtering
   client-side viene cortocircuitato.
5. **Usa `filter.ibQueryUpdated`** (stream serializzato per query HTTP) invece di
   `filter.ibFilterUpdated` (stream per filtering client-side) — differenza semantica
   fondamentale.

### 2.2 Cosa eredita dalla base e non può fare a meno

| Membro ereditato | Perché necessario nella pipeline remota |
|---|---|
| `this.sort` | passato a `fetchData(sort, ...)` + confronto con `sortState` |
| `this.sortState` | tracking per dispatch condizionale |
| `this.filter` | `ibQueryUpdated`, `initialized`, `selectedCriteria` |
| `this.paginator` | passato a `fetchData(_, paginator, ...)` + scrittura `paginator.length` |
| `this.store` | `dispatch(setRemoteDatasourceParams / setSort)` |
| `this.tableName` | chiave nello slice Redux |
| `this._renderData` | `_renderData.next(data)` come output |
| `this._aggregatePaginatedData()` | aggregazione sull'ultima pagina ricevuta |
| `this.filteredData` | scritto dal no-op `_filterData` per compatibilità API |

### 2.3 Errori di compilazione bloccanti se si rimuove `extends` allo stato attuale

| Riferimento in `_updateChangeSubscription` | Errore |
|---|---|
| `this.sort` | TS2339: Property 'sort' does not exist |
| `this.sortState` | TS2339: Property 'sortState' does not exist |
| `this.filter` | TS2339: Property 'filter' does not exist |
| `this.paginator` | TS2339: Property 'paginator' does not exist |
| `this.store` | TS2339: Property 'store' does not exist |
| `this.tableName` | TS2339: Property 'tableName' does not exist |
| `this._renderData` | TS2339: Property '_renderData' does not exist |
| `this._aggregatePaginatedData()` | TS2339: Property '_aggregatePaginatedData' does not exist |
| `this.filteredData` | TS2339: Property 'filteredData' does not exist |
| `[dataSource]="dataSource"` in `IbTable` | TS2322: non è assegnabile a `IbTableDataSource<unknown>` |
| `connect()` / `disconnect()` | scompaiono → `MatTable` non può iscriversi ai dati |

Questo indica che la dipendenza non è solo da `extends`, ma da ogni singolo membro
ereditato: rimuovere l'inheritance richiede che tutti questi membri vengano esplicitamente
ridefiniti o eliminati nell'architettura target.

### 2.4 Decisione: Opzione B — Angular Service con strategia (D1)

Il pattern attuale (`abstract class MyDS extends IbTableRemoteDataSource`) viene
sostituito da un **Angular service iniettabile** che riceve la strategia di fetch
come dipendenza.

#### Pattern di utilizzo target (breaking change esplicito)

**Oggi:**
```typescript
// Consumatore dichiara una sottoclasse manuale
export class GithubDataSource extends IbTableRemoteDataSource<GithubIssue, Query> {
  private http = inject(HttpClient);
  fetchData(sort, page, filter): Observable<IbFetchDataResponse<GithubIssue>> { ... }
}

// Nel componente
dataSource = new GithubDataSource();

// Nel template
<ib-kai-table [dataSource]="dataSource" ...>
```

**Target:**
```typescript
// Consumatore dichiara un service Angular (può avere tutte le dipendenze DI normali)
@Injectable()
export class GithubFetchService implements IbRemoteFetchStrategy<GithubIssue, Query> {
  private http = inject(HttpClient);
  fetchData(sort, page, filter): Observable<IbFetchDataResponse<GithubIssue>> { ... }
}

// Nel template — il service è fornito nel componente o nel modulo
<ib-kai-table [remoteSource]="githubFetchService" ...>
```

#### Implicazioni sulla superficie pubblica

- Il campo `@Input() dataSource: IbTableDataSource<unknown>` di `IbTable` viene
  rimosso o separato: l'input per il caso client-side (array) e il caso remote
  (service) diventano distinti.
- `IbTableDataSource` cessa di essere una classe pubblica istanziabile; diventa un
  dettaglio interno o viene rimossa da `public_api.ts`.
- `IbTableRemoteDataSource` cessa di essere una classe pubblica subclassabile; viene
  rimossa da `public_api.ts`.
- `IbFetchDataResponse<T>` rimane pubblico (è il tipo di ritorno di `fetchData()`).
- Una nuova interfaccia pubblica `IbRemoteFetchStrategy<T, V>` viene aggiunta.

#### Pro dell'opzione B

- `GithubFetchService` è un normale Angular service: `inject()` senza vincoli,
  testabile con `TestBed.configureTestingModule` senza `runInInjectionContext`.
- Zero ereditarietà: il service non conosce `MatSort`, `MatPaginator`, `IbFilter`.
  Riceve solo parametri semplici (sort state, page state, filter query) e restituisce
  un Observable.
- Il lifecycle del service è gestito da Angular DI (non da `connect/disconnect`).
- Si adatta naturalmente all'architettura signal-first: il service non ha stato proprio.

#### Contro dell'opzione B

- Breaking change di primo livello per tutti i consumatori che oggi estendono
  `IbTableRemoteDataSource`.
- Il DX cambia: il consumatore deve dichiarare il service nel modulo/componente e
  passarlo all'input `[remoteSource]`.
- La logica di throttling (`debounceTime`) e retry/error deve essere spostata nel
  componente o in un layer interno alla libreria, poiché non è più nel service
  del consumatore.

---

## 3. Il problema del doppio reducer nello store attuale

### 3.1 Situazione rilevata in `store/index.ts`

Il file `store/index.ts` contiene **due definizioni parallele e incompatibili** dello stesso store:

```typescript
// --- Definizione A (dead code) ---
export interface IKaiTableStore {
  urlState: IUrlStateState;  // nesting aggiuntivo
}
export const kaiTableReducers: ActionReducerMap<IKaiTableStore> = {
  urlState: urlStateReducer,  // mai usato da nessun provideState()
};

// --- Definizione B (quella realmente attiva) ---
export const ibKaiTableFeature = createFeature({
  name: 'ibKaiTable',
  reducer: urlStateReducer,  // flat: lo stato è IUrlStateState direttamente
  extraSelectors: ibKaiTableExtraSelectors
});
```

`kaiTableReducers` e `IKaiTableStore` non sono importati da nessun altro file nel
progetto (confermato via ricerca). Il modulo usa esclusivamente `ibKaiTableFeature`:

```typescript
// table.module.ts
providers: [
  provideState(ibKaiTableFeature),  // shape effettiva: ibKaiTable → IUrlStateState
  provideEffects(kaiTableEffects),
]
```

### 3.2 Shape effettiva dello store vs shape percepita

La presenza di `IKaiTableStore = { urlState: IUrlStateState }` potrebbe far credere
che lo stato del feature sia `{ ibKaiTable: { urlState: { tables: [...] } } }`.
In realtà, grazie a `createFeature` con reducer flat, la shape è:

```
NgRx root store
  └── ibKaiTable: IUrlStateState
        └── tables: IbKaiTableNamedParams[]
```

Il selettore `selectTables` (auto-generato da `createFeature`) seleziona correttamente
`state.ibKaiTable.tables`. L'interfaccia `IKaiTableStore` è quindi **fuorviante e
inutilizzata**: va rimossa insieme a `kaiTableReducers`.

### 3.3 Obiettivo: un unico slice `ibKaiTable` (D2)

Il rename "da `url-state` a `kai-table-state`" si riferisce all'espansione del ruolo
dello slice: da _message bus verso l'URL_ a _fonte di verità_ per tutto lo stato della
tabella. La feature key `name: 'ibKaiTable'` rimane invariata (non c'è ragione di
romperla).

Conseguenze pratiche:
- La cartella `store/url-state/` e i suoi file vengono riorganizzati o rinominati per
  riflettere la responsabilità allargata.
- `kaiTableReducers`, `IKaiTableStore` vengono eliminati.
- Lo stato dello slice viene esteso: oltre a `tables: IbKaiTableNamedParams[]`,
  conterrà (nella fase di migrazione) lo stato canonico di sort, filtri, paginator
  e aggregazioni come fonte di verità primaria — non come cache per la URL.

---

## 4. Eliminazione del contratto CDK DataSource (D3)

### 4.1 Perché è possibile senza sostituire MatTable

`MatTable` accetta per il binding `[dataSource]` tre forme alternative:

```
DataSource<T>   ← oggi usato
Observable<T[]> ← accettato
readonly T[]    ← accettato (semplice array)
```

Passare un semplice `T[]` è sufficiente per il rendering. Con Angular signals,
`IbTable` esporrà internamente un `computed<T[]>()` che produce l'array di righe da
rendere, e il template farà:

```html
<mat-table [dataSource]="renderedRows()">
```

Dove `renderedRows` è un `Signal<T[]>` derivato dalla pipeline computata.
Angular's change detection rileverà la nuova referenza dell'array al cambiamento del
signal e aggiornerà la vista.

### 4.2 Impatto sull'eliminazione di `IbTableDataSource`

Con D3 confermato, `IbTableDataSource` non è più necessaria come classe:
- Il CDK `DataSource<T>` non è più esteso.
- `connect()` e `disconnect()` scompaiono dall'API pubblica.
- `_renderData: BehaviorSubject<T[]>` viene sostituito da `renderedRows: Signal<T[]>`
  interno a `IbTable`.

### 4.3 Impatto sul mobile component

`IbKaiTableMobileComponent` oggi si iscrive a `dataSource.connect()` per ricevere i
dati renderizzati:

```typescript
// table-mobile.component.ts (oggi)
this.datasourceConnection = datasource.connect().asObservable().subscribe(data => {
  this.data.set(data);
  this.currentSort.set(...);
});
```

Con D3, il mobile component riceverà i dati tramite un `input<T[]>()` che `IbTable`
compilerà dal `renderedRows` signal:

```html
<!-- table.component.html (target) -->
<ib-kai-table-mobile [data]="renderedRows()" [currentSort]="sortState()" ...>
```

`IbKaiTableMobileComponent` già possiede `data = signal<any[]>([])` e `currentSort = signal(...)`;
l'adattamento è minimale.

---

## 5. Sincronizzazione del paginator via `effect()` (D4)

### 5.1 Il problema attuale

`IbTableDataSource._updatePaginator()` muta direttamente le proprietà di `MatPaginator`
dall'interno della pipeline RxJS:

```typescript
Promise.resolve().then(() => {
  paginator.length = filteredDataLength;
  if (paginator.pageIndex > lastPageIndex) {
    paginator.pageIndex = newPageIndex;
    this._internalPageChanges.next();
  }
});
```

Questo è un side-effect nascosto dentro una catena di trasformazioni.

### 5.2 Soluzione con `effect()` in `IbTable`

Con il nuovo flusso redux-first, il paginator viene aggiornato tramite un `effect()`
esplicito in `IbTable` che reagisce alle variazioni dello store:

```typescript
// IbTable (target, pseudocodice)
effect(() => {
  const page = this.store.selectSignal(selectTablePage(this.tableName))();
  untracked(() => {
    this.paginator.length = page.totalCount;
    this.paginator.pageIndex = page.pageIndex;
  });
});
```

`untracked()` isola le scritture sulle proprietà del paginator dall'albero reattivo,
evitando cicli. Questo rende esplicito dove e quando il paginator viene scritto.

---

## 6. Flusso target: redux-first con signals

### 6.1 Flusso attuale (il problema)

```
Componente Material emette evento
  → IbTableDataSource._updateChangeSubscription (pipeline RxJS)
    → trasforma dati (pure)  ← R5 side-effect incorporato qui
    → store.dispatch(setSort / setFilters ...)
      → Effect → tableUrlService.setSort() → router.navigate
    → _renderData.next(paginated)
      → MatTable legge via connect()
```

Il Redux store è un message bus unidirezionale: riceve dispatch, produce URL.
Non è mai letto dalla data source (che legge da `IbTableUrlService.getRawParams()`).

### 6.2 Flusso target

```
Utente interagisce (es. click header colonna)
  → MatSort.sortChange emette
    → IbTable: effect() / fromEvent binding
      → store.dispatch(setSort({ tableName, sort }))
        → Reducer aggiorna ibKaiTable.tables[tableName].sort
          → selectSort(tableName) emette
            → IbTable.sortState = toSignal(selectSort)
              → renderedRows (computed) ricalcola
                → mat-table [dataSource]="renderedRows()" aggiornato
              → effect() scrive paginator.pageIndex se necessario (D4)
            → UrlStateEffect.setSort$
              → tableUrlService.setSort() → URL aggiornata
```

La fonte di verità è lo store. La URL è un output (side-effect dell'effect),
non una fonte di lettura.

---

## 7. Simboli pubblici impattati

| Simbolo (public_api.ts) | Impatto |
|---|---|
| `IbTableDataSource` | **Rimosso** — non più una classe pubblica |
| `IbTableRemoteDataSource` | **Rimosso** — sostituito da `IbRemoteFetchStrategy` |
| `IbFetchDataResponse<T>` | **Mantenuto** — tipo di ritorno di `fetchData()` |
| `IbKaiTableState` | **Mantenuto** — tipo dello stato loading/error/idle |
| `ibTableSelectUrlState` | **Mantenuto** (cambia semantica: ora fonte di verità) |
| `ibTableSelectLastQueryString` | **Mantenuto** |
| `ibTableSelectLastQueryStringRaw` | **Mantenuto** |
| `urlStateActions` | **Rinominato o esteso** — il nome riflette la responsabilità allargata |
| `IbRemoteFetchStrategy<T, V>` | **Nuovo** — interfaccia pubblica per la strategia remote |
| `IKaiTableStore` | **Rimosso** — era dead code |

---

## 8. Rischi

| Rischio | Gravità | Note |
|---|---|---|
| Breaking change per consumatori di `IbTableDataSource` | Alta | Ogni `new IbTableDataSource(data)` smette di funzionare; la migrazione richiede spostare la logica nel componente |
| Breaking change per consumatori di `IbTableRemoteDataSource` | Alta | Ogni sottoclasse di `IbTableRemoteDataSource` va riscritta come service |
| `IbColumn.aggregatedData` / `aggregatedColumns` letti via `_table.dataSource` | Media | Richiede un nuovo canale (signal o injection token) per esporre questi valori alle colonne |
| `sortedColumns` usato dal servizio di export | Media | Il servizio di export deve ricevere l'ordine colonne da una fonte alternativa |
| Cicli reattivi paginator ↔ store | Media | Il paginator emette `page` quando si scrive `pageIndex`; l'effect deve isolare le scritture con `untracked()` |
| Test esistenti su `IbTableDataSource` / `IbTableRemoteDataSource` | Media | L'intera suite spec va riscritta |
| `instanceof IbTableRemoteDataSource` in `IbTable.ngOnInit` | Bassa | Il check va sostituito con la presenza/assenza dell'input `remoteSource` |

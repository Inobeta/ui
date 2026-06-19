# DEVK-1045 — Kai-Table: nuovi esempi per feature non documentate

**Data:** 2026-05-29
**Autore del piano:** architecture-planner

---

## 1. Goal

Aggiungere esempi dimostrativi per feature di `IbKaiTable` che esistono nel
codice sorgente ma non hanno nessuna copertura nella demo app. L'obiettivo è puramente
didattico/documentativo: nessuna modifica alla libreria, solo nuovi file (o modifiche
minime a quelli esistenti) sotto `src/app/examples/kai-table-example/` e relative route.

---

## 2. Current State

### File di riferimento nell'esempio attuale

| File | Descrizione |
|---|---|
| `kai-table-example.ts` + `.html` | Esempio base — `[data]` binding + `tableDef` (paginator.hide commentato) |
| `kai-table-full-example.ts` | Esempio completo — filter, views, selection, export, action column |
| `kai-table-actions-example.ts` | Context menu action column |
| `server-side/kai-table-api-example.ts` | Remote data source |
| `kai-table-with-routing.ts` | Row active con child route |
| `users.ts` | Fixture: `createNewUser()`, `IbUserExample`, `UserService` |
| `routing.module.ts` | Route radice per tutti gli esempi (`home/kai-table/…`) |

### Feature da documentare e loro stato nel codice libreria

| # | Feature | Codice sorgente | Stato |
|---|---|---|---|
| 1 | `IbTableDataSource` esplicito | `table-data-source.ts` | ✅ implementato, zero esempi |
| 2 | Sticky columns | `column.ts` `@Input() sticky`, `@Input() stickyEnd` | ✅ implementato, zero esempi |
| 3 | `tableDef.paginator.hide` | `table.types.ts → IbPaginatorOptions.hide` | ✅ implementato — da attivare nell'esempio "Simple" esistente |
| 4 | `filterPredicate` / `sortData` custom | `table-data-source.ts` proprietà pubbliche sovrascrivibili | ✅ implementato, zero esempi |
| 5 | Custom aggregate function (`IB_AGGREGATE`) | `tokens.ts`, `table-data-source.ts` | ✅ implementato, zero esempi |
| 6 | ~~Selettori NgRx pubblici~~ | ~~`store/index.ts`~~ | ❌ **rimosso dal piano** |
| 7 | `stripedRows` | `table.component.ts @HostBinding('class.ib-table-striped-rows')` | ✅ implementato, zero esempi |
| 8 | `IB_COLUMN_OPTIONS` | `tokens.ts → IbColumnOptions`, iniettato in `column.ts ngOnInit()` | ✅ implementato, zero esempi |

### Pattern usato dagli esempi esistenti

- Componenti standalone (`imports: [...]`).
- Template inline o templateUrl co-locato.
- Dati generati da `createNewUser()` / `UserService` in `users.ts`.
- Route aggiunta in `routing.module.ts` come figlio di `home/kai-table`.
- Nessun modulo dedicato: ogni esempio è autosufficiente.

---

## 3. Assumptions / Open Questions

1. **Nessuna modifica alla libreria.** Se durante l'implementazione emerge un bug bloccante
   su una feature (es. `paginator.hide` non funziona), il piano va aggiornato per prevedere
   anche uno step di fix nella libreria — ma questo è fuori scope iniziale.
2. **Aggregate custom:** `IB_AGGREGATE` si fornisce con `providers` nel componente che ospita
   la tabella. Occorre verificare che il token sia re-injectable a livello componente (e non
   solo root) — l'injection avviene in `IbTableDataSource` tramite `inject()` nel corpo
   della classe. Se l'injection context non è disponibile a quel punto, potrebbe servire
   un workaround (passare le funzioni direttamente dopo la costruzione).
3. **Sticky columns + layout**: per far funzionare lo sticky visivamente serve un contenitore
   con `overflow: auto` e larghezza fissa. L'esempio deve includere lo stile minimo necessario.

---

## 4. Proposed Approach

- **Step 3 (`paginator.hide`)**: invece di un esempio separato, si attiva direttamente
  nell'esempio "Simple" esistente (`kai-table-example.ts` + `.html`) scommettando il
  `tableDef.paginator.hide` commentato e aggiungendo un pulsante toggle.
- **Step 6 (selettori NgRx)**: rimosso su indicazione del team — non necessario.
- **Step 9 (routing)**: già completato in Step 0 — marcato DONE.
- Gli step 1, 2, 4, 5, 7, 8 creano nuovi file; sono tutti indipendenti tra loro e
  possono essere eseguiti in parallelo.

---

## 5. Step-by-Step Plan

---

### Step 0 — Skeleton components, route e voci di menu ✅ DONE

**Target executor:** `task-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-datasource-example.ts` *(nuovo)*
- `src/app/examples/kai-table-example/kai-table-sticky-example.ts` *(nuovo)*
- `src/app/examples/kai-table-example/kai-table-paginator-hide-example.ts` *(nuovo — skeleton rimosso in Step 3)*
- `src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts` *(nuovo)*
- `src/app/examples/kai-table-example/kai-table-custom-aggregate-example.ts` *(nuovo)*
- `src/app/examples/kai-table-example/kai-table-ngrx-selectors-example.ts` *(nuovo — step rimosso)*
- `src/app/examples/kai-table-example/kai-table-striped-rows-example.ts` *(nuovo)*
- `src/app/examples/kai-table-example/kai-table-column-options-example.ts` *(nuovo)*
- `src/app/routing.module.ts`
- `src/app/examples/main-menu-example/main-menu-data.json`
- `src/assets/i18n/it.json`

---

### Step 1 — Esempio `IbTableDataSource` esplicito

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-datasource-example.ts`

**Read-only reference files:**
- `src/app/examples/kai-table-example/users.ts`
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- `src/app/examples/kai-table-example/kai-table-full-example.ts`

**Objective:**
Dimostrare che si può istanziare `IbTableDataSource` nel componente consumer, passarlo
via `[dataSource]` invece di `[data]`, e aggiornare i dati tramite `dataSource.data = …`.
Questo pattern è il prerequisito per gli step 4 e 5 (override di `filterPredicate`,
`sortData` e provider di `IB_AGGREGATE`).

~~~
## TASK:
Implementare l'esempio IbTableDataSource esplicito (sostituire lo skeleton).

## CONTEXT:
Il repository è inobeta-ui. Il file da modificare esiste già come skeleton:
`src/app/examples/kai-table-example/kai-table-datasource-example.ts`

La tabella `ib-kai-table` accetta due modalità di alimentazione dati:
  - `[data]="array"` — shorthand, la datasource è creata internamente dalla tabella
  - `[dataSource]="ds"` — modalità esplicita, il consumer controlla l'istanza

Il componente IbTable ha:
  @Input() dataSource: IbTableDataSource<unknown> = new IbTableDataSource([]);
  @Input() set data(data: any[]) { this.dataSource.data = data; }

Con la modalità esplicita il consumer può:
  - Leggere `dataSource.filteredData` (righe visibili dopo filtro)
  - Sovrascrivere `filterPredicate` e `sortData`
  - Aggiornare i dati con `dataSource.data = newArray` senza passare per @Input

## OBJECTIVE:
Sovrascrivere il componente skeleton `IbKaiTableDatasourceExamplePage` con:
1. Proprietà `dataSource = new IbTableDataSource<IbUserExample>(initialData)` dichiarata
   come campo di classe (non nel costruttore).
2. Template che usa `[dataSource]="dataSource"` (non `[data]`).
3. Pulsante "Refresh" che assegna `this.dataSource.data = Array.from(...)` con 50 nuovi utenti.
4. Testo che mostra il conteggio righe filtrate: `dataSource.filteredData.length`.
5. Colonne: name, fruit, amount (con sort su tutte e tre).

## REQUIREMENTS:
1. Componente standalone con `imports: [IbKaiTableModule, MatButtonModule]`.
2. Dati iniziali: `Array.from({ length: 50 }, (_, k) => createNewUser(k + 1))`.
3. Il selector rimane `ib-kai-table-datasource-example`.
4. Stile host: `display: flex; flex-direction: column; padding: 30px; gap: 1em`.
5. Non usare `[data]` binding in nessun punto del template.

## CONSTRAINTS:
- Non modificare nessun file della libreria (src/app/inobeta-ui/).
- Non modificare routing.module.ts.

## OUTPUT:
File `src/app/examples/kai-table-example/kai-table-datasource-example.ts` aggiornato.

## ACCEPTANCE CRITERIA:
- `grep "\[dataSource\]" src/app/examples/kai-table-example/kai-table-datasource-example.ts` ≥ 1 match.
- `grep "filteredData" src/app/examples/kai-table-example/kai-table-datasource-example.ts` ≥ 1 match.
- `grep "\[data\]" src/app/examples/kai-table-example/kai-table-datasource-example.ts` = 0 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 2 — Esempio Sticky Columns

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-sticky-example.ts`

**Read-only reference files:**
- `src/app/examples/kai-table-example/users.ts`
- `src/app/inobeta-ui/ui/kai-table/columns/column.ts`
- `src/app/examples/kai-table-example/kai-table-actions-example.ts`

**Objective:**
Dimostrare `sticky` (colonna sinistra fissa) e `stickyEnd` (colonna destra fissa) con
un numero di colonne sufficiente a rendere la tabella scrollabile orizzontalmente.

~~~
## TASK:
Implementare l'esempio sticky columns (sostituire lo skeleton).

## CONTEXT:
Il file da modificare esiste già come skeleton:
`src/app/examples/kai-table-example/kai-table-sticky-example.ts`

`IbColumn`, `IbTextColumn`, `IbNumberColumn` e `IbDateColumn` espongono:
  @Input({ transform: booleanAttribute }) sticky = false;
  @Input({ transform: booleanAttribute }) stickyEnd = false;

Per rendere lo sticky visibile occorre che:
1. Il contenitore abbia `overflow-x: auto`.
2. La tabella abbia larghezza minima superiore alla viewport (forza lo scroll).

## OBJECTIVE:
Sovrascrivere il componente skeleton `IbKaiTableStickyExamplePage` con:
1. Sette colonne: id, name, fruit, amount, number, created_at, subscribed.
2. La colonna `name` ha attributo `sticky` (fissa a sinistra).
3. La colonna `subscribed` ha attributo `stickyEnd` (fissa a destra).
4. La tabella ha `[style.min-width]="'1100px'"` per forzare lo scroll.
5. Lo stile `:host` è `display: block; overflow-x: auto; padding: 30px`.

## REQUIREMENTS:
1. Componente standalone con `imports: [IbKaiTableModule]`.
2. Dati: `Array.from({ length: 30 }, (_, k) => createNewUser(k + 1))`.
3. `displayedColumns` include tutte e 7 le colonne nell'ordine: id, name, fruit, amount, number, created_at, subscribed.
4. Il selector rimane `ib-kai-table-sticky-example`.
5. Aggiungere `id` come campo stringa in `createNewUser` — è già presente in `IbUserExample`.

## CONSTRAINTS:
- Non modificare nessun file della libreria.
- Non modificare routing.module.ts.

## OUTPUT:
File `src/app/examples/kai-table-example/kai-table-sticky-example.ts` aggiornato.

## ACCEPTANCE CRITERIA:
- `grep " sticky" src/app/examples/kai-table-example/kai-table-sticky-example.ts` ≥ 1 match.
- `grep "stickyEnd" src/app/examples/kai-table-example/kai-table-sticky-example.ts` ≥ 1 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 3 — `tableDef.paginator.hide` nell'esempio Simple

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-example.ts`
- `src/app/examples/kai-table-example/kai-table-example.html`

**Read-only reference files:**
- `src/app/inobeta-ui/ui/kai-table/table.types.ts`

**Objective:**
Attivare `paginator.hide` nell'esempio "Simple" esistente aggiungendo un pulsante toggle
che alterna la visibilità del paginatore a runtime. Il file skeleton
`kai-table-paginator-hide-example.ts` creato in Step 0 **non va toccato** (era
previsto come esempio separato, ma la feature è stata spostata nel Simple).

~~~
## TASK:
Aggiungere un toggle paginator.hide all'esempio Simple esistente.

## CONTEXT:
Il file `src/app/examples/kai-table-example/kai-table-example.ts` è l'esempio "Simple"
esistente. Contiene già un `tableDef` con il paginator commentato:
  tableDef: IbTableDef = {
    /*paginator: { hide: true },*/
    initialSort: { active: "fruit", direction: "asc" },
  };

IbPaginatorOptions (table.types.ts) ha:
  hide?: boolean;

## OBJECTIVE:
Modificare `kai-table-example.ts` e `kai-table-example.html` per:
1. Aggiungere un pulsante toggle "Nascondi paginatore / Mostra paginatore".
2. Al click, alternare `tableDef.paginator.hide` tra `true` e `false`.
3. Il `tableDef` iniziale mantiene il paginatore visibile (hide: false o assente).

## REQUIREMENTS:
1. Aggiungere `MatButtonModule` agli `imports` del componente se non presente.
2. Aggiungere una proprietà `paginatorHidden = false` nel componente.
3. Il metodo toggle ri-assegna l'intero oggetto `tableDef` (immutable update) per
   triggerare il change detection:
   `this.tableDef = { ...this.tableDef, paginator: { ...this.tableDef.paginator, hide: !this.paginatorHidden } }`
4. Il template mostra il testo del pulsante in base allo stato corrente.

## CONSTRAINTS:
- Non modificare nessun file della libreria.
- Non toccare `kai-table-paginator-hide-example.ts` (skeleton, ignorarlo).
- Non alterare le colonne o i dati esistenti dell'esempio.

## OUTPUT:
`kai-table-example.ts` e `kai-table-example.html` aggiornati.

## ACCEPTANCE CRITERIA:
- `grep "hide" src/app/examples/kai-table-example/kai-table-example.ts` ≥ 1 match.
- `grep "toggle\|paginatorHidden\|paginator" src/app/examples/kai-table-example/kai-table-example.html` ≥ 1 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 4 — Esempio `filterPredicate` e `sortData` custom

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts`

**Read-only reference files:**
- `src/app/examples/kai-table-example/users.ts`
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- `src/app/examples/kai-table-example/kai-table-datasource-example.ts` *(step 1)*

**Objective:**
Dimostrare come sovrascrivere `filterPredicate` e `sortData` su un'istanza esplicita di
`IbTableDataSource`. Prerequisito: Step 1 completato (introduce il pattern `[dataSource]`).

~~~
## TASK:
Implementare l'esempio custom filterPredicate e sortData (sostituire lo skeleton).

## CONTEXT:
Il file da modificare esiste già come skeleton:
`src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts`

IbTableDataSource espone due proprietà pubbliche sovrascrivibili:
  sortData: (data: T[], sort: MatSort) => T[]
  filterPredicate: (data: T, filter: IbFilterSyntax) => boolean

Le sovrascritture vanno assegnate DOPO la costruzione della datasource ma PRIMA che
la tabella chiami connect(). Il momento sicuro è `ngOnInit` o come inizializzazione
del campo di classe (arrow function).

UserService.fruits include null, undefined e stringa vuota — utili per dimostrare
il filterPredicate custom che gestisce valori mancanti.

## OBJECTIVE:
Sovrascrivere il componente skeleton `IbKaiTableCustomSortFilterExamplePage` con:
1. Istanza esplicita `dataSource = new IbTableDataSource<IbUserExample>(data)`.
2. Override di `sortData`: per la colonna `name` usa `localeCompare` case-insensitive;
   per le altre colonne chiama la funzione originale (salvata prima della sovrascrittura
   come `const defaultSort = this.dataSource.sortData.bind(this.dataSource)`).
3. Override di `filterPredicate`: per il campo `fruit`, se il valore è null/undefined/''
   restituisce sempre `true` (la riga è sempre visibile, indipendentemente dal filtro).
4. Colonne: name, fruit, amount — con sort su tutte e tre.
5. Filtro: `<ib-filter>` con `<ib-search-bar />` e `<ib-text-filter name="fruit">`.

## REQUIREMENTS:
1. Componente standalone con `imports: [IbKaiTableModule, IbFilterModule]`.
2. Dati: 50 righe con `createNewUser` (i fruits nullish sono già generati da UserService.fruits).
3. Il selector rimane `ib-kai-table-custom-sort-filter-example`.
4. Usare `[dataSource]` e non `[data]`.

## CONSTRAINTS:
- Non modificare nessun file della libreria.
- Non modificare routing.module.ts.

## OUTPUT:
File `src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts` aggiornato.

## ACCEPTANCE CRITERIA:
- `grep "filterPredicate" src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts` ≥ 1 match.
- `grep "sortData" src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts` ≥ 1 match.
- `grep "\[dataSource\]" src/app/examples/kai-table-example/kai-table-custom-sort-filter-example.ts` ≥ 1 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 5 — Esempio Custom Aggregate Function (`IB_AGGREGATE`)

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-custom-aggregate-example.ts`

**Read-only reference files:**
- `src/app/examples/kai-table-example/users.ts`
- `src/app/inobeta-ui/ui/kai-table/tokens.ts`
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/cells.ts`
- `src/app/examples/kai-table-example/kai-table-full-example.ts`

**Objective:**
Mostrare come fornire funzioni di aggregazione custom tramite il token `IB_AGGREGATE`,
che viene poi scelto dall'utente nella dropdown del footer aggregato.

> ⚠️ **Assunzione da verificare**: `IB_AGGREGATE` è iniettato dentro `IbTableDataSource`
> tramite `inject()` nel corpo della classe. Verificare se il token è iniettabile a
> livello di `providers` del componente ospitante. Se l'injection fallisce, l'executor
> deve segnalare "NEED CLARIFICATION".

~~~
## TASK:
Implementare l'esempio custom aggregate via IB_AGGREGATE (sostituire lo skeleton).

## CONTEXT:
Il file da modificare esiste già come skeleton:
`src/app/examples/kai-table-example/kai-table-custom-aggregate-example.ts`

Il token IB_AGGREGATE (tokens.ts):
  export const IB_AGGREGATE = new InjectionToken<any>("IbAggregate");

È iniettato in IbTableDataSource come campo di classe:
  aggregationFunctions = inject(IB_AGGREGATE);

Le funzioni hanno la forma:
  { id: string; label: string; aggregateData: (values: any[]) => number | string }

La colonna `ib-number-column` deve avere l'attributo `aggregate` per mostrare il footer
con la dropdown di scelta funzione.

## OBJECTIVE:
Sovrascrivere il componente skeleton `IbKaiTableCustomAggregateExamplePage` con:
1. Provider nel componente:
   { provide: IB_AGGREGATE, useValue: [
       { id: 'avg', label: 'Media', aggregateData: (values) => (values.reduce((a,b) => a + (b||0), 0) / values.length).toFixed(2) },
       { id: 'max', label: 'Massimo', aggregateData: (values) => Math.max(...values.filter(v => v != null)) }
   ]}
2. Colonne: name, fruit, amount — con `aggregate` su `amount`.
3. Dati: 50 righe con `createNewUser`.

## REQUIREMENTS:
1. Componente standalone con `imports: [IbKaiTableModule]`.
2. Il selector rimane `ib-kai-table-custom-aggregate-example`.
3. Stile host: `display: flex; flex-direction: column; padding: 30px`.
4. Se IB_AGGREGATE non è iniettabile a livello componente (injection context error
   a runtime), scrivere "NEED CLARIFICATION" nel messaggio di risposta.

## CONSTRAINTS:
- Non modificare nessun file della libreria.
- Non modificare routing.module.ts.

## OUTPUT:
File `src/app/examples/kai-table-example/kai-table-custom-aggregate-example.ts` aggiornato.

## ACCEPTANCE CRITERIA:
- `grep "IB_AGGREGATE" src/app/examples/kai-table-example/kai-table-custom-aggregate-example.ts` ≥ 1 match.
- `grep "aggregateData" src/app/examples/kai-table-example/kai-table-custom-aggregate-example.ts` ≥ 2 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 6 — ~~Esempio Selettori NgRx Pubblici~~ ❌ RIMOSSO

Step rimosso su indicazione del team. Il file skeleton
`kai-table-ngrx-selectors-example.ts` (creato in Step 0) è da considerarsi
inutilizzato — non rimuoverlo per non rompere le route già registrate.

---

### Step 7 — Esempio `stripedRows`

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-striped-rows-example.ts`

**Read-only reference files:**
- `src/app/examples/kai-table-example/users.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts` (righe 186-188)

**Objective:**
Mostrare `stripedRows` con toggle per confronto visivo on/off.

~~~
## TASK:
Implementare l'esempio stripedRows con toggle (sostituire lo skeleton).

## CONTEXT:
Il file da modificare esiste già come skeleton:
`src/app/examples/kai-table-example/kai-table-striped-rows-example.ts`

IbTable ha:
  @HostBinding("class.ib-table-striped-rows")
  @Input({ transform: booleanAttribute })
  stripedRows = false;

Il CSS per `ib-table-striped-rows` è già definito nella libreria e alterna
il background delle righe pari/dispari.

## OBJECTIVE:
Sovrascrivere il componente skeleton `IbKaiTableStripedRowsExamplePage` con:
1. Proprietà `striped = false`.
2. Pulsante toggle che alterna `striped` tra true e false.
3. Testo che mostra lo stato corrente: "Striped: ON" / "Striped: OFF".
4. Tabella con `[stripedRows]="striped"`, colonne name, fruit, amount, 30 righe.

## REQUIREMENTS:
1. Componente standalone con `imports: [IbKaiTableModule, MatButtonModule]`.
2. Dati: 30 righe con `createNewUser`.
3. Il selector rimane `ib-kai-table-striped-rows-example`.
4. Stile host: `display: flex; flex-direction: column; padding: 30px; gap: 1em`.

## CONSTRAINTS:
- Non modificare nessun file della libreria.
- Non modificare routing.module.ts.

## OUTPUT:
File `src/app/examples/kai-table-example/kai-table-striped-rows-example.ts` aggiornato.

## ACCEPTANCE CRITERIA:
- `grep "stripedRows" src/app/examples/kai-table-example/kai-table-striped-rows-example.ts` ≥ 2 match.
- `grep "striped" src/app/examples/kai-table-example/kai-table-striped-rows-example.ts` ≥ 3 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 8 — Esempio `IB_COLUMN_OPTIONS`

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/kai-table-column-options-example.ts`

**Read-only reference files:**
- `src/app/inobeta-ui/ui/kai-table/tokens.ts`
- `src/app/inobeta-ui/ui/kai-table/columns/column.ts` (righe 160-173)
- `src/app/examples/kai-table-example/users.ts`

**Objective:**
Dimostrare come fornire `IB_COLUMN_OPTIONS` a livello di componente per trasformare
l'header text globalmente e sostituire il data accessor di default.

~~~
## TASK:
Implementare l'esempio IB_COLUMN_OPTIONS (sostituire lo skeleton).

## CONTEXT:
Il file da modificare esiste già come skeleton:
`src/app/examples/kai-table-example/kai-table-column-options-example.ts`

Il token IB_COLUMN_OPTIONS (tokens.ts):
  interface IbColumnOptions<T> {
    defaultHeaderTextTransform?: (name: string) => string;
    defaultDataAccessor?: (data: T, name: string) => string;
  }
  export const IB_COLUMN_OPTIONS = new InjectionToken<IbColumnOptions<any>>('ib-column-options');

Ogni IbColumn lo inietta in ngOnInit:
  _options = inject(IB_COLUMN_OPTIONS, { optional: true }) || {};
  // usato in:
  if (this.headerText === undefined) {
    this.headerText = this._options.defaultHeaderTextTransform?.(name) ?? capitalize(name);
  }
  if (!this.dataAccessor) {
    this.dataAccessor = this._options.defaultDataAccessor ?? ((data, name) => data[name]);
  }

Fornirlo nel componente impatta TUTTE le colonne della tabella che non hanno
`headerText` o `dataAccessor` espliciti.

UserService.fruits include null, undefined e '' — utili per dimostrare
il defaultDataAccessor che mostra "—" invece di cella vuota.

## OBJECTIVE:
Sovrascrivere il componente skeleton `IbKaiTableColumnOptionsExamplePage` con:
1. Provider nel componente:
   {
     provide: IB_COLUMN_OPTIONS,
     useValue: {
       defaultHeaderTextTransform: (name: string) => name.replace(/_/g, ' ').toUpperCase(),
       defaultDataAccessor: (data: any, name: string) => data[name] ?? '—'
     }
   }
2. Colonne: name, fruit, amount, created_at — SENZA `headerText` su nessuna
   (così si vede l'effetto del transform: "NAME", "FRUIT", "AMOUNT", "CREATED AT").
3. 50 righe con `createNewUser`.

## REQUIREMENTS:
1. Componente standalone con `imports: [IbKaiTableModule]`.
2. Il selector rimane `ib-kai-table-column-options-example`.
3. Stile host: `display: flex; flex-direction: column; padding: 30px`.
4. Nessun `headerText` esplicito su nessuna colonna.

## CONSTRAINTS:
- Non modificare nessun file della libreria.
- Non modificare routing.module.ts.
- Non aggiungere headerText sulle colonne.

## OUTPUT:
File `src/app/examples/kai-table-example/kai-table-column-options-example.ts` aggiornato.

## ACCEPTANCE CRITERIA:
- `grep "IB_COLUMN_OPTIONS" src/app/examples/kai-table-example/kai-table-column-options-example.ts` ≥ 1 match.
- `grep "defaultHeaderTextTransform" src/app/examples/kai-table-example/kai-table-column-options-example.ts` ≥ 1 match.
- `grep "headerText" src/app/examples/kai-table-example/kai-table-column-options-example.ts` = 0 match.
- `npm run build` completa senza errori.

## IF UNSURE:
Scrivi "NEED CLARIFICATION" e non procedere.
~~~

---

### Step 9 — Registrazione delle nuove route ✅ DONE

Completato in **Step 0**. Route, menu e traduzioni già presenti.

---

## 6. Impacted Areas

### File nuovi (solo `src/app/examples/`)
| File | Step |
|---|---|
| `kai-table-datasource-example.ts` | 1 |
| `kai-table-sticky-example.ts` | 2 |
| `kai-table-custom-sort-filter-example.ts` | 4 |
| `kai-table-custom-aggregate-example.ts` | 5 |
| `kai-table-striped-rows-example.ts` | 7 |
| `kai-table-column-options-example.ts` | 8 |

### File modificati
| File | Step | Modifica |
|---|---|---|
| `kai-table-example.ts` + `.html` | 3 | +toggle paginator.hide |
| `src/app/routing.module.ts` | 0 ✅ | +8 import, +8 route |
| `main-menu-data.json` | 0 ✅ | +8 voci menu |
| `it.json` | 0 ✅ | +8 chiavi i18n |

### Simboli `public_api.ts`
Nessuna modifica. I token `IB_AGGREGATE` e `IB_COLUMN_OPTIONS` devono già essere
esportati — verificare prima degli step 5 e 8.

---

## 7. Risks

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| `IB_AGGREGATE` non iniettabile a livello componente | Media | Step 5 bloccato | L'executor segnala NEED CLARIFICATION; serve un fix separato nella libreria |
| `paginator.hide` non gestito nel template (commento suggerisce possibile regressione) | Media | Step 3 mostra UI rotta | Verificare nel template `table.component.html`; se non gestito, aprire ticket separato |
| Sticky columns non visibili senza overflow sul container | Bassa | Esempio non didattico | Mitigato dai requisiti di stile espliciti nello step 2 |

---

## 8. Validation Checklist

- [ ] `npm run lint` — nessun errore o warning nuovo
- [ ] `npm run build` — build production senza errori
- [ ] `npm run test-ci` — tutti i test passano (nessuna spec esistente deve regredire)
- [ ] Navigazione a `home/kai-table/simple` — toggle paginator.hide funziona
- [ ] Navigazione a `home/kai-table/datasource` — tabella si popola, Refresh aggiorna i dati, contatore filteredData si aggiorna
- [ ] Navigazione a `home/kai-table/sticky` — scroll orizzontale, name fisso a sinistra, subscribed fisso a destra
- [ ] Navigazione a `home/kai-table/custom-sort-filter` — ordinamento case-insensitive su name, frutti null sempre visibili nel filtro
- [ ] Navigazione a `home/kai-table/custom-aggregate` — dropdown footer mostra "Media" e "Massimo"
- [ ] Navigazione a `home/kai-table/striped-rows` — toggle alterna le righe visivamente
- [ ] Navigazione a `home/kai-table/column-options` — header "NAME", "FRUIT", "AMOUNT", "CREATED AT"; celle null mostrano "—"

---

## 10. Dependencies Between Steps

```
Step 0 ✅
        │
        ├─▶ Step 1  ──┐
        ├─▶ Step 2  ──┤
        ├─▶ Step 3  ──┤ (modifica Simple esistente)
        ├─▶ Step 4  ──┤ (legge step 1 come reference)
        ├─▶ Step 5  ──┤
        ├─▶ Step 7  ──┤
        └─▶ Step 8  ──┘

Step 6: RIMOSSO
Step 9: ✅ (completato in Step 0)
```

Gli step 1, 2, 3, 4, 5, 7, 8 sono **indipendenti tra loro** e possono essere
eseguiti in parallelo una volta completato lo Step 0.

# DEVK-1066 — IbTableDataSource: architectural elimination

**Date:** 2026-06-08
**Author:** architecture-planner
**Analysis source:** `docs/analysis/table-datasource-analysis.md`

---

## 1. Goal

Eliminate `IbTableDataSource` and `IbTableRemoteDataSource` as public API classes.
Replace them with:

- A **redux-first, signal-based pipeline** inside `IbTable` (client-side case).
- An **injectable Angular service strategy** (`IbRemoteFetchStrategy<T,V>`) for the remote case.
- Clean separation of concerns: `IbTable` owns the reactive pipeline; the store is the
  canonical source of truth; the URL is a side-effect output of effects.

Migration strategy: **big-bang (D5)** — no adapter layer. Steps 3–8 form a compile-chain
dependency group; the build passes only after all six steps complete.

---

## 2. Current State

| File | Role |
|---|---|
| `table-data-source.ts` | `IbTableDataSource<T>` extends CDK `DataSource<T>`; blends 5 responsibilities; dispatches to NgRx store inside RxJS operators |
| `remote-data-source.ts` | `IbTableRemoteDataSource<T,V>` extends `IbTableDataSource`; overrides `_updateChangeSubscription`; consumer must subclass it |
| `table.component.ts` | `IbTable` creates `new IbTableDataSource([])` by default; sets `sort/paginator/filter/columns` on it; contains `instanceof IbTableRemoteDataSource` check |
| `store/index.ts` | Active `ibKaiTableFeature` (flat `urlStateReducer`) + dead code: `IKaiTableStore`, `kaiTableReducers` |
| `store/url-state/` | Actions, reducer, selectors, effects — currently URL-write-only side-effects |
| `columns/column.ts` | `IbColumn` reads `_table.dataSource.aggregatedColumns` and `.aggregatedData`; calls `_table.dataSource.aggregate.next(...)` |
| `table-mobile.component.ts` | Subscribes to `datasource.connect().asObservable()` in constructor effect |
| `data-export.service.ts` | Reads `filteredData`, `sortedColumns`, `_orderData()`, `_pageData()` from `IbTableDataSource` |
| `tokens.ts` | `IB_TABLE = InjectionToken<any>` — provides `IbTable` to sub-components |
| `public_api.ts` | `IbTableDataSource`, `IbTableRemoteDataSource`, `IbFetchDataResponse`, `urlStateActions`, `ibTableSelectUrlState` etc. exported via `ui/kai-table/index.ts` |

### Store shape

```
NgRx root
  └── ibKaiTable: IUrlStateState
        └── tables: IbKaiTableNamedParams[]
```

Each `IbKaiTableNamedParams` stores `{ tableName, filters, page, pageSize, aggregatedColumns, sort }`.
Effects write these values to the URL query string. The datasource reads initial state from
`IbTableUrlService.getRawParams()` (URL snapshot) on init — NOT from the store.

---

## 3. Assumptions / Open Questions

| # | Assumption |
|---|---|
| A1 | Feature key `'ibKaiTable'` stays unchanged — consumers may query this NgRx slice directly. |
| A2 | The store becomes the **source of truth** for sort, filters, page, aggregation — not just a URL-write bus. `IbTable` reads state via `toSignal(store.select(...))`. |
| A3 | Client-side pipeline (filter/sort/paginate) pure functions are extracted from `IbTableDataSource` and re-used internally by `IbTable`. |
| A4 | `IbTable` owns `debounceTime`/`switchMap` for the remote case; the consumer strategy only implements `fetchData()`. |
| A5 | `inject(IB_AGGREGATE)` moves from `IbTableDataSource` to `IbTable`. |
| A6 | `@Input() data` on `IbTable` becomes the direct data source for the client-side pipeline (no indirection through `dataSource.data`). |
| A7 | `IbDataExportService._exportFromTable` receives a context object from `IbTable` instead of the datasource instance. Exact shape: `{ filteredData, sortedColumns, selectedData }` — implementer may refine. |
| A8 | The aggregate `Subject` moves from `IbTableDataSource` to `IbTable`; `IbColumn` reads it via `IB_TABLE` injection. |
| **Q1** | Should `IbTableDataSource` be completely deleted or kept as a `/** @internal */` utility? **Assume: deleted.** Re-open if pure functions need a shared home. |
| **Q2** | Does `tableDef.initialSort` need to be pre-loaded into the store on `ngOnInit`, or initialized directly into the signal? **Assume: written directly into the signal / store dispatch on init.** |

---

## 4. Proposed Approach

Two independent work streams before the core refactor:
- **Stream A** (Steps 1–2): safe, non-breaking cleanup and type additions.
- **Stream B** (Steps 3–8): compile-chain refactor; all six steps must complete together.

After Stream B:
- **Stream C** (Steps 9–10): examples and specs, depend on Stream B.

---

## 5. Step-by-Step Plan

### Dependencies between steps

```
Step 1 ──────────────────────────────────────────────────── independent
Step 2 ──────────────────────────────────────────────────── independent
Steps 3 → 4 → 5 → 6 → 7 → 8 ─── compile-chain (B)
Steps 9, 10 ───────────────────── depend on Step 8
```

---

### Step 1 — Remove dead store code [INDEPENDENT]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/store/index.ts`

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/store/url-state/reducers.ts`

**Objective:** Delete `IKaiTableStore` and `kaiTableReducers` — dead code confirmed unused across the repo.

**Key requirements:**
1. Remove `export interface IKaiTableStore { urlState: IUrlStateState; }`.
2. Remove `export const kaiTableReducers: ActionReducerMap<IKaiTableStore> = { urlState: urlStateReducer }`.
3. Remove the `ActionReducerMap` import if no longer needed.
4. Keep `ibKaiTableFeature`, `kaiTableEffects`, `selectTables`, and all three `ibTableSelect*` re-exports untouched.

**Constraints:**
- No change to selector names, feature key, or effect list.
- Do not touch any file outside `store/index.ts`.

**Validation:**
- `npm run lint` passes.
- `grep -r "kaiTableReducers\|IKaiTableStore" src/` returns no matches.
- `npm run test-ci` passes.

**Stop condition:** If `kaiTableReducers` or `IKaiTableStore` are imported anywhere outside `store/index.ts`, stop and report.

---

~~~
## TASK:
Remove dead code from `store/index.ts` in the kai-table NgRx store.

## CONTEXT:
Repo: inobeta-ui Angular library.
File: `src/app/inobeta-ui/ui/kai-table/store/index.ts`.
Current state: the file exports two parallel store definitions. `ibKaiTableFeature` (using
`createFeature`) is the active one used by `table.module.ts`. `kaiTableReducers` and
`IKaiTableStore` are confirmed dead code — not imported anywhere outside this file.

## OBJECTIVE:
Delete `IKaiTableStore` and `kaiTableReducers` from `store/index.ts`.
All other exports must remain identical.

## REQUIREMENTS:
1. Remove `export interface IKaiTableStore { urlState: IUrlStateState; }`.
2. Remove `export const kaiTableReducers: ActionReducerMap<IKaiTableStore> = { ... }`.
3. Remove `ActionReducerMap` from the `@ngrx/store` import if it is no longer used.
4. Keep `ibKaiTableFeature`, `kaiTableEffects`, and all three selector re-exports intact.

## CONSTRAINTS:
- Edit only `store/index.ts`.
- Do not rename or remove any remaining exports.
- Do not add new exports.

## OUTPUT:
Updated `store/index.ts` with the two dead-code items removed.

## ACCEPTANCE CRITERIA:
- `grep -r "kaiTableReducers\|IKaiTableStore" src/` returns zero matches.
- `npm run lint` exits 0.
- `npm run test-ci` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Define `IbRemoteFetchStrategy<T,V>` public types [INDEPENDENT]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/remote-strategy.ts` (new)
- `src/app/inobeta-ui/ui/kai-table/index.ts`

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- `src/app/inobeta-ui/ui/kai-table/store/url-state/interfaces.ts`

**Objective:** Create the new public interface that will replace `IbTableRemoteDataSource`
as the consumer-facing contract.

**Key requirements:**
1. New file `remote-strategy.ts` exports:
   - `IbSortState = { active: string; direction: 'asc' | 'desc' | '' }` (plain type, no Angular Material dependency)
   - `IbPageState = { pageIndex: number; pageSize: number }`
   - `IbRemoteFetchStrategy<T, V = Record<string, any>>` interface with one method:
     `fetchData(sort: IbSortState, page: IbPageState, filter?: V): Observable<IbFetchDataResponse<T>>`
   - Re-export `IbFetchDataResponse<T>` from `remote-data-source.ts` (do not duplicate it)
2. Add `export * from './remote-strategy'` to `index.ts`.
3. Do NOT add to `public_api.ts` yet (Step 8 handles public API).

**Constraints:**
- Do not import `MatSort` or `MatPaginator` in `remote-strategy.ts`.
- Do not modify `remote-data-source.ts`.
- `IbFetchDataResponse` stays in `remote-data-source.ts`; just re-export from new file.

**Validation:**
- `npm run lint` passes.
- `grep "IbRemoteFetchStrategy" src/app/inobeta-ui/ui/kai-table/index.ts` has a match.

**Stop condition:** If `IbFetchDataResponse` cannot be re-exported cleanly from `remote-strategy.ts`, import it directly there and leave the original export in `remote-data-source.ts` as-is.

---

~~~
## TASK:
Create a new `remote-strategy.ts` file defining the `IbRemoteFetchStrategy<T,V>` interface and
supporting types. Export it from the kai-table barrel.

## CONTEXT:
Repo: inobeta-ui Angular library. Folder: `src/app/inobeta-ui/ui/kai-table/`.
`remote-data-source.ts` already exports `IbFetchDataResponse<T>`.
No file named `remote-strategy.ts` exists yet.

## OBJECTIVE:
Add three new exported types in `remote-strategy.ts` and re-export from `index.ts`.

## REQUIREMENTS:
1. Create `remote-strategy.ts` with:
   - `export type IbSortState = { active: string; direction: 'asc' | 'desc' | '' }`
   - `export type IbPageState = { pageIndex: number; pageSize: number }`
   - `export { IbFetchDataResponse } from './remote-data-source'`
   - `export interface IbRemoteFetchStrategy<T, V = Record<string, any>> { fetchData(sort: IbSortState, page: IbPageState, filter?: V): Observable<IbFetchDataResponse<T>>; }`
2. Import `Observable` from `rxjs` in `remote-strategy.ts`.
3. Add `export * from './remote-strategy'` to `index.ts` (before existing exports).

## CONSTRAINTS:
- Do not import `MatSort`, `MatPaginator`, or any Angular Material type in `remote-strategy.ts`.
- Do not modify `remote-data-source.ts`.
- Do not touch `public_api.ts`.

## OUTPUT:
- New file `remote-strategy.ts`.
- Updated `index.ts` with one new export line.

## ACCEPTANCE CRITERIA:
- `grep "IbRemoteFetchStrategy" src/app/inobeta-ui/ui/kai-table/index.ts` returns a match.
- `grep "IbSortState\|IbPageState" src/app/inobeta-ui/ui/kai-table/remote-strategy.ts` returns matches.
- `npm run lint` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Redux-first pipeline + `renderedRows` signal in `IbTable` [CHAIN-B START]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html`
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts` (may extract pure utility functions)

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/store/url-state/actions.ts`
- `src/app/inobeta-ui/ui/kai-table/store/url-state/selectors.ts`
- `src/app/inobeta-ui/ui/kai-table/store/url-state/interfaces.ts`
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts` (for pure-function extraction)

**Objective:** Move the reactive data pipeline into `IbTable` using Angular signals.
User interaction events dispatch to the NgRx store; `renderedRows` is computed from
store state + raw data. `MatTable` receives `renderedRows()` directly. Paginator is
synced via `effect()`.

**⚠️ Chain dependency:** This step alone will NOT produce a passing build. Steps 4–8
must also complete. Edit files without breaking unrelated functionality; leave
`IbTableDataSource` in place for now (it will be removed in Step 8).

**Key requirements:**
1. Add signals to `IbTable`:
   - `private _data = signal<unknown[]>([])` — set by the `@Input() set data(...)` setter.
   - `private _sortState` — `toSignal` of `store.select(ibTableSelectUrlState(this.tableName))` mapping to sort field; or `signal<IbSortState>`.
   - `private _filterState` — similar, mapping to filters.
   - `private _pageState` — similar, mapping to page/pageSize.
   - `private _columnsRegistry = signal<IbColumn<unknown>[]>([])` — updated in `ngAfterContentInit` where `dataSource.columns` was set.
2. `renderedRows = computed<unknown[]>(() => { /* apply filter → sort → paginate */ })` using pure functions extracted from `IbTableDataSource` (keep those functions, just move them or import them).
3. Dispatch sort events: in `ngAfterContentInit`, subscribe to `this.sort.sortChange` → `store.dispatch(urlStateActions.setSort({ tableName, params: sortState }))`.
4. Dispatch filter events: when `filter.ibFilterUpdated` emits → `store.dispatch(urlStateActions.setFilters(...))`.
5. Dispatch page events: keep existing `setPaginatorState()` method (already dispatches `urlStateActions.setPaginator`).
6. Paginator sync via `effect()`:
   ```typescript
   effect(() => {
     const tableState = this._tableState();
     untracked(() => {
       this.paginator.length = /* filteredData length from renderedRows pipeline */;
       this.paginator.pageIndex = tableState?.page ?? 0;
     });
   });
   ```
7. Template: change `[dataSource]="dataSource"` to `[dataSource]="renderedRows()"`.
8. Template: `[matSortActive]` and `[matSortDirection]` should read from the store signal,
   not from `dataSource.sortState`.
9. Initialize sort state from URL on `ngOnInit` by dispatching a `setSort` action (instead of calling `dataSource.initializeSortState()`).

**Constraints:**
- Do not remove `@Input() dataSource` yet — `IbColumn` and `IbKaiTableMobileComponent` still reference it (removed in Steps 5–6).
- Do not remove `IbTableDataSource` class yet.
- Do not touch the aggregation logic yet (Step 5).
- `renderedRows` computed must NOT call `store.dispatch()` — no side-effects inside `computed()`.
- Use `untracked()` inside `effect()` for paginator property writes to prevent reactive cycles.

**Validation (partial — build will fail until Step 8):**
- Template compiles without TS errors (`ng build --configuration=development`).
- `npm run lint` passes.

**Stop condition:** If the `toSignal` of the store selector produces typing issues with `IbTable`'s generic `T`, use `unknown` as the table generic and cast as needed. Report the typing issue.

---

~~~
## TASK:
Introduce a `renderedRows` computed signal in `IbTable` and wire the redux-first event dispatch.
Change the MatTable binding from `[dataSource]="dataSource"` to `[dataSource]="renderedRows()"`.

## CONTEXT:
Repo: inobeta-ui. File: `src/app/inobeta-ui/ui/kai-table/table.component.ts` and
`table.component.html`. Currently `IbTable` delegates all pipeline work to `IbTableDataSource`
(a CDK DataSource subclass). The goal is to move this pipeline into `IbTable` as signals.

The store slice `ibKaiTable` contains per-table state (`sort`, `filters`, `page`, `pageSize`,
`aggregatedColumns`) via `ibTableSelectUrlState(tableName)`. Actions are in `store/url-state/actions.ts`.
Pure functions for filter/sort/paginate exist in `table-data-source.ts` and can be extracted.

## OBJECTIVE:
After this step, `IbTable.renderedRows` is a `Signal<unknown[]>` computed from:
- raw `_data` signal (set by `@Input() data`),
- store-driven sort/filter/page state signals,
- column registry signal.

The `mat-table` receives `[dataSource]="renderedRows()"`. The paginator is synced by an
`effect()`. User-triggered sort and filter events dispatch to the NgRx store.

## REQUIREMENTS:
1. Add private signals: `_data`, `_columnsRegistry`; derive sort/filter/page signals from
   `toSignal(store.select(ibTableSelectUrlState(this.tableName)))`.
2. Implement `renderedRows = computed<unknown[]>(...)` — apply `filterPredicate` logic → `sortData` logic → `_pageData` logic. These pure functions may be imported from `table-data-source.ts` or inlined; do not call `store.dispatch()` inside `computed()`.
3. In `ngOnInit`, dispatch initial sort state from URL snapshot using `store.dispatch(urlStateActions.setSort(...))` instead of calling `dataSource.initializeSortState()`.
4. In `ngAfterContentInit`, subscribe to `this.sort.sortChange` and dispatch `urlStateActions.setSort`.
5. In `ngAfterContentInit`, subscribe to `filter.ibFilterUpdated` and dispatch `urlStateActions.setFilters`.
6. Add `effect()` for paginator sync using `untracked()` for property writes.
7. Update `table.component.html`: replace `[dataSource]="dataSource"` with `[dataSource]="renderedRows()"`. Update `[matSortActive]` and `[matSortDirection]` bindings to read from the store signal.
8. Keep `@Input() dataSource` and `@Input() data` in place — both still used by other components.

## CONSTRAINTS:
- Do NOT remove `IbTableDataSource`, `@Input() dataSource`, or the aggregation code — those come in later steps.
- Do NOT call `store.dispatch()` inside `computed()` or inside `renderedRows`.
- Use `untracked()` inside `effect()` when writing to `this.paginator` properties.
- Do not change the public `@Input()` API surface of `IbTable` except where stated.

## OUTPUT:
Updated `table.component.ts` and `table.component.html`.
Optionally: extracted pure utility functions from `table-data-source.ts` into a helper file.

## ACCEPTANCE CRITERIA:
- `ng build --configuration=development` reports no TypeScript errors in `table.component.ts`.
- `npm run lint` exits 0.
- `grep "renderedRows()" src/app/inobeta-ui/ui/kai-table/table.component.html` returns a match.
- `grep "store.dispatch.*setSort\|store.dispatch.*setFilters" src/app/inobeta-ui/ui/kai-table/table.component.ts` returns matches.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Add `remoteSource` input; remove `instanceof` check [CHAIN-B]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/remote-strategy.ts` (created in Step 2)
- `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`

**Objective:** Add `remoteSource = input<IbRemoteFetchStrategy<unknown, unknown>>()` to
`IbTable`. When set, the `renderedRows` signal must be fed from a remote fetch pipeline
(replaces the old `IbTableRemoteDataSource` flow). Remove the `instanceof IbTableRemoteDataSource`
check. Loading/error state is driven by the remote pipeline.

**Key requirements:**
1. Add `remoteSource = input<IbRemoteFetchStrategy<unknown, unknown>>()`.
2. In `IbTable`, create a private `effect()` that:
   - Watches for `remoteSource()` being set.
   - Creates a `merge(filterChange, sortChange, pageChange)` pipeline → `debounceTime(300)` → `switchMap(() => remoteSource().fetchData(sortState, pageState, filterQuery))`.
   - On result: dispatches `store.dispatch(urlStateActions.setPaginator({ ..., params: { pageIndex, pageSize } }))` with `result.totalCount`; sets an internal signal that overrides `renderedRows` for the remote case.
   - On error: sets `state` signal to `'http_error'`.
3. `isRemote` should now be `computed(() => !!this.remoteSource())` instead of a boolean field.
4. Remove `if (this.dataSource instanceof IbTableRemoteDataSource)` block from `ngOnInit`.
5. Expose a `refresh()` method on `IbTable` that re-triggers the remote fetch (if `remoteSource()` is set).

**Constraints:**
- Do not touch the `@Input() dataSource` path yet.
- Remote pipeline must use the plain `IbSortState`/`IbPageState` types (no `MatSort`/`MatPaginator` instances passed to `fetchData()`).
- `state` signal (loading/idle/error) must be set correctly in the remote pipeline.

**Validation:**
- `npm run lint` passes.
- `grep "instanceof IbTableRemoteDataSource" src/app/inobeta-ui/ui/kai-table/table.component.ts` returns zero matches.
- `grep "remoteSource" src/app/inobeta-ui/ui/kai-table/table.component.ts` has matches.

**Stop condition:** If wiring the remote pipeline requires changes to `store/url-state/actions.ts` (e.g., new action), stop and request a plan update before adding actions.

---

~~~
## TASK:
Add a `remoteSource` input to `IbTable` that accepts an `IbRemoteFetchStrategy` service and
drives the rendered rows via a remote fetch pipeline. Remove the `instanceof` check.

## CONTEXT:
Repo: inobeta-ui. File: `src/app/inobeta-ui/ui/kai-table/table.component.ts`.
`IbRemoteFetchStrategy<T,V>` is defined in `remote-strategy.ts` (Step 2 output).
The current `instanceof IbTableRemoteDataSource` check in `ngOnInit` initialises the `isRemote`
flag and subscribes to `_state`. This must be replaced.

## OBJECTIVE:
`IbTable` accepts `[remoteSource]="myFetchService"`. When set, it manages the fetch lifecycle
internally (debounce, switchMap, loading state) and feeds results into `renderedRows`.

## REQUIREMENTS:
1. Add `remoteSource = input<IbRemoteFetchStrategy<unknown, unknown>>()`.
2. Add reactive `effect()` that: combines sort/filter/page signals → `debounceTime(300)` →
   `switchMap(() => remoteSource().fetchData(sortState, pageState, filterQuery))`.
3. On success: update a private `_remoteRows = signal<unknown[]>([])` and set state to `'idle'`.
   Dispatch paginator action with `result.totalCount`.
4. On error: set state to `'http_error'`; return `of([])`.
5. `renderedRows` must use `_remoteRows` when `remoteSource()` is truthy, else use the
   client-side computed pipeline from Step 3.
6. Replace `isRemote: boolean = false` with `isRemote = computed(() => !!this.remoteSource())`.
7. Remove `if (this.dataSource instanceof IbTableRemoteDataSource)` block from `ngOnInit`.
8. Add `refresh()` method: if `remoteSource()` is set, emit on a private `Subject<void>` that
   merges into the fetch pipeline as an additional trigger.

## CONSTRAINTS:
- Pass `IbSortState` and `IbPageState` (plain objects) to `fetchData()`, NOT `MatSort`/`MatPaginator` instances.
- Do not touch files outside `table.component.ts`.
- Do not remove `@Input() dataSource` yet.

## OUTPUT:
Updated `table.component.ts`.

## ACCEPTANCE CRITERIA:
- `grep "instanceof IbTableRemoteDataSource" src/app/inobeta-ui/ui/kai-table/table.component.ts` returns 0.
- `grep "remoteSource" src/app/inobeta-ui/ui/kai-table/table.component.ts` returns ≥ 3 matches.
- `npm run lint` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Decouple `IbColumn` from `_table.dataSource` for aggregation [CHAIN-B]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/columns/column.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts` (add aggregation signals + Subject)
- `src/app/inobeta-ui/ui/kai-table/tokens.ts` (tighten `IB_TABLE` token type)

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/cells.ts`

**Objective:** Remove all `_table.dataSource.*` accesses from `IbColumn`. Aggregation state
(`aggregatedColumns`, `aggregatedData`) is now owned by `IbTable` as signals; `IbColumn`
reads through the `IB_TABLE` token.

**Key requirements:**
1. Move `aggregatedData: Record<string, IbAggregateResult> = {}`,
   `aggregatedColumns: Record<string, string> = {}`, and
   `aggregate = new Subject<{ columnName: string; function: string }>()` from
   `IbTableDataSource` to `IbTable`.
2. Also move `aggregationFunctions = inject(IB_AGGREGATE)` to `IbTable`.
3. In `IbTable`, subscribe to `aggregate` Subject internally and update `aggregatedData`/`aggregatedColumns` + dispatch `urlStateActions.setAggregatedColumns`.
4. Update `IbColumn.aggregationFunction` getter: replace `this._table.dataSource.aggregatedColumns?.[this.name]` with `this._table.aggregatedColumns?.[this.name]`.
5. Update `IbColumn.aggregatedData` getter: replace `this._table.dataSource.aggregatedData[this.name]` with `this._table.aggregatedData[this.name]`.
6. Update `IbColumn.handleAggregationChange()`: replace `this._table.dataSource.aggregate.next(...)` with `this._table.aggregate.next(...)`.
7. Update `IB_TABLE` token type in `tokens.ts` from `InjectionToken<any>` to
   `InjectionToken<IbTableAggregationContext>` where `IbTableAggregationContext` is a minimal interface exposing just what `IbColumn` needs.

**Constraints:**
- Do not change `IbColumn`'s public `@Input()` API.
- Keep `_table.matTable` and `_table.sort` accesses in `IbColumn` — those are still valid.
- Do not remove `IbTableDataSource` yet.

**Validation:**
- `grep "_table.dataSource" src/app/inobeta-ui/ui/kai-table/columns/column.ts` returns 0.
- `npm run lint` passes.

**Stop condition:** If `IbTableAggregationContext` interface creates circular import issues, use `any` for the token type and leave a `// TODO: tighten token type` comment.

---

~~~
## TASK:
Remove all `_table.dataSource.*` accesses from `IbColumn`. Move aggregation state and the
`aggregate` Subject to `IbTable`. Update `IbColumn` to read aggregation state from `_table` directly.

## CONTEXT:
Repo: inobeta-ui.
- `column.ts`: `IbColumn` reads `_table.dataSource.aggregatedColumns`, `.aggregatedData`, and calls `_table.dataSource.aggregate.next(...)`.
- `table.component.ts`: `IbTable` owns the table — must now expose aggregation state.
- `tokens.ts`: `IB_TABLE = new InjectionToken<any>("IbTable")` — loosely typed.
`IbAggregateResult` is defined in `cells.ts`.

## OBJECTIVE:
`IbColumn` reads aggregation state from `this._table.aggregatedData[name]` and
`this._table.aggregatedColumns[name]` directly on `IbTable`. No more `_table.dataSource.*`.

## REQUIREMENTS:
1. In `table.component.ts`: add `aggregatedData: Record<string, IbAggregateResult> = {}`,
   `aggregatedColumns: Record<string, string> = {}`, `aggregate = new Subject<{ columnName: string; function: string }>()`, and `aggregationFunctions = inject(IB_AGGREGATE)`.
2. In `table.component.ts`: subscribe to `this.aggregate` (in `ngOnInit` or constructor) to update `aggregatedColumns[columnName]`, dispatch `urlStateActions.setAggregatedColumns`, and call `_aggregateData`/`_aggregatePaginatedData` equivalent logic.
3. In `column.ts`: replace:
   - `this._table.dataSource.aggregatedColumns?.[this.name]` → `this._table.aggregatedColumns?.[this.name]`
   - `this._table.dataSource.aggregatedData[this.name]` → `this._table.aggregatedData[this.name]`
   - `this._table.dataSource.aggregate.next(...)` → `this._table.aggregate.next(...)`
4. In `tokens.ts`: optionally narrow `InjectionToken<any>` to a minimal interface type that
   includes `matTable`, `sort`, `aggregatedData`, `aggregatedColumns`, `aggregate`.

## CONSTRAINTS:
- Do not modify `IbColumn`'s `@Input()` API.
- Do not remove `IbTableDataSource` from the codebase yet.
- Do not touch files outside `column.ts`, `table.component.ts`, and `tokens.ts`.

## OUTPUT:
Updated `column.ts`, `table.component.ts`, `tokens.ts`.

## ACCEPTANCE CRITERIA:
- `grep "_table\.dataSource" src/app/inobeta-ui/ui/kai-table/columns/column.ts` returns 0.
- `npm run lint` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Adapt `IbKaiTableMobileComponent`: drop `connect()` subscription [CHAIN-B]

**Target executor:** `kai-table-mobile-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html` (update bindings to mobile)

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/table.component.ts` (for `renderedRows` signal and `sortState` signal added in Step 3)

**Objective:** `IbKaiTableMobileComponent` receives rendered rows via `data = input<T[]>([])`
from `IbTable`'s template. Remove the `datasource.connect()` subscription entirely.

**Key requirements:**
1. Remove `dataSource = input<IbTableDataSource<any>>()` from `IbKaiTableMobileComponent`.
2. Add `data = input<any[]>([])` if not already present (it already exists as a signal; change its source).
3. Remove the constructor `effect()` that calls `datasource.connect()` — replace the `data.set(...)` call with the direct input.
4. Remove `datasourceConnection: Subscription | null` and `ngOnDestroy` teardown for it.
5. For `currentSort`: expose a `currentSort = input<{ active: string; direction: ... } | null>(null)` and remove the internal derivation from `datasource.sort`.
6. In `table.component.html`: update `ib-kai-table-mobile` bindings:
   - Replace `[dataSource]="dataSource"` with `[data]="renderedRows()"`.
   - Add `[currentSort]="sortState()"` (where `sortState` is the sort signal from Step 3).
7. Update `sortUpdate()` in `IbKaiTableMobileComponent` to not reference `this.dataSource()`.

**Constraints:**
- Do not touch desktop table files outside `table.component.html`.
- The mobile component must remain `standalone: true`.
- Do not change `IbKaiTableMobileComponent`'s other inputs (`state`, `columns`, `filters`, etc.).

**Validation:**
- `grep "datasource\.connect\|dataSource\.connect" src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts` returns 0.
- `grep "datasourceConnection" src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts` returns 0.
- `npm run lint` passes.

**Stop condition:** If `sortUpdate()` references `this.dataSource()` for sort state, refactor to use the `currentSort` input. Report any other uses of `this.dataSource()` before removing it.

---

~~~
## TASK:
Remove the `dataSource` input and `datasource.connect()` subscription from `IbKaiTableMobileComponent`.
Feed data via a direct `data = input<any[]>([])` and `currentSort = input<...>()` instead.
Update `table.component.html` bindings accordingly.

## CONTEXT:
Repo: inobeta-ui.
- `table-mobile.component.ts`: constructor has an `effect()` that calls `datasource.connect().asObservable().subscribe(data => { this.data.set(data); ... })`.
- `table.component.html`: passes `[dataSource]="dataSource"` to `ib-kai-table-mobile`.
- After Step 3: `IbTable` has a `renderedRows: Signal<unknown[]>` and a `sortState` signal.

## OBJECTIVE:
`IbKaiTableMobileComponent` receives rows as `data = input<any[]>([])` and sort as
`currentSort = input<...>()`. No `connect()` call, no datasource subscription.

## REQUIREMENTS:
1. Remove `dataSource = input<IbTableDataSource<any>>()` from `IbKaiTableMobileComponent`.
2. Keep `data = signal<any[]>([])` but convert it to `data = input<any[]>([])` so the
   parent can push values without imperative subscription.
3. Remove the constructor `effect()` block that subscribed to `datasource.connect()`.
4. Remove `datasourceConnection: Subscription | null` field and its teardown.
5. Add `currentSort = input<{ active: string; direction: 'asc' | 'desc' } | null>(null)`.
6. In `sortUpdate()`: use `this.currentSort()` instead of `this.dataSource().sort`.
7. In `table.component.html`: replace `[dataSource]="dataSource"` with `[data]="renderedRows()"` and add `[currentSort]="sortState()"` for the `ib-kai-table-mobile` element.

## CONSTRAINTS:
- Edit only `table-mobile.component.ts` and `table.component.html`.
- Do not change other `input()` bindings on `ib-kai-table-mobile`.
- Component must remain `standalone: true`.

## OUTPUT:
Updated `table-mobile.component.ts` and `table.component.html`.

## ACCEPTANCE CRITERIA:
- `grep "datasource\.connect\|dataSource\.connect\|datasourceConnection" src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts` returns 0.
- `grep "\[data\]=\"renderedRows" src/app/inobeta-ui/ui/kai-table/table.component.html` returns a match.
- `npm run lint` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Decouple `IbDataExportService` from `IbTableDataSource` [CHAIN-B]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/data-export/data-export.service.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts` (update `doExport()`)

**Read-only reference:**
- `src/app/inobeta-ui/ui/data-export/data-export.service.ts` (current `_exportFromTable`)
- `src/app/inobeta-ui/ui/kai-table/columns/column.ts`

**Objective:** `IbDataExportService._exportFromTable` must no longer accept or reference
`IbTableDataSource`. `IbTable.doExport()` pre-computes the correct dataset and passes
a plain data context to the service.

**Key requirements:**
1. Define a new type in `data-export.service.ts`:
   ```typescript
   export type IbTableExportContext = {
     filteredData: unknown[];
     selectedData: unknown[];
     sortedColumns: IbColumn<unknown>[];
     orderData: (data: unknown[]) => unknown[];
     pageData: (data: unknown[]) => unknown[];
   }
   ```
2. Change `_exportFromTable(tableName, dataSource, settings)` signature to
   `_exportFromTable(tableName, context: IbTableExportContext, settings)`.
   Internal logic stays the same — it reads from `context` instead of `dataSource`.
3. Remove the `import { IbTableDataSource }` from `data-export.service.ts`.
4. In `IbTable.doExport()`, build the `IbTableExportContext` from signals/fields and call
   `this.exportService._exportFromTable(this.tableName, context, settings)`.

**Constraints:**
- Do not change `IbDataExportService.export()` (the public method).
- Do not change the export dialog component.
- Touch only `data-export.service.ts` and `table.component.ts`.

**Validation:**
- `grep "IbTableDataSource" src/app/inobeta-ui/ui/data-export/data-export.service.ts` returns 0.
- `npm run lint` passes.

**Stop condition:** If `IbTableExportContext` requires circular imports, define it in a separate `export-context.ts` file inside `data-export/` and import from there.

---

~~~
## TASK:
Remove the `IbTableDataSource` dependency from `IbDataExportService`. Define an
`IbTableExportContext` type and update `_exportFromTable` to accept it. Update `IbTable.doExport()`.

## CONTEXT:
Repo: inobeta-ui.
- `data-export.service.ts` method `_exportFromTable(tableName, dataSource: IbTableDataSource<unknown>, settings)` reads `dataSource.filteredData`, `dataSource.sortedColumns`, `dataSource._orderData()`, `dataSource._pageData()`, `dataSource.selectionColumn?.selection.selected`.
- `table.component.ts` calls `this.exportService._exportFromTable(this.tableName, this.dataSource, settings)`.

## OBJECTIVE:
`IbDataExportService._exportFromTable` accepts a plain `IbTableExportContext` object instead
of an `IbTableDataSource` instance. `IbTable.doExport()` assembles this context from its own state.

## REQUIREMENTS:
1. Add type `IbTableExportContext` in `data-export.service.ts` (see fields above).
2. Update `_exportFromTable` signature to use `IbTableExportContext`.
3. Remove `import { IbTableDataSource } from ...` from the service file.
4. In `IbTable.doExport()`: build `IbTableExportContext` from `this._filteredData`,
   `this._sortedColumns`, `this.selectionColumn`, and the sort/page pure functions.
   Call `_exportFromTable(this.tableName, context, settings)`.

## CONSTRAINTS:
- Do not modify `IbDataExportService.export()`.
- Do not modify the export dialog.
- Edit only `data-export.service.ts` and `table.component.ts`.

## OUTPUT:
Updated `data-export.service.ts` and `table.component.ts`.

## ACCEPTANCE CRITERIA:
- `grep "IbTableDataSource" src/app/inobeta-ui/ui/data-export/data-export.service.ts` returns 0.
- `grep "IbTableExportContext" src/app/inobeta-ui/ui/data-export/data-export.service.ts` returns ≥ 1.
- `npm run lint` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Remove `IbTableDataSource` + `IbTableRemoteDataSource`; update public API [CHAIN-B END]

**Target executor:** `kai-table-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table-data-source.ts` (delete)
- `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts` (delete)
- `src/app/inobeta-ui/ui/kai-table/index.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.module.ts` (remove lingering imports if any)

**Read-only reference:**
- `public_api.ts` (do NOT modify; already re-exports via `ui/kai-table/index.ts`)

**Objective:** Delete the two legacy datasource files. Clean up all imports. Verify the
library barrel (`index.ts`) exports only the new symbols. Ensure `public_api.ts` no longer
transitively exports `IbTableDataSource` or `IbTableRemoteDataSource`.

**Key requirements:**
1. Delete `table-data-source.ts`. If any pure utility functions were left there (filter/sort/paginate), move them to an internal `table-pipeline.utils.ts` file first — do not export that file from the barrel.
2. Delete `remote-data-source.ts`. Ensure `IbFetchDataResponse` stays exported (it is re-exported from `remote-strategy.ts` per Step 2).
3. In `index.ts`: remove `export * from "./table-data-source"` and `export * from "./remote-data-source"`. Confirm `IbRemoteFetchStrategy`, `IbSortState`, `IbPageState`, `IbFetchDataResponse` are exported (via `remote-strategy.ts`).
4. Remove `import { IbTableDataSource }` and `import { IbTableRemoteDataSource }` from `table.component.ts` (these should now be unused after Steps 3–7).
5. Ensure `public_api.ts` does NOT export `IbTableDataSource` or `IbTableRemoteDataSource` (they are no longer in the barrel).

**Constraints:**
- Do NOT remove `IbFetchDataResponse` from the public API.
- Do NOT modify `public_api.ts` directly — it re-exports via `ui/kai-table/index.ts`.
- Do not remove `urlStateActions`, `ibTableSelectUrlState`, or other store exports.

**Validation:**
- `npm run test-ci` passes (this is the **first full test run** after the Chain-B steps complete).
- `grep -r "IbTableDataSource\|IbTableRemoteDataSource" src/app/inobeta-ui/` returns 0.
- `npm run packagr` succeeds (library build).

**Stop condition:** If `npm run test-ci` fails on unrelated tests, fix compilation errors only. Do not rewrite unrelated tests — flag them for Step 10.

---

~~~
## TASK:
Delete `table-data-source.ts` and `remote-data-source.ts`. Clean up all imports. Verify the
public API no longer exports `IbTableDataSource` or `IbTableRemoteDataSource`.

## CONTEXT:
Repo: inobeta-ui. This is the final step of the Chain-B compile group (Steps 3–8). All prior
chain steps must be complete. After this step the build must compile and `npm run test-ci` must pass.

`IbFetchDataResponse` is re-exported from `remote-strategy.ts` (Step 2). Pure pipeline utilities
may have been moved to a `table-pipeline.utils.ts` internal file in Step 3.

## OBJECTIVE:
Both legacy datasource files are deleted. No remaining import references them. Public API
exports `IbRemoteFetchStrategy`, `IbSortState`, `IbPageState`, `IbFetchDataResponse` and all
prior store/selector symbols. `npm run test-ci` passes.

## REQUIREMENTS:
1. Delete `table-data-source.ts` (move any remaining pure utility functions to `table-pipeline.utils.ts` first — do NOT export from barrel).
2. Delete `remote-data-source.ts` (confirm `IbFetchDataResponse` is already re-exported via `remote-strategy.ts`).
3. Remove `export * from "./table-data-source"` and `export * from "./remote-data-source"` from `index.ts`.
4. Scan for any remaining `import ... from './table-data-source'` or `from './remote-data-source'` across all library files; fix each.
5. Run `npm run test-ci`; fix compilation errors. Flag test logic failures for Step 10.

## CONSTRAINTS:
- Do NOT modify `public_api.ts`.
- Do NOT remove `IbFetchDataResponse`, `urlStateActions`, or selector exports.
- Do not rewrite spec logic — only fix compilation errors in spec files.

## OUTPUT:
- Deleted files.
- Updated `index.ts`.
- Passing `npm run test-ci` (compilation only; spec logic issues flagged for Step 10).

## ACCEPTANCE CRITERIA:
- `grep -r "IbTableDataSource\|IbTableRemoteDataSource" src/app/inobeta-ui/` returns 0.
- `npm run test-ci` exits 0.
- `npm run packagr` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 9 — Update demo examples [DEPENDS ON STEP 8]

**Target executor:** `examples-executor`

**Allowed files:**
- `src/app/examples/kai-table-example/server-side/github-data-source.ts`
- `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts`
- `src/app/examples/kai-table-example/kai-table-datasource-example.ts`

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/remote-strategy.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`

**Objective:** Migrate the `GithubDataSource` class from `extends IbTableRemoteDataSource`
to `implements IbRemoteFetchStrategy`. Update the example components.

**Key requirements:**
1. Convert `GithubDataSource` to:
   ```typescript
   @Injectable()
   export class GithubFetchService implements IbRemoteFetchStrategy<GithubIssue, GithubApiQueryFilter> {
     private http = inject(HttpClient);
     fetchData(sort: IbSortState, page: IbPageState, filter?: GithubApiQueryFilter): Observable<IbFetchDataResponse<GithubIssue>> { ... }
   }
   ```
2. `fetchData` receives `IbSortState`/`IbPageState` (plain objects) — no longer `MatSort`/`MatPaginator`.
3. In `kai-table-api-example.ts`: provide `GithubFetchService`, inject it, use `[remoteSource]="githubFetchService"`. Remove `dataSource = new GithubDataSource()`. Remove `simulateError()` or adapt it.
4. `kai-table-datasource-example.ts`: `IbTableDataSource` no longer exists — convert to `[data]="data"` binding with a plain array. Keep the `refresh()` behaviour by replacing the data signal/array.

**Constraints:**
- No changes to library source files.
- Keep example intent the same (show remote data, show refresh, show simulated error).

**Validation:**
- `npm run build` (demo app) passes.
- `grep "IbTableDataSource\|IbTableRemoteDataSource" src/app/examples/` returns 0.

**Stop condition:** If `simulateError()` depends on internal `IbTableRemoteDataSource` state that no longer exists, simplify it to a stub that sets a visible error message.

---

~~~
## TASK:
Migrate the GithubDataSource example from `extends IbTableRemoteDataSource` to a plain
`@Injectable()` service implementing `IbRemoteFetchStrategy`. Update example components.

## CONTEXT:
Repo: inobeta-ui demo app under `src/app/examples/`.
- `github-data-source.ts`: `class GithubDataSource extends IbTableRemoteDataSource<GithubIssue, GithubApiQueryFilter>` — after Step 8, this class is invalid.
- `kai-table-api-example.ts`: uses `new GithubDataSource()` and `[dataSource]="dataSource"`.
- `kai-table-datasource-example.ts`: uses `new IbTableDataSource(...)` — class is deleted.
- `IbRemoteFetchStrategy`, `IbSortState`, `IbPageState` are now exported from public_api.

## OBJECTIVE:
All example files compile and run correctly with the new API.

## REQUIREMENTS:
1. Rewrite `github-data-source.ts` as an `@Injectable()` service implementing `IbRemoteFetchStrategy`. Method `fetchData(sort: IbSortState, page: IbPageState, filter?)` extracts page/sort as plain values.
2. In `kai-table-api-example.ts`: inject `GithubFetchService`, use `[remoteSource]="githubFetchService"`. Expose `refresh()` by calling a method if `IbTable` exposes a `refresh()` method (check template ref or service). Adapt `simulateError()` to call `href` mutation on the service.
3. In `kai-table-datasource-example.ts`: replace `new IbTableDataSource(...)` with a plain array `data: IbUserExample[]`. Use `[data]="data"` binding. Keep `refresh()` behaviour.

## CONSTRAINTS:
- Do not modify library source files.
- Keep all example templates functional and compilable.

## OUTPUT:
Updated example files.

## ACCEPTANCE CRITERIA:
- `grep "IbTableDataSource\|IbTableRemoteDataSource" src/app/examples/` returns 0.
- `npm run build` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 10 — Rewrite `table.component.spec.ts` [DEPENDS ON STEP 8]

**Target executor:** `unit-jasmine-executor`

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`

**Read-only reference:**
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/remote-strategy.ts`
- `src/app/inobeta-ui/ui/kai-table/store/url-state/actions.ts`

**Objective:** Rewrite the spec to cover the new `IbTable` architecture. Replace all
`IbTableDataSource` / `IbTableRemoteDataSource` usages with the new API.

**Key requirements:**
1. Remove `IbTestDataSource extends IbTableRemoteDataSource` stub. Replace with a spy service:
   ```typescript
   @Injectable()
   class MockFetchService implements IbRemoteFetchStrategy<any> {
     fetchData = jasmine.createSpy('fetchData').and.returnValue(timer(1).pipe(map(() => ({ data: [{ name: 'alice' }], totalCount: 1 }))));
   }
   ```
2. In the "with IbRemoteTableDataSource" describe block: use `[remoteSource]="fetchService"` instead of `[dataSource]="dataSource"`. The `dataSource.state` check changes to `component.state === 'idle'`.
3. Test "should show error on exception": spy `fetchService.fetchData` to throw; call `component.refresh()`.
4. In "with IbTableDataSource" tests: replace any `component.dataSource.*` assertions with the signal/selector equivalent.
5. In "with sort": replace `dataSource._orderData(dataSource.filteredData)` assertions with equivalent data checks on `component.renderedRows()` (if exposed) or via `MatTableHarness` row count.
6. In "with aggregate": assertion `ibAggregate.result.currentPage` can remain if `IbAggregateCell` still reads from `IbTable` signals. Verify and adjust.
7. Remove `IbTableWithViewGroupApp` fixture (view group was already removed per earlier comments in the spec).
8. Maintain ≥ 80% coverage on `table.component.ts`.

**Constraints:**
- Do not add `fdescribe` or `fit`.
- Do not modify library source files.
- Use `NoopAnimationsModule`, `TranslateModule.forRoot()`, `provideMockStore()`, `RouterTestingModule` as before.

**Validation:**
- `ng test --include='**/kai-table/table.component.spec.ts' --watch=false` passes.
- `npm run test-ci` exits 0.

**Stop condition:** If `component.renderedRows` is not accessible from the test (private signal), test data correctness via `MatTableHarness` row assertions instead. Do not change signal visibility for test purposes.

---

~~~
## TASK:
Rewrite `table.component.spec.ts` to cover the new `IbTable` architecture after removal of
`IbTableDataSource` and `IbTableRemoteDataSource`.

## CONTEXT:
Repo: inobeta-ui. File: `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`.
After Steps 3–8, `IbTable` uses signals and `renderedRows`, accepts `[remoteSource]` input.
`IbTableRemoteDataSource` and `IbTableDataSource` no longer exist.

## OBJECTIVE:
All spec suites pass. Remote case uses `MockFetchService implements IbRemoteFetchStrategy`.
Coverage ≥ 80% on `table.component.ts`.

## REQUIREMENTS:
1. Replace `IbTestDataSource extends IbTableRemoteDataSource` with `MockFetchService implements IbRemoteFetchStrategy<any>` (spy-based).
2. Replace `[dataSource]="dataSource"` with `[remoteSource]="fetchService"` in the remote test fixture template. Provide `MockFetchService` in the test module.
3. Fix "should show error on exception" test: spy on `fetchService.fetchData` to return `throwError(() => new Error())`. Call `component.refresh()`.
4. In sort tests: assert data order via `MatTableHarness` row content rather than `dataSource._orderData()`.
5. In aggregate tests: assert `ibAggregate.result.currentPage` as before if the column still exposes it; if the data path changed, trace the new path via `IbTable` injection.
6. Remove `IbTableWithViewGroupApp` fixture.
7. Ensure `TestBed` setup uses `provideMockStore` with `{ ibKaiTable: { tables: [] } }` initial state.

## CONSTRAINTS:
- Do not use `fdescribe` or `fit`.
- Do not modify library source files.
- Do not cast to `any` to bypass type checks — use proper types.

## OUTPUT:
Updated `table.component.spec.ts`.

## ACCEPTANCE CRITERIA:
- `ng test --include='**/kai-table/table.component.spec.ts' --watch=false` exits 0.
- `npm run test-ci` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

| File / Symbol | Change |
|---|---|
| `table-data-source.ts` | **Deleted** |
| `remote-data-source.ts` | **Deleted** (IbFetchDataResponse re-exported from `remote-strategy.ts`) |
| `remote-strategy.ts` | **New** — `IbRemoteFetchStrategy<T,V>`, `IbSortState`, `IbPageState` |
| `store/index.ts` | Remove `IKaiTableStore`, `kaiTableReducers` |
| `table.component.ts` | Major refactor: signals, redux-first dispatch, `remoteSource` input, aggregation ownership, export decoupling |
| `table.component.html` | `[dataSource]="renderedRows()"`, updated mobile bindings |
| `columns/column.ts` | Replace `_table.dataSource.*` with `_table.*` |
| `tokens.ts` | Tighten `IB_TABLE` token type |
| `table-mobile.component.ts` | Remove `dataSource` input and `connect()` subscription; add `data` and `currentSort` inputs |
| `data-export.service.ts` | `IbTableExportContext` replaces `IbTableDataSource` parameter |
| `kai-table/index.ts` | Add `remote-strategy.ts` export; remove datasource exports |
| **Public API — removed:** | `IbTableDataSource`, `IbTableRemoteDataSource`, `IKaiTableStore` |
| **Public API — added:** | `IbRemoteFetchStrategy<T,V>`, `IbSortState`, `IbPageState` |
| **Public API — unchanged:** | `IbFetchDataResponse<T>`, `IbKaiTableState`, `urlStateActions`, `ibTableSelectUrlState`, `ibTableSelectLastQueryString*`, `selectTables` |

---

## 7. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Breaking change**: every consumer using `new IbTableDataSource(data)` breaks | High | Plan documents migration: convert to `[data]` binding |
| **Breaking change**: every `extends IbTableRemoteDataSource` subclass breaks | High | Documented: rewrite as `@Injectable() implements IbRemoteFetchStrategy` |
| Steps 3–8 compile-chain: intermediate build failures during development | Medium | Work all six steps in one branch before pushing; run `ng build --configuration=development` after each step |
| Reactive cycle: paginator `page` event fires when `pageIndex` is written by `effect()` | Medium | Always use `untracked()` for paginator property writes in `effect()`; verify no infinite loop in test |
| `inject(IB_AGGREGATE)` moves to `IbTable` — injection context | Low | `IbTable` is an Angular component; all `inject()` calls are valid in its constructor |
| `IbColumn` reads from `IB_TABLE` — optional injection; null guard needed | Low | `inject(IB_TABLE, { optional: true })` already in place; add null checks for new fields |
| `renderedRows` computed runs full pipeline on every signal change — performance | Medium | Use `computed()` efficiently; avoid triggering on unrelated signal writes via `untracked()` where appropriate |
| Export spec `xit("should export current page")` remains skipped | Low | Already skipped with comment; leave it — not regression |

---

## 8. Validation Checklist

- [ ] `npm run lint` — passes after each step
- [ ] `ng build --configuration=development` — passes after each Chain-B step
- [ ] `npm run test-ci` — must pass after Step 8 (with compilation fixes) and fully after Step 10
- [ ] `npm run packagr` — passes after Step 8
- [ ] `npm run build` (demo app) — passes after Step 9
- [ ] `grep -r "IbTableDataSource\|IbTableRemoteDataSource" src/` returns 0 after Step 8
- [ ] `grep -r "kaiTableReducers\|IKaiTableStore" src/` returns 0 after Step 1
- [ ] Manual smoke: demo app renders table with data, sort, filter, paginator working
- [ ] Manual smoke: GitHub issues remote example renders with loading state and refresh
- [ ] Manual smoke: mobile view renders cards from the same data as desktop
- [ ] Manual smoke: export dialog downloads filtered/sorted data correctly
- [ ] Manual smoke: aggregate footer shows sum/average correctly

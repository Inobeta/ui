# DEVK-1066 — Kai Table migration

This guide covers the breaking changes introduced by the DEVK-1066 Kai Table
refactor. Migrate consumers directly to the signal-based API; the former
decorator properties do not have deprecation adapters.

## Signals: TypeScript access

The public template names remain usable as bindings, but signal inputs must be
read as functions in TypeScript:

```ts
// Before
table.tableName;
table.displayedColumns;

// After
table.tableName();
table.displayedColumns();
```

The canonical signal queries are `__matTable()`, `__sort()`, and
`__paginator()`. The old `matTable`, `sort`, and `paginator` getters are only
compatibility accessors and are deprecated.

There is no implemented table-level `rowClicked` or `ibRowClicked` output.
Do not add a migration for it. Selection uses
`IbSelectionColumn.ibRowSelectionChange`.

## Initialization precedence

`tableName` is required and must be unique on the page. It scopes table state,
URL state, views, selection, and exports.

Initial state is resolved per field in this order:

1. Explicit URL field
2. URL view snapshot
3. `tableDef.initial*`
4. Technical default: `sort`, `filters`, and `selectedView` are `null`,
   `pageIndex` is `0`, and `pageSize` is `20`

Supported `tableDef` fields are `initialSort`, `initialFilters`, `initialView`,
`initialPageIndex`, `initialPageSize`, and `initialAggregatedColumns`.
`initialView` identifies the initial view snapshot. An absent field leaves lower
priority state untouched; `null` explicitly clears it. For page fields, null
resolves to the technical defaults.

## Data sources

`[data]` and `[dataSource]` are mutually exclusive. `[data]` creates a managed
local source. For explicit local-source control use:

```ts
dataSource = new IbTableLocalDataSource<Row>(rows);
```

`IbTableLocalDataSource` replaces the old local Material data-source workflow
and accepts value-object state through `setInput`. It exposes typed filtering,
sorting, pagination, and aggregation state.

`IbTableDataSource` remains only as a deprecated compatibility bridge for its
legacy Material-control API. It does not mean that arbitrary generic
`MatTableDataSource` instances are supported.

For remote data, extend `IbTableRemoteDataSource<T, V>` and implement:

```ts
fetchData(request: IbRemoteDataSourceRequest<V>)
  : Observable<IbFetchDataResponse<T>>
```

The request has `sort`, `pageIndex`, `pageSize`, and `filter`; the response has
`data` and `totalCount`. Configure `filterDebounceMs` through the constructor
(500 ms by default). Requests are cancellable and newer requests supersede
older ones. Remote export-all, global aggregation, and remote selection are
outside the implemented contract.

## URL

The writer stores a v2 JSON payload under the unique `tableName` key:

```json
{"v":2,"f":null,"sv":null,"pi":0,"ps":20,"ac":null,"so":null}
```

The v2 fields are filters (`f`), selected view (`sv`), page index (`pi`), page
size (`ps`), aggregations (`ac`), and sort (`so`). Null is meaningful: it is an
explicit clear, not an omitted value. The writer never emits the old
`__ibTableView__all` sentinel.

For existing links, the reader accepts legacy v1 fields
`ibfilter`, `ibview`, `ibpage`, `ibpagesize`, `ibaggregatedcolumns`, and
`ibsort`; `ibview: "__ibTableView__all"` becomes `view: null`. Malformed URL
payloads are ignored.

## Breaking changes checklist

- Add a unique required `tableName` to every table.
- Replace old decorator-property TypeScript reads with signal calls.
- Replace `items` / generic data-source usage with `[data]` or an explicit
  `IbTableLocalDataSource` / `IbTableRemoteDataSource`.
- Replace remote `fetchData(MatSort, MatPaginator, filter)` with
  `fetchData(request)`.
- Move initial state to `tableDef.initial*` and respect absent versus `null`.
- Do not use `ibRowClicked`; no such output is implemented.
- Use selection-column output for row selection.
- Do not promise remote export, global aggregation, mobile behavior, or generic
  `MatTableDataSource` support beyond the contracts described above.

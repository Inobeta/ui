# Kai Table migration guide

This guide describes the public migration from the 19.0.0 Kai Table API to the
current signal-based API. There is no adapter facade for the former decorator
properties.

## 1. Table inputs and outputs

`tableName` is now a required input. It must be unique for every table on the
page because it scopes table state, URL state, views, selection events, and
exported files.

```html
<ib-kai-table
  tableName="users"
  [data]="users"
  [displayedColumns]="displayedColumns">
</ib-kai-table>
```

Table inputs remain usable with the same template binding names, but they are
signals in TypeScript. Invoke them when reading them programmatically:

```ts
table.tableName();
table.displayedColumns();
table.data();
table.dataSource();
table.tableDef();
table.tableHeight();
```

The Material child queries are also signals: `matTable()`, `sort()`, and
`paginator()`. The former decorator-style query properties and compatibility
getters are not part of the current contract.

The selection and aggregation outputs now use Angular signal output APIs. Their
template names and payloads remain compatible:

- `IbSelectionColumn.ibRowSelectionChange` emits
  `IbTableRowSelectionChange[]`.
- `IbAggregateCell.ibFunctionChange` emits a `string`.

The table itself does not expose a generic row-click output. Do not add or
migrate to `ibRowClicked`; row selection uses the selection-column output.

## 2. Initial state

Initial state belongs in the `tableDef` input. These are `IbTableDef` fields,
not standalone table inputs: `initialSort`, `initialFilters`, `initialView`,
`initialPageIndex`, `initialPageSize`, and `initialAggregatedColumns`.

State is resolved independently for each field in this order, from highest to
lowest priority:

1. Explicit URL field
2. URL view snapshot, resolved from the views provider using the URL `view`
   parameter
3. Initial view snapshot, resolved using `tableDef.initialView`
4. The corresponding `tableDef.initial*` field
5. Technical default: `sort`, `filters`, and `selectedView` are `null`,
   `pageIndex` is `0`, and `pageSize` is `20`

An absent field leaves lower-priority state untouched. `null` is an explicit
clear. A URL payload with `view: null` suppresses both view snapshot layers.

```ts
tableDef: IbTableDef = {
  initialSort: { active: "name", direction: "asc" },
  initialFilters: null,
  initialView: null,
  initialPageIndex: 0,
  initialPageSize: 20,
};
```

## 3. Data sources

`[data]` and `[dataSource]` are mutually exclusive. Use one, never both.

`[data]` is shorthand for a table-managed `IbTableLocalDataSource`. Construct
one explicitly when its typed API or extension points are needed:

```ts
dataSource = new IbTableLocalDataSource<User>(users);
dataSource.setInput({ sort, rawFilter, pageIndex, pageSize });
```

The local source exposes `input`, `filteredData`, `orderedData`,
`currentPageData`, and `aggregatedData`.

For remote data, extend `IbTableRemoteDataSource<T, V>` and implement the
value-object contract:

```ts
fetchData(request: IbRemoteDataSourceRequest<V>)
  : Observable<IbFetchDataResponse<T>>
```

The request contains `sort`, `pageIndex`, `pageSize`, and `filter`; the response
contains `data` and `totalCount`. Configure `filterDebounceMs` in the
constructor when the default 500 ms debounce is not suitable. New requests
cancel older requests.

Remote export-all, global aggregation, and selection are not provided by the
current remote integration.

## 4. Canonical state and URL migration

Read table state with the canonical selectors. `store.selectSignal` returns a
signal, so invoke the returned signal to read its value:

```ts
import {
  selectIbKaiTableSnapshot,
  selectTableSort,
  selectTableFilters,
  selectTablePageIndex,
  selectTablePageSize,
  selectTableSelectedView,
  selectTableAggregatedColumns,
} from "@inobeta/ui";

const snapshot = this.store.selectSignal(
  selectIbKaiTableSnapshot("myTable"),
);
const sort = this.store.selectSignal(selectTableSort("myTable"));

console.log(snapshot());
console.log(sort());
```

The canonical writer emits a v2 payload under the table name:

```json
{"v":2,"f":null,"sv":null,"pi":0,"ps":20,"ac":null,"so":null}
```

The reader accepts legacy v1 fields (`ibfilter`, `ibview`, `ibpage`, `ibpagesize`,
`ibaggregatedcolumns`, and `ibsort`) and maps the legacy all-data sentinel to
`view: null`.

## 5. `tableHeight` migration

`tableHeight` is a new desktop-table input. It defaults to `"parent"` when it
is omitted, empty, or whitespace-only. Parent mode makes the table fill the
available height of its parent; the parent or an ancestor should therefore
have a defined height. Without suitable parent sizing, layout can differ from
the previous row-count-based behavior.

Use an explicit content height when needed:

```html
<ib-kai-table
  tableName="users"
  [data]="users"
  tableHeight="400px">
</ib-kai-table>
```

In parent mode, the content area uses the remaining parent height after the
toolbar, filters, and paginator. In exact mode, a non-empty CSS value controls
the scrollable content area. The table content is the scroll owner; do not add
a second `overflow: auto` wrapper. `tableHeight` does not affect the mobile
component.

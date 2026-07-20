# Kai Table migration guide

This document replaces the pre-DEVK-1066 decorator-era migration notes. The
signal API is the supported API; there is no adapter facade for the old
decorator properties.

## Inputs and outputs

Template bindings keep their usual names, but the component inputs are now
signal inputs. In TypeScript, read them by calling the signal:

```ts
// Before
table.tableName;
table.displayedColumns;

// After
table.tableName();
table.displayedColumns();
```

Use `tableDef` for initial state instead of the former initialization inputs:
`initialSort`, `initialFilters`, `initialView`, `initialPageIndex`,
`initialPageSize`, and `initialAggregatedColumns`.

The table component does not expose a generic row-click output. Do not migrate
code to `ibRowClicked`; it is not part of the implemented API. Row selection
is exposed by `IbSelectionColumn.ibRowSelectionChange`.

For TypeScript access to Material child queries, the canonical properties are
the signal queries `__matTable()`, `__sort()`, and `__paginator()`. The
`matTable`, `sort`, and `paginator` getters exist only for compatibility with
internal child integrations and are deprecated.

## `tableName` is required

`tableName` must be supplied and must be unique for every table on the page.
It scopes NgRx state, URL state, views, selection events, and exported files.

```html
<ib-kai-table
  tableName="users"
  [data]="users"
  [displayedColumns]="displayedColumns">
</ib-kai-table>
```

## Data sources

`[data]` and `[dataSource]` are mutually exclusive. Use one of them, never
both.

### Local data

`[data]` is the shorthand for a table-managed `IbTableLocalDataSource`.
Construct the source explicitly when its typed API or extension points are
needed:

```ts
dataSource = new IbTableLocalDataSource<User>(users);
dataSource.setInput({ sort, rawFilter, pageIndex, pageSize });
```

`IbTableLocalDataSource` owns local filtering, sorting, pagination, and
aggregation. Its relevant state is available through `input`,
`filteredData`, `orderedData`, `currentPageData`, and `aggregatedData`.

`IbTableDataSource` is retained as a compatibility bridge for integrations
using the old Material-control API. It is deprecated and should not be used
for new code. It is not a promise of support for arbitrary
`MatTableDataSource` instances.

### Remote data

Extend `IbTableRemoteDataSource<T, V>` and implement the new value-object
contract:

```ts
fetchData(request: IbRemoteDataSourceRequest<V>)
  : Observable<IbFetchDataResponse<T>>
```

The request contains `sort`, `pageIndex`, `pageSize`, and `filter`; the
response contains `data` and `totalCount`. Set `filterDebounceMs` in the
constructor when the default 500 ms filter debounce is not appropriate.
Remote sources are cancellable: a newer request supersedes an older one.

Remote capabilities are explicit. Remote export-all and global aggregation
are not provided by default, and selection is not supported by the current
remote integration.

## `tableDef` and initialization precedence

State is resolved independently for each field using this order, from highest
to lowest priority:

1. Explicit URL field
2. URL view snapshot
3. `tableDef.initial*` field
4. Technical default (`sort`, `filters`, and `selectedView` are `null`;
   `pageIndex` is `0`; `pageSize` is `20`)

`initialView` is a view ID used to resolve an initial view snapshot. A field
absent from a layer does not override a lower layer. `null` is an explicit
override: for example, `initialFilters: null` clears filters, while
`initialView: null` selects the implicit all-data view.

## URL state

New URL state is written as a v2 payload under the table name:

```json
{"v":2,"f":null,"sv":null,"pi":0,"ps":20,"ac":null,"so":null}
```

The writer always emits v2 and never writes the legacy
`__ibTableView__all` sentinel. The reader still accepts the legacy v1 fields
(`ibfilter`, `ibview`, `ibpage`, `ibpagesize`, `ibaggregatedcolumns`, and
`ibsort`) and maps `__ibTableView__all` to `view: null`.

## Removed or changed legacy options

| Legacy usage | Migration |
| --- | --- |
| `items` | `[data]` or `[dataSource]` |
| `titles` | Column components and `[displayedColumns]` |
| `currentSort` | `tableDef.initialSort` |
| `hasPaginator` | `tableDef.paginator.hide` |
| `hasFooter` | Column aggregation configuration |
| `selectableRows` / `rowChecked` | `IbSelectionColumn` and `ibRowSelectionChange` |
| `hasAdd`, `hasEdit`, `hasDelete`, `actions` | Table action group or action column |
| `hasExport` | Data export action/module |
| `hasConfig` | Table view group / views host |
| `stickyAreas` | Column `sticky` / `stickyEnd` |
| `structureTemplates`, `templateHeaders` | No direct replacement; use supported column/action APIs |
| `deleteConfirm`, `actionsPosition` | No direct replacement |

`enableReduxStore` is not a consumer option in the new contract. Table state
is managed by the table integration; views remain optional.

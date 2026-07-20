import {
  IbTableDef,
  IbKaiTableSnapshot,
  IbKaiTableUrlParams,
  IbKaiTableViewSnapshot,
} from './table.types';

/**
 * Technical defaults applied before any explicit configuration source.
 *
 * These are not configurable — they represent the baseline "no source
 * provided anything" state for every table.
 */
const TECHNICAL_DEFAULTS: IbKaiTableSnapshot = Object.freeze({
  sort: null,
  filters: null,
  selectedView: null,
  pageIndex: 0,
  pageSize: 20,
  aggregatedColumns: Object.freeze({}),
});

/**
 * Resolves the full initial UI state for a single `tableName` by layering
 * configuration sources in a documented precedence chain.
 *
 * ## Precedence (lowest to highest)
 *
 * 1. **Technical defaults** — `pageIndex=0`, `pageSize=20`, everything
 *    else `null` or empty.
 * 2. **`tableDef.initial*`** — static programmatic overrides declared on
 *    the `IbTableDef`.  Only *present* keys are applied; a key set to
 *    `null` represents an explicit clear.
 * 3. **Initial view snapshot** — a view resolved from the views provider
 *    using `tableDef.initialView`.  Applied only when provided.
 * 4. **URL view snapshot** — a view resolved from the views provider
 *    using the `view` param extracted from the URL.  Applied only when
 *    provided.
 * 5. **Explicit URL fields** — individual query-string parameters
 *    (`sort`, `filters`, `pageIndex`, `pageSize`, `aggregatedColumns`,
 *    `view`).  Same "absent vs present-with-null" semantics as layer 2.
 *
 * ## `null` semantics
 *
 * | Field               | `null` on `tableDef.initial*` / URL | `null` in snapshot      |
 * |---------------------|--------------------------------------|-------------------------|
 * | `sort`              | Clear sort                           | No sort active          |
 * | `filters`           | Clear filters                        | No filter applied       |
 * | `selectedView`      | Force "all data" view                | "All data" view         |
 * | `pageIndex`         | Use technical default (0)            | N/A (always resolved)   |
 * | `pageSize`          | Use technical default (20)           | N/A (always resolved)   |
 * | `aggregatedColumns` | Use technical default (`{}`)         | N/A (always resolved)   |
 *
 * ## Purity guarantees
 *
 * - No dependency on Angular components, `@ngrx/store`, `@angular/router`,
 *   or Angular Material runtime.
 * - Always returns a fresh snapshot object (no shared mutable references).
 * - Input objects are never mutated.
 *
 * @returns A fully resolved {@link IbKaiTableSnapshot} ready to be
 *          dispatched to the NgRx store and applied to the UI.
 */
export function resolveInitialTableState(params: {
  tableDef?: IbTableDef | null;
  urlParams?: IbKaiTableUrlParams | null;
  initialViewSnapshot?: IbKaiTableViewSnapshot | null;
  urlViewSnapshot?: IbKaiTableViewSnapshot | null;
}): IbKaiTableSnapshot {
  // Layer 1 — fresh copy of technical defaults
  const result: IbKaiTableSnapshot = {
    sort: TECHNICAL_DEFAULTS.sort,
    filters: TECHNICAL_DEFAULTS.filters,
    selectedView: TECHNICAL_DEFAULTS.selectedView,
    pageIndex: TECHNICAL_DEFAULTS.pageIndex,
    pageSize: TECHNICAL_DEFAULTS.pageSize,
    aggregatedColumns: { ...TECHNICAL_DEFAULTS.aggregatedColumns },
  };

  // Layer 2 — tableDef.initial* fields (only present keys)
  if (params.tableDef) {
    applyIfPresent(params.tableDef, 'initialSort', (v) => { result.sort = v; });
    applyIfPresent(params.tableDef, 'initialFilters', (v) => { result.filters = v; });
    applyIfPresent(params.tableDef, 'initialView', (v) => { result.selectedView = v; });
    applyIfPresent(params.tableDef, 'initialPageIndex', (v) => { result.pageIndex = v ?? TECHNICAL_DEFAULTS.pageIndex; });
    applyIfPresent(params.tableDef, 'initialPageSize', (v) => { result.pageSize = v ?? TECHNICAL_DEFAULTS.pageSize; });
    applyIfPresent(params.tableDef, 'initialAggregatedColumns', (v) => { result.aggregatedColumns = v ?? {}; });
  }

  // Layer 3 — initial view (resolved from views provider)
  applyViewLayer(params.initialViewSnapshot, result);

  // Layer 4 — URL view (resolved from views provider)
  applyViewLayer(params.urlViewSnapshot, result);

  // Layer 5 — explicit URL fields (only present keys)
  if (params.urlParams) {
    applyIfPresent(params.urlParams, 'sort', (v) => { result.sort = v; });
    applyIfPresent(params.urlParams, 'filters', (v) => { result.filters = v; });
    applyIfPresent(params.urlParams, 'view', (v) => { result.selectedView = v; });
    applyIfPresent(params.urlParams, 'pageIndex', (v) => { result.pageIndex = v ?? TECHNICAL_DEFAULTS.pageIndex; });
    applyIfPresent(params.urlParams, 'pageSize', (v) => { result.pageSize = v ?? TECHNICAL_DEFAULTS.pageSize; });
    applyIfPresent(params.urlParams, 'aggregatedColumns', (v) => { result.aggregatedColumns = v ?? {}; });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Applies a value from `source[key]` only when the key **exists** in the
 * source object (distinguishes absent from present-with-null).
 */
function applyIfPresent<K extends string>(
  source: { [P in K]?: unknown },
  key: K,
  setter: (value: any) => void,
): void {
  if (key in source) {
    setter(source[key]);
  }
}

/**
 * Applies a view snapshot layer on top of the already-resolved state.
 *
 * A view is an optional partial snapshot — only keys that are **present**
 * in the snapshot are merged in.  `null` values are resolved per the
 * documented null-semantics table.
 */
function applyViewLayer(
  snapshot: IbKaiTableViewSnapshot | null | undefined,
  target: IbKaiTableSnapshot,
): void {
  if (!snapshot) return;

  if ('sort' in snapshot) {
    target.sort = snapshot.sort!;
  }
  if ('filters' in snapshot) {
    target.filters = snapshot.filters!;
  }
  if ('pageSize' in snapshot) {
    target.pageSize = snapshot.pageSize! ?? TECHNICAL_DEFAULTS.pageSize;
  }
  if ('aggregatedColumns' in snapshot) {
    target.aggregatedColumns = snapshot.aggregatedColumns! ?? {};
  }
}

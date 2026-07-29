import { MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";

export interface IbPaginatorOptions extends MatPaginatorDefaultOptions {
  hide?: boolean;
   //TODO please add support to pageIndex it is overrided by _updatePaginator in table datasource
  pageIndex?: number;
}

/**
 * Raw filter state — the serializable form value captured from
 * {@link IbKaiFilterComponent.selectedCriteria} before it is processed
 * into {@link IbFilterSyntaxExtended}.
 *
 * Persisted in store and URL; each key maps to the raw value of a
 * single filter criterion (string, string[], date range object, etc.).
 */
export type IbTableFilterState = Record<string, unknown>;

/**
 * Canonical snapshot of all table UI state for a single `tableName`.
 *
 * Produced by {@link resolveInitialTableState} and kept in sync with the
 * NgRx store and URL query string.  Every field is always defined; `null`
 * means "no value" (no sort, no filters, default view).
 */
export interface IbKaiTableSnapshot {
  /** Active sort, or `null` when no column is sorted. */
  sort: Sort | null;
  /** Raw form filter values, or `null` when no filter is applied. */
  filters: IbTableFilterState | null;
  /**
   * ID of the active view, or `null` for the implicit "all data" view.
   *
   * A view bundles filter, sort, page size and aggregation settings
   * provided by an {@link IbTableViewsHost} integration.
   */
  selectedView: string | null;
  /** Zero-based page index shown in the paginator. */
  pageIndex: number;
  /** Number of rows per page. */
  pageSize: number;
  /** Active column aggregation functions (column name → aggregate key). */
  aggregatedColumns: Record<string, string>;
}

/**
 * Deserialized per-table URL query-string fields.
 *
 * Every field is optional; a key that is **absent** in the object is
 * ignored by the resolver, while a key that is **present with `null`**
 * represents an explicit clear (overrides previous layers with no value).
 */
export interface IbKaiTableUrlParams {
  sort?: Sort | null;
  filters?: IbTableFilterState | null;
  view?: string | null;
  pageIndex?: number | null;
  pageSize?: number | null;
  aggregatedColumns?: Record<string, string> | null;
}

/**
 * View snapshot resolved from an {@link IbTableViewsHost} provider.
 *
 * Used by the resolver as intermediate layers when a view ID is
 * specified via `IbTableDef.initialView` or the URL `view` param.
 */
export interface IbKaiTableViewSnapshot {
  sort?: Sort | null;
  filters?: IbTableFilterState | null;
  pageSize?: number | null;
  aggregatedColumns?: Record<string, string> | null;
}

/**
 * Declarative table definition consumed by {@link IbKaiTableComponent}.
 *
 * All `initial*` fields follow the same precedence rules:
 * - A key **absent** from the object is ignored (does not override lower layers).
 * - A key **present with `null`** represents an explicit clear:
 *   page/page-size fall back to the technical defaults (0 / 20);
 *   all other fields are stored as `null`.
 */
export interface IbTableDef {
  /** Visual paginator options (hide, page size options, etc.). */
  paginator?: IbPaginatorOptions;
  /** Initial sort column and direction, or `null` to force no sort. */
  initialSort?: Sort | null;
  /** Initial raw filter values, or `null` to force no filters. */
  initialFilters?: IbTableFilterState | null;
  /**
   * ID of the view to activate on first load, or `null` to force the
   * implicit "all data" view.
   */
  initialView?: string | null;
  /** Initial page index, or `null` to use the technical default (0). */
  initialPageIndex?: number | null;
  /** Initial page size, or `null` to use the technical default (20). */
  initialPageSize?: number | null;
  /** Initial column aggregation map, or `null` to force empty. */
  initialAggregatedColumns?: Record<string, string> | null;
}

export interface IbTableRowEvent<T = any> {
  tableName: string;
  type: string;
  row: T;
}

export interface IbTableRowSelectionChange<T = any> {
  tableName: string;
  selection: boolean;
  row: T;
}

export type IbKaiTableState = "idle" | "loading" | "no_data" | "http_error";

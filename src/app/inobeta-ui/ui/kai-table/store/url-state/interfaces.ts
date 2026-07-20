import { Sort } from "@angular/material/sort";
import { IbFilterSyntaxExtended } from "../../../kai-filter";
import { IbTableFilterState } from "../../table.types";

// ---------------------------------------------------------------------------
// Canonical table record (new — source of truth for DEVK-1066)
// ---------------------------------------------------------------------------

/**
 * Complete per-table state record stored in the `ibKaiTable` NgRx slice.
 *
 * Indexed by `tableName` in a flat dictionary; this is the canonical source
 * of truth for all table UI state.  Every field is always defined after
 * initialization.
 */
export interface IbKaiTableRecord {
  /** `true` after the table has been fully initialized by the facade. */
  initialized: boolean;
  /** Unique table identifier (matches the querystring key). */
  tableName: string;
  /** Active sort, or `null` when no column is sorted. */
  sort: Sort | null;
  /** Raw form filter values, or `null` when no filter is applied. */
  filters: IbTableFilterState | null;
  /**
   * ID of the active view, or `null` for the implicit "all data" view.
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
 * Feature state for the `ibKaiTable` NgRx slice.
 *
 * Stored as a dictionary keyed by `tableName` to allow O(1) lookup and
 * independent records for multiple tables sharing the same route.
 */
export type IUrlStateState = {
  tables: Record<string, IbKaiTableRecord>;
};

// ---------------------------------------------------------------------------
// Legacy types (kept for backward compatibility — will be removed in v21+)
// ---------------------------------------------------------------------------

/**
 * @deprecated Use {@link IbKaiTableRecord} instead.
 *
 * Legacy per-table parameter shape exposed through the old URL-state
 * selectors and actions.  Consumers should migrate to the canonical
 * `IbKaiTableRecord` and the new `tableStateActions`.
 */
export type IbKaiTableParams = {
  view: string;
  pageSize: number;
  page: number;
  filters: IbFilterSyntaxExtended;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
};

/**
 * @deprecated Use {@link IbKaiTableRecord} instead.
 *
 * Legacy partial record shape used by the old `ibTableSelectUrlState`
 * selector.  Retained so existing consumers continue to compile.
 */
export type IbKaiTableNamedParams = Partial<IbKaiTableParams> & { tableName: string };

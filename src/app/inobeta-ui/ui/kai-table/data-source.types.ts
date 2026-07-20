import { Sort } from "@angular/material/sort";
import { IbTableFilterState } from "./table.types";

/**
 * Normalized, immutable input state consumed by {@link IbTableLocalDataSource}
 * for local data processing.
 *
 * Each property represents the latest value of a single UI control.
 * A `null` value means "no value" (no sort, no filter).
 *
 * Consumers push partial updates via {@link IbTableLocalDataSource.setInput}
 * and the data source merges them with the existing state.
 */
export interface IbLocalDataSourceInput {
  /** Active sort, or `null` when no column is sorted. */
  sort: Sort | null;
  /**
   * Raw filter form values keyed by column name, or `null` when no filter
   * is applied.  Each key maps to the raw value captured from a single
   * filter criterion (string, string[], date range object, etc.).
   */
  rawFilter: IbTableFilterState | null;
  /** Zero-based page index. */
  pageIndex: number;
  /** Number of rows per page. */
  pageSize: number;
  /**
   * Active column aggregation functions (column name → aggregate key).
   * Empty when no aggregation is active.
   */
  aggregatedColumns: Record<string, string>;
}

/**
 * Default input used when no state has been supplied.
 */
export const IB_LOCAL_DS_DEFAULT_INPUT: IbLocalDataSourceInput = {
  sort: null,
  rawFilter: null,
  pageIndex: 0,
  pageSize: 20,
  aggregatedColumns: {},
};

/**
 * Data-source capabilities explicitly declared by an implementation.
 *
 * Desktop and mobile renderers inspect these flags to decide whether to
 * show export / aggregation controls.  Remote data sources may declare
 * a different set of capabilities.
 */
export enum IbDataSourceCapability {
  /** The data source can export all rows (not only the current page). */
  FullExport = 'fullExport',
  /** The data source supports global aggregation on the entire filtered set. */
  GlobalAggregation = 'globalAggregation',
}

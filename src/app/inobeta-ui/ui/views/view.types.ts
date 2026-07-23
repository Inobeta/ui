import { Sort } from "@angular/material/sort";
import { IbFilterSyntaxExtended } from "../kai-filter";
import { IbTableFilterState } from "../kai-table/table.types";

// ---------------------------------------------------------------------------
// Legacy internal types — migrated from store/views/table-view.ts (Step 4)
// ---------------------------------------------------------------------------

/**
 * Internal view entity used by the Views feature.
 *
 * Wraps an identifier, display name, group name and a data snapshot.
 * Prefer {@link IbSavedView} for public API boundaries.
 */
export interface IView {
  id: string;
  name: string;
  groupName: string;
  data: ITableViewData;
  /** When `true`, the emission should not trigger a table selection intent. */
  initial?: boolean;
}

/**
 * Data snapshot stored inside a view.
 *
 * Contains the legacy elaborated filter, canonical raw filter values,
 * page size, column aggregations and sort state.
 */
export interface ITableViewData {
  /**
   * Legacy elaborated filter type.  Prefer {@link filters} for the
   * canonical raw filter form values.
   */
  filter: IbFilterSyntaxExtended;
  /**
   * Canonical raw filter form values — the serializable representation
   * suitable for store, URL and view snapshots.
   * Optional; if absent, consumers should fall back to {@link filter}
   * and normalize at the boundary.
   */
  filters?: IbTableFilterState | null;
  pageSize: number;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
}

/**
 * Concrete view class implementing {@link IView}.
 *
 * Used as a convenient constructor for creating new view instances.
 */
export class IbView implements IView {
  id: string;
  name: string;
  groupName: string;
  data: ITableViewData;

  constructor(view: Partial<IView>) {
    this.id = view?.id ?? btoa(Math.random().toString());
    this.name = view?.name;
    this.groupName = view?.groupName;
    this.data = view?.data;
  }
}

// ---------------------------------------------------------------------------
// Canonical public types (DEVK-1065)
// ---------------------------------------------------------------------------

/**
 * Canonical persistable view snapshot.
 *
 * Contains only the four fields that a view saves and restores:
 * raw filters, sort, page size and column aggregation configuration.
 * The legacy elaborated `filter` is intentionally excluded; consumers
 * derive it from the canonical raw {@link filters} field.
 */
export interface IbViewSnapshot {
  /** Canonical raw filter form values, or `null` when no filter is applied. */
  filters: IbTableFilterState | null;
  /** Active sort, or `null` when no column is sorted. */
  sort: Sort | null;
  /** Number of rows per page. */
  pageSize: number;
  /** Active column aggregation functions (column name → aggregate key). */
  aggregatedColumns: Record<string, string>;
}

/**
 * A named view persisted in dedicated localStorage.
 *
 * Each group (identified by `tableName`) owns an ordered list of
 * `IbSavedView` instances stored under a dedicated key.
 */
export interface IbSavedView {
  /** Stable unique identifier generated with `crypto.randomUUID()`. */
  id: string;
  /** User-provided display name (trimmed, unique case-insensitive per group). */
  name: string;
  /** Canonical view snapshot persisted to storage. */
  data: IbViewSnapshot;
}

/**
 * Versioned envelope stored under one localStorage key per group.
 *
 * The format is `<prefix>:<groupName>` → `{ version: 1, views: […] }`.
 * Versioning allows future format migrations without breaking existing data.
 */
export interface IbViewsStorageEnvelope {
  version: 1;
  views: IbSavedView[];
}

/**
 * Explicit outcome of a save/discard/cancel dialog.
 *
 * Replaces the previous boolean-based `confirmed` approach with
 * a typed tri-state result.
 */
export enum IbViewDialogResult {
  /** User chose to persist changes. */
  Save = 'save',
  /** User chose to discard changes and continue. */
  Discard = 'discard',
  /** User chose to cancel the operation and stay on the current view. */
  Cancel = 'cancel',
}

/**
 * Typed result emitted by the view dialog in save/discard/cancel mode.
 */
export interface IbViewDialogOutput {
  /** The action the user selected. */
  action: IbViewDialogResult;
  /** Optional view name entered by the user (populated in name-required flows). */
  name?: string;
}

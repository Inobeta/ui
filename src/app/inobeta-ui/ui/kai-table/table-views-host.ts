import { Portal } from "@angular/cdk/portal";
import { Sort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { IbFilterSyntaxExtended } from "../kai-filter/filter.types";
import { IbTableFilterState } from "./table.types";

/**
 * Data contract between the table and a views provider.
 *
 * Represents a snapshot of table state that a view can capture and restore:
 * active filters, pagination settings, column aggregation configuration,
 * and sort state.
 */
export interface IbTableViewsData {
  /**
   * Legacy elaborated filter type.  Prefer {@link filters} for the
   * canonical raw filter form values.
   */
  filter: IbFilterSyntaxExtended;
  /**
   * Canonical raw filter form values — the serializable representation
   * suitable for store, URL and view snapshots.
   */
  filters?: IbTableFilterState | null;
  pageSize: number;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
}

/**
 * Abstract contract that the kai-table requires from any "views" integration.
 *
 * Any component that provides view/snapshot functionality (e.g. IbTableViewGroup)
 * must extend this class and implement its abstract members. The table uses
 * @ContentChild(IbTableViewsHost) to discover and interact with the views provider
 * without importing views module types directly.
 */
export abstract class IbTableViewsHost {
  /** Assign a unique name to the view group (typically the table name). */
  abstract setViewGroupName(name: string): void;

  /**
   * Provide a function that captures the current table state (filter, pageSize,
   * aggregatedColumns, sort) so the views provider can detect changes and
   * persist/restore view snapshots.
   */
  abstract setViewDataAccessor(fn: () => IbTableViewsData): void;

  /**
   * Subscribe to a stream of state changes emitted by the table. The views
   * provider uses this to track whether the current view is "dirty" (modified
   * from its saved state).
   */
  abstract handleStateChanges(changes$: Observable<unknown>): void;

  /**
   * Emits whenever the active view changes with the view's data and ID.
   * `viewId` is `null` for the implicit "all data" default view.
   */
  abstract readonly activeViewChanged: Observable<
    IbTableViewsData & { viewId: string | null }
  >;

  /**
   * Resolves a view snapshot by its ID.
   *
   * @param viewId The view ID to resolve. `null` and the legacy sentinel
   *   `'__ibTableView__all'` are treated as "no specific view".
   * @returns The view data, or `null` if the view is not found, the store
   *   is empty, or the ID represents the default view.
   */
  abstract resolveView(
    viewId: string | null
  ): Observable<IbTableViewsData | null>;

  /** Toolbar action portals contributed by the views provider. */
  abstract readonly toolbarPortals: Portal<any>[];

  /** Whether the current view state differs from the saved snapshot. */
  abstract readonly dirty: boolean;
}

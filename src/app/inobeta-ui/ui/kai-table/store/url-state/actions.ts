import { createActionGroup, props } from "@ngrx/store";
import { Sort } from "@angular/material/sort";
import {
  IbKaiTableSnapshot,
  IbKaiTableViewSnapshot,
  IbTableFilterState,
} from "../../table.types";

// ---------------------------------------------------------------------------
// Canonical table-state actions (DEVK-1066)
//
// These are the single source of truth for updating the NgRx slice.  Every
// action that changes the UI state must go through this group.
// ---------------------------------------------------------------------------

/**
 * Canonical table-state actions for the `ibKaiTable` NgRx slice.
 *
 * Use these actions to update sort, filter, pagination, aggregation, and
 * view state.  The reducer enforces invariants such as resetting
 * `pageIndex` to 0 on filter/sort/view changes.
 */
export const tableStateActions = createActionGroup({
  source: 'KaiTable/TableState',
  events: {
    /**
     * One-time initialization with a fully resolved snapshot from
     * {@link resolveInitialTableState}.
     *
     * Sets `initialized: true` and stores the complete snapshot.
     * Should be dispatched exactly once per table lifecycle.
     */
    'Initialize': props<{ tableName: string; snapshot: IbKaiTableSnapshot }>(),

    /**
     * Rehydration triggered by a browser back/forward navigation that
     * changes the URL state.  The snapshot is resolved from the URL
     * codec and merged via the same precedence rules.
     */
    'Hydrate From Url': props<{ tableName: string; snapshot: IbKaiTableSnapshot }>(),

    /**
     * User changed the raw filter form values.
     *
     * The reducer atomically sets `pageIndex = 0` to avoid showing an
     * empty page when the filtered dataset shrinks.
     */
    'Set Filters': props<{ tableName: string; filters: IbTableFilterState | null }>(),

    /**
     * User changed the sort column / direction.
     *
     * The reducer atomically sets `pageIndex = 0`.
     */
    'Set Sort': props<{ tableName: string; sort: Sort | null }>(),

    /**
     * User changed the page index or page size.
     */
    'Set Paginator': props<{ tableName: string; pageIndex: number; pageSize: number }>(),

    /**
     * User toggled / changed column aggregation functions.
     */
    'Set Aggregated Columns': props<{ tableName: string; aggregatedColumns: Record<string, string> }>(),

    /**
     * User selected a view (or the "all data" default).
     *
     * The reducer atomically sets `selectedView`, applies the view
     * snapshot (sort, filters, pageSize, aggregatedColumns), and
     * resets `pageIndex` to 0.
     */
    'Apply View': props<{
      tableName: string;
      selectedView: string | null;
      snapshot: IbKaiTableViewSnapshot;
    }>(),
  },
});

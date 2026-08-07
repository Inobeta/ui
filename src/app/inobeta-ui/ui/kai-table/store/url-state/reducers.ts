import { createReducer, on } from "@ngrx/store";
import { tableStateActions } from "./actions";
import { IbKaiTableRecord, IUrlStateState } from "./interfaces";

/** Technical defaults for a record that has not yet been initialized. */
const RECORD_DEFAULTS: Omit<IbKaiTableRecord, 'tableName' | 'initialized'> = {
  sort: null,
  filters: null,
  selectedView: null,
  pageIndex: 0,
  pageSize: 20,
  aggregatedColumns: {},
};

const INITIAL: IUrlStateState = {
  tables: {},
};

export const urlStateReducer = createReducer(INITIAL,

  // =========================================================================
  // NEW Canonical actions (tableStateActions)
  // =========================================================================

  on(tableStateActions.initialize, (stateIn, action) => {
    const state = structuredClone(stateIn);
    state.tables[action.tableName] = {
      tableName: action.tableName,
      initialized: true,
      sort: action.snapshot.sort,
      filters: action.snapshot.filters,
      selectedView: action.snapshot.selectedView,
      pageIndex: action.snapshot.pageIndex,
      pageSize: action.snapshot.pageSize,
      aggregatedColumns: { ...action.snapshot.aggregatedColumns },
    };
    return state;
  }),

  on(tableStateActions.hydrateFromUrl, (stateIn, action) => {
    const state = structuredClone(stateIn);
    state.tables[action.tableName] = {
      ...(state.tables[action.tableName] ?? getDefaultRecord(action.tableName)),
      initialized: true,
      sort: action.snapshot.sort,
      filters: action.snapshot.filters,
      selectedView: action.snapshot.selectedView,
      pageIndex: action.snapshot.pageIndex,
      pageSize: action.snapshot.pageSize,
      aggregatedColumns: { ...action.snapshot.aggregatedColumns },
    };
    return state;
  }),

  // Filter change → pageIndex = 0
  on(tableStateActions.setFilters, (stateIn, action) => {
    const state = structuredClone(stateIn);
    const record = getOrCreateRecord(state, action.tableName);
    record.filters = action.filters;
    record.pageIndex = 0;
    return state;
  }),

  // Sort change → pageIndex = 0
  on(tableStateActions.setSort, (stateIn, action) => {
    const state = structuredClone(stateIn);
    const record = getOrCreateRecord(state, action.tableName);
    record.sort = action.sort;
    record.pageIndex = 0;
    return state;
  }),

  on(tableStateActions.setPaginator, (stateIn, action) => {
    const state = structuredClone(stateIn);
    const record = getOrCreateRecord(state, action.tableName);
    record.pageIndex = action.pageIndex;
    record.pageSize = action.pageSize;
    return state;
  }),

  on(tableStateActions.setAggregatedColumns, (stateIn, action) => {
    const state = structuredClone(stateIn);
    const record = getOrCreateRecord(state, action.tableName);
    record.aggregatedColumns = { ...action.aggregatedColumns };
    return state;
  }),

  // View switch → selectedView + snapshot + pageIndex = 0
  on(tableStateActions.applyView, (stateIn, action) => {
    const state = structuredClone(stateIn);
    const record = getOrCreateRecord(state, action.tableName);
    record.selectedView = action.selectedView;
    if ('sort' in action.snapshot) {
      record.sort = action.snapshot.sort!;
    }
    if ('filters' in action.snapshot) {
      record.filters = action.snapshot.filters!;
    }
    if ('pageSize' in action.snapshot) {
      record.pageSize = action.snapshot.pageSize! ?? RECORD_DEFAULTS.pageSize;
    }
    if ('aggregatedColumns' in action.snapshot) {
      record.aggregatedColumns = action.snapshot.aggregatedColumns! ?? {};
    }
    record.pageIndex = 0;
    return state;
  }),

);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the existing record for `tableName` or lazily creates one with
 * technical defaults.  The record is guaranteed to be a property of
 * `state.tables` (mutated in the already-cloned state, so this is safe).
 */
function getOrCreateRecord(
  state: IUrlStateState,
  tableName: string,
): IbKaiTableRecord {
  if (!state.tables[tableName]) {
    state.tables[tableName] = getDefaultRecord(tableName);
  }
  return state.tables[tableName];
}

function getDefaultRecord(tableName: string): IbKaiTableRecord {
  return {
    tableName,
    initialized: false,
    ...RECORD_DEFAULTS,
    aggregatedColumns: { ...RECORD_DEFAULTS.aggregatedColumns },
  };
}

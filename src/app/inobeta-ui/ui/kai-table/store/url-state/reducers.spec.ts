import { Sort } from '@angular/material/sort';
import { urlStateReducer } from './reducers';
import { tableStateActions, urlStateActions } from './actions';
import { IbKaiTableRecord, IUrlStateState } from './interfaces';
import { IbKaiTableSnapshot, IbKaiTableViewSnapshot } from '../../table.types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const sortA: Sort = { active: 'name', direction: 'asc' };
const sortB: Sort = { active: 'date', direction: 'desc' };
const filtersA = { search: 'hello' };
const filtersB = { status: 'draft' };
const aggregatedA: Record<string, string> = { colA: 'sum' };
const aggregatedB: Record<string, string> = { colB: 'avg' };

const TABLE_A = 'table-a';
const TABLE_B = 'table-b';

function makeSnapshot(overrides: Partial<IbKaiTableSnapshot> = {}): IbKaiTableSnapshot {
  return {
    sort: null,
    filters: null,
    selectedView: null,
    pageIndex: 0,
    pageSize: 20,
    aggregatedColumns: {},
    ...overrides,
  };
}

function makeViewSnapshot(overrides: Partial<IbKaiTableViewSnapshot> = {}): IbKaiTableViewSnapshot {
  return { ...overrides };
}

function getRecord(
  state: IUrlStateState,
  tableName: string,
): IbKaiTableRecord | undefined {
  return state.tables[tableName];
}

// ---------------------------------------------------------------------------
// Technical defaults assertion helper
// ---------------------------------------------------------------------------

function expectTechnicalDefaults(record: IbKaiTableRecord, tableName: string): void {
  expect(record.tableName).toBe(tableName);
  expect(record.sort).toBeNull();
  expect(record.filters).toBeNull();
  expect(record.selectedView).toBeNull();
  expect(record.pageIndex).toBe(0);
  expect(record.pageSize).toBe(20);
  expect(record.aggregatedColumns).toEqual({});
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('urlStateReducer', () => {

  // ===========================================================================
  // 1. Canonical tableStateActions
  // ===========================================================================

  describe('tableStateActions', () => {

    // -----------------------------------------------------------------------
    // 1.1 Initialize
    // -----------------------------------------------------------------------
    describe('initialize', () => {

      it('should create a new record from a full snapshot', () => {
        const snapshot = makeSnapshot({
          sort: sortA,
          filters: filtersA,
          selectedView: 'view-1',
          pageIndex: 3,
          pageSize: 50,
          aggregatedColumns: aggregatedA,
        });

        const state = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.initialized).toBe(true);
        expect(record.sort).toEqual(sortA);
        expect(record.filters).toEqual(filtersA);
        expect(record.selectedView).toBe('view-1');
        expect(record.pageIndex).toBe(3);
        expect(record.pageSize).toBe(50);
        expect(record.aggregatedColumns).toEqual(aggregatedA);
      });

      it('should set initialized to true', () => {
        const state = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot(),
        }));
        expect(getRecord(state, TABLE_A)!.initialized).toBe(true);
      });

      it('should set an empty snapshot with all defaults', () => {
        const state = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot(),
        }));
        expectTechnicalDefaults(getRecord(state, TABLE_A)!, TABLE_A);
        expect(getRecord(state, TABLE_A)!.initialized).toBe(true);
      });

      it('should set sort=null and filters=null from snapshot', () => {
        const state = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: null, filters: null }),
        }));
        expect(getRecord(state, TABLE_A)!.sort).toBeNull();
        expect(getRecord(state, TABLE_A)!.filters).toBeNull();
      });
    });

    // -----------------------------------------------------------------------
    // 1.2 Hydrate From URL
    // -----------------------------------------------------------------------
    describe('hydrateFromUrl', () => {

      it('should create a new record when none exists (lazy create)', () => {
        const snapshot = makeSnapshot({ sort: sortA, pageIndex: 2 });
        const state = urlStateReducer(undefined as never, tableStateActions.hydrateFromUrl({
          tableName: TABLE_A,
          snapshot,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.initialized).toBe(true);
        expect(record.sort).toEqual(sortA);
        expect(record.pageIndex).toBe(2);
        // Defaults for other fields
        expect(record.filters).toBeNull();
        expect(record.pageSize).toBe(20);
      });

      it('should overwrite an existing record (rehydration replaces all snapshot fields)', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: sortA, filters: filtersA, pageIndex: 3 }),
        }));

        const hydratedState = urlStateReducer(initState, tableStateActions.hydrateFromUrl({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: sortB, pageIndex: 0 }),
        }));

        const record = getRecord(hydratedState, TABLE_A)!;
        expect(record.initialized).toBe(true);
        // snapshot replaces sort
        expect(record.sort).toEqual(sortB);
        // filters comes from snapshot (null)
        expect(record.filters).toBeNull();
        expect(record.pageIndex).toBe(0);
      });

      it('should set initialized to true even on an existing uninitialized record', () => {
        // Simulate: getOrCreateRecord creates an uninitialized record,
        // then hydrateFromUrl sets initialized=true
        const initState = urlStateReducer(undefined as never, tableStateActions.hydrateFromUrl({
          tableName: TABLE_A,
          snapshot: makeSnapshot(),
        }));
        expect(getRecord(initState, TABLE_A)!.initialized).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // 1.3 Set Filters — pageIndex = 0
    // -----------------------------------------------------------------------
    describe('setFilters', () => {

      it('should update filters and reset pageIndex to 0', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ pageIndex: 5, filters: null }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setFilters({
          tableName: TABLE_A,
          filters: filtersA,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.filters).toEqual(filtersA);
        expect(record.pageIndex).toBe(0);
      });

      it('should set filters to null atomically with pageIndex reset', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ filters: filtersA, pageIndex: 3 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setFilters({
          tableName: TABLE_A,
          filters: null,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.filters).toBeNull();
        expect(record.pageIndex).toBe(0);
      });

      it('should lazily create a record if none exists', () => {
        const state = urlStateReducer(undefined as never, tableStateActions.setFilters({
          tableName: TABLE_A,
          filters: filtersA,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.initialized).toBe(false);
        expect(record.filters).toEqual(filtersA);
        expect(record.pageIndex).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // 1.4 Set Sort — pageIndex = 0
    // -----------------------------------------------------------------------
    describe('setSort', () => {

      it('should update sort and reset pageIndex to 0', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: null, pageIndex: 5 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setSort({
          tableName: TABLE_A,
          sort: sortA,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.sort).toEqual(sortA);
        expect(record.pageIndex).toBe(0);
      });

      it('should set sort to null atomically with pageIndex reset', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: sortA, pageIndex: 3 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setSort({
          tableName: TABLE_A,
          sort: null,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.sort).toBeNull();
        expect(record.pageIndex).toBe(0);
      });

      it('should lazily create a record if none exists', () => {
        const state = urlStateReducer(undefined as never, tableStateActions.setSort({
          tableName: TABLE_A,
          sort: sortA,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.initialized).toBe(false);
        expect(record.sort).toEqual(sortA);
        expect(record.pageIndex).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // 1.5 Set Paginator
    // -----------------------------------------------------------------------
    describe('setPaginator', () => {

      it('should update pageIndex and pageSize', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ pageIndex: 0, pageSize: 20 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setPaginator({
          tableName: TABLE_A,
          pageIndex: 3,
          pageSize: 50,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.pageIndex).toBe(3);
        expect(record.pageSize).toBe(50);
      });

      it('should not reset other fields', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: sortA, filters: filtersA }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setPaginator({
          tableName: TABLE_A,
          pageIndex: 7,
          pageSize: 100,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.sort).toEqual(sortA);
        expect(record.filters).toEqual(filtersA);
        expect(record.pageIndex).toBe(7);
        expect(record.pageSize).toBe(100);
      });
    });

    // -----------------------------------------------------------------------
    // 1.6 Set Aggregated Columns
    // -----------------------------------------------------------------------
    describe('setAggregatedColumns', () => {

      it('should update aggregatedColumns', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ aggregatedColumns: {} }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setAggregatedColumns({
          tableName: TABLE_A,
          aggregatedColumns: aggregatedA,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.aggregatedColumns).toEqual(aggregatedA);
      });

      it('should not reset pageIndex', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ pageIndex: 5 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.setAggregatedColumns({
          tableName: TABLE_A,
          aggregatedColumns: aggregatedA,
        }));

        expect(getRecord(state, TABLE_A)!.pageIndex).toBe(5);
      });
    });

    // -----------------------------------------------------------------------
    // 1.7 Apply View
    // -----------------------------------------------------------------------
    describe('applyView', () => {

      it('should set selectedView, apply snapshot fields, and reset pageIndex to 0', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: sortA, filters: filtersA, pageIndex: 3, pageSize: 50 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.applyView({
          tableName: TABLE_A,
          selectedView: 'view-x',
          snapshot: makeViewSnapshot({ sort: sortB, pageSize: 10 }),
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.selectedView).toBe('view-x');
        expect(record.sort).toEqual(sortB);
        // filters not in snapshot — should keep previous
        expect(record.filters).toEqual(filtersA);
        expect(record.pageSize).toBe(10);
        expect(record.pageIndex).toBe(0);
      });

      it('should set selectedView to null', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ selectedView: 'old-view' }),
        }));

        const state = urlStateReducer(initState, tableStateActions.applyView({
          tableName: TABLE_A,
          selectedView: null,
          snapshot: makeViewSnapshot(),
        }));

        expect(getRecord(state, TABLE_A)!.selectedView).toBeNull();
      });

      it('should apply filters from the view snapshot', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ filters: filtersA, pageIndex: 3 }),
        }));

        const state = urlStateReducer(initState, tableStateActions.applyView({
          tableName: TABLE_A,
          selectedView: 'filtered-view',
          snapshot: makeViewSnapshot({ filters: filtersB }),
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.filters).toEqual(filtersB);
        expect(record.pageIndex).toBe(0);
      });

      it('should apply aggregatedColumns from the view snapshot', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ aggregatedColumns: aggregatedA }),
        }));

        const state = urlStateReducer(initState, tableStateActions.applyView({
          tableName: TABLE_A,
          selectedView: 'agg-view',
          snapshot: makeViewSnapshot({ aggregatedColumns: aggregatedB }),
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.aggregatedColumns).toEqual(aggregatedB);
        expect(record.pageIndex).toBe(0);
      });
    });
  });

  // ===========================================================================
  // 2. Legacy urlStateActions
  // ===========================================================================

  describe('urlStateActions (legacy)', () => {

    // -----------------------------------------------------------------------
    // 2.1 Legacy setFilters
    // -----------------------------------------------------------------------
    describe('setFilters', () => {

      it('should update filters and reset pageIndex to 0', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ pageIndex: 5 }),
        }));

        const state = urlStateReducer(initState, urlStateActions.setFilters({
          tableName: TABLE_A,
          params: filtersA as never,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.filters).toEqual(filtersA);
        expect(record.pageIndex).toBe(0);
      });
    });

    // -----------------------------------------------------------------------
    // 2.2 Legacy setPaginator
    // -----------------------------------------------------------------------
    describe('setPaginator', () => {

      it('should update pageIndex and pageSize', () => {
        const state = urlStateReducer(undefined as never, urlStateActions.setPaginator({
          tableName: TABLE_A,
          params: { pageIndex: 4, pageSize: 30 },
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.pageIndex).toBe(4);
        expect(record.pageSize).toBe(30);
      });
    });

    // -----------------------------------------------------------------------
    // 2.3 Legacy setAggregatedColumns
    // -----------------------------------------------------------------------
    describe('setAggregatedColumns', () => {

      it('should update aggregatedColumns', () => {
        const state = urlStateReducer(undefined as never, urlStateActions.setAggregatedColumns({
          tableName: TABLE_A,
          params: aggregatedA,
        }));

        expect(getRecord(state, TABLE_A)!.aggregatedColumns).toEqual(aggregatedA);
      });
    });

    // -----------------------------------------------------------------------
    // 2.4 Legacy setSort
    // -----------------------------------------------------------------------
    describe('setSort', () => {

      it('should update sort', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ sort: null }),
        }));

        const state = urlStateReducer(initState, urlStateActions.setSort({
          tableName: TABLE_A,
          params: sortA,
        }));

        expect(getRecord(state, TABLE_A)!.sort).toEqual(sortA);
      });

      it('should NOT reset pageIndex (legacy behavior — canonical action handles reset)', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ pageIndex: 5, sort: null }),
        }));

        const state = urlStateReducer(initState, urlStateActions.setSort({
          tableName: TABLE_A,
          params: sortA,
        }));

        // Legacy sort does NOT reset pageIndex
        expect(getRecord(state, TABLE_A)!.pageIndex).toBe(5);
      });
    });

    // -----------------------------------------------------------------------
    // 2.5 Legacy handleViewChange
    // -----------------------------------------------------------------------
    describe('handleViewChange', () => {

      it('should bulk-apply all fields and reset pageIndex to 0', () => {
        const state = urlStateReducer(undefined as never, urlStateActions.handleViewChange({
          tableName: TABLE_A,
          params: {
            view: 'bulk-view',
            pageSize: 30,
            page: 0,
            filters: filtersA as never,
            aggregatedColumns: aggregatedA,
            sort: sortA,
          },
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.selectedView).toBe('bulk-view');
        expect(record.pageIndex).toBe(0);
        expect(record.pageSize).toBe(30);
        expect(record.filters).toEqual(filtersA);
        expect(record.aggregatedColumns).toEqual(aggregatedA);
        expect(record.sort).toEqual(sortA);
      });
    });

    // -----------------------------------------------------------------------
    // 2.6 Legacy setRemoteDatasourceParams
    // -----------------------------------------------------------------------
    describe('setRemoteDatasourceParams', () => {

      it('should update both filters and sort', () => {
        const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
          tableName: TABLE_A,
          snapshot: makeSnapshot({ filters: null, sort: null }),
        }));

        const state = urlStateReducer(initState, urlStateActions.setRemoteDatasourceParams({
          tableName: TABLE_A,
          filters: filtersA as never,
          sort: sortA,
        }));

        const record = getRecord(state, TABLE_A)!;
        expect(record.filters).toEqual(filtersA);
        expect(record.sort).toEqual(sortA);
      });

      it('should create a record if none exists', () => {
        const state = urlStateReducer(undefined as never, urlStateActions.setRemoteDatasourceParams({
          tableName: TABLE_A,
          filters: filtersA as never,
          sort: sortA,
        }));

        expect(getRecord(state, TABLE_A)).toBeDefined();
        expect(getRecord(state, TABLE_A)!.filters).toEqual(filtersA);
      });
    });
  });

  // ===========================================================================
  // 3. Two independent tableNames
  // ===========================================================================

  describe('independent tableNames', () => {

    it('should keep separate records for two different tableNames', () => {
      let state = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ sort: sortA, pageIndex: 3, pageSize: 50 }),
      }));

      state = urlStateReducer(state, tableStateActions.initialize({
        tableName: TABLE_B,
        snapshot: makeSnapshot({ sort: sortB, pageIndex: 7, pageSize: 100 }),
      }));

      const recordA = getRecord(state, TABLE_A)!;
      const recordB = getRecord(state, TABLE_B)!;

      expect(recordA.sort).toEqual(sortA);
      expect(recordA.pageIndex).toBe(3);
      expect(recordA.pageSize).toBe(50);

      expect(recordB.sort).toEqual(sortB);
      expect(recordB.pageIndex).toBe(7);
      expect(recordB.pageSize).toBe(100);
    });

    it('should not affect the other table when one changes', () => {
      let state = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ sort: sortA }),
      }));

      state = urlStateReducer(state, tableStateActions.initialize({
        tableName: TABLE_B,
        snapshot: makeSnapshot({ sort: null }),
      }));

      // Change table A
      state = urlStateReducer(state, tableStateActions.setSort({
        tableName: TABLE_A,
        sort: sortB,
      }));

      // Table B should be unchanged
      expect(getRecord(state, TABLE_A)!.sort).toEqual(sortB);
      expect(getRecord(state, TABLE_B)!.sort).toBeNull();
    });

    it('should keep records isolated when using filter on one table', () => {
      let state = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ pageIndex: 3 }),
      }));

      state = urlStateReducer(state, tableStateActions.initialize({
        tableName: TABLE_B,
        snapshot: makeSnapshot({ pageIndex: 7 }),
      }));

      // Filter on table A resets its pageIndex to 0, not table B's
      state = urlStateReducer(state, tableStateActions.setFilters({
        tableName: TABLE_A,
        filters: filtersA,
      }));

      expect(getRecord(state, TABLE_A)!.pageIndex).toBe(0);
      expect(getRecord(state, TABLE_B)!.pageIndex).toBe(7);
    });
  });

  // ===========================================================================
  // 4. selectedView null
  // ===========================================================================

  describe('selectedView null', () => {

    it('should store selectedView=null on initialize', () => {
      const state = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ selectedView: null }),
      }));

      expect(getRecord(state, TABLE_A)!.selectedView).toBeNull();
    });

    it('should store selectedView=null on hydrateFromUrl', () => {
      const state = urlStateReducer(undefined as never, tableStateActions.hydrateFromUrl({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ selectedView: null }),
      }));

      expect(getRecord(state, TABLE_A)!.selectedView).toBeNull();
    });

    it('should set selectedView=null via applyView', () => {
      const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ selectedView: 'old-view' }),
      }));

      const state = urlStateReducer(initState, tableStateActions.applyView({
        tableName: TABLE_A,
        selectedView: null,
        snapshot: makeViewSnapshot(),
      }));

      expect(getRecord(state, TABLE_A)!.selectedView).toBeNull();
    });
  });

  // ===========================================================================
  // 5. Immutability
  // ===========================================================================

  describe('immutability', () => {

    it('should not mutate the previous state on initialize', () => {
      const initialState: IUrlStateState = { tables: {} };
      const initialStateSnapshot = structuredClone(initialState);

      urlStateReducer(initialState, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot(),
      }));

      expect(initialState).toEqual(initialStateSnapshot);
    });

    it('should not mutate the previous state on setFilters', () => {
      const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ filters: null }),
      }));
      const initStateSnapshot = structuredClone(initState);

      urlStateReducer(initState, tableStateActions.setFilters({
        tableName: TABLE_A,
        filters: filtersA,
      }));

      expect(initState).toEqual(initStateSnapshot);
    });

    it('should not mutate the previous state on setSort', () => {
      const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ sort: null }),
      }));
      const initStateSnapshot = structuredClone(initState);

      urlStateReducer(initState, tableStateActions.setSort({
        tableName: TABLE_A,
        sort: sortA,
      }));

      expect(initState).toEqual(initStateSnapshot);
    });

    it('should not mutate the original state reference on paginator change', () => {
      const initState = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot(),
      }));
      const initStateSnapshot = structuredClone(initState);

      urlStateReducer(initState, tableStateActions.setPaginator({
        tableName: TABLE_A,
        pageIndex: 5,
        pageSize: 100,
      }));

      expect(initState).toEqual(initStateSnapshot);
    });

    it('should return a new state object on each action (reference inequality)', () => {
      const state1 = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot(),
      }));

      const state2 = urlStateReducer(state1, tableStateActions.setFilters({
        tableName: TABLE_A,
        filters: filtersA,
      }));

      expect(state1).not.toBe(state2);
    });
  });

  // ===========================================================================
  // 6. Edge cases
  // ===========================================================================

  describe('edge cases', () => {

    it('should handle undefined initial state (reducer init)', () => {
      const state = urlStateReducer(undefined as never, { type: '@@INIT' } as never);
      expect(state).toEqual({ tables: {} });
    });

    it('should handle an action for a non-existing table via legacy action (lazy create)', () => {
      const state = urlStateReducer(undefined as never, urlStateActions.setPaginator({
        tableName: TABLE_A,
        params: { pageIndex: 5, pageSize: 10 },
      }));

      const record = getRecord(state, TABLE_A)!;
      expect(record).toBeDefined();
      expect(record.pageIndex).toBe(5);
      expect(record.pageSize).toBe(10);
      expect(record.initialized).toBe(false);
    });

    it('should handle multiple actions in sequence for the same table', () => {
      let state = urlStateReducer(undefined as never, tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot(),
      }));

      state = urlStateReducer(state, tableStateActions.setSort({
        tableName: TABLE_A,
        sort: sortA,
      }));

      state = urlStateReducer(state, tableStateActions.setFilters({
        tableName: TABLE_A,
        filters: filtersA,
      }));

      state = urlStateReducer(state, tableStateActions.setPaginator({
        tableName: TABLE_A,
        pageIndex: 2,
        pageSize: 30,
      }));

      const record = getRecord(state, TABLE_A)!;
      expect(record.sort).toEqual(sortA);
      // setFilters reset pageIndex to 0, then setPaginator set it to 2
      expect(record.pageIndex).toBe(2);
      expect(record.pageSize).toBe(30);
      expect(record.filters).toEqual(filtersA);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { UrlStateEffects } from './effects';
import { tableStateActions } from './actions';
import { IbTableUrlService } from '../../table-url.service';
import { IbKaiTableSnapshot } from '../../table.types';

describe('UrlStateEffects', () => {

  // -----------------------------------------------------------------------
  // Fixtures
  // -----------------------------------------------------------------------
  const sortA: Sort = { active: 'name', direction: 'asc' };
  const sortB: Sort = { active: 'date', direction: 'desc' };
  const filtersA = { search: 'hello' };
  const aggregatedA: Record<string, string> = { colA: 'sum' };
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

  let actions$: Subject<Action>;
  let effects: UrlStateEffects;
  let tableUrlService: jasmine.SpyObj<IbTableUrlService>;
  let store: MockStore;
  /**
   * Mutable value returned by the spied `store.select()`.  Each test sets
   * this before dispatching an action so the effect reads the desired
   * post-reducer snapshot synchronously.
   */
  let currentSnapshot: IbKaiTableSnapshot | undefined;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    currentSnapshot = undefined;

    const urlServiceSpy = jasmine.createSpyObj('IbTableUrlService', [
      'writeState',
    ]);

    TestBed.configureTestingModule({
      providers: [
        UrlStateEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: { ibKaiTable: { tables: {} } },
        }),
        { provide: IbTableUrlService, useValue: urlServiceSpy },
      ],
    });

    effects = TestBed.inject(UrlStateEffects);
    tableUrlService = TestBed.inject(IbTableUrlService) as jasmine.SpyObj<IbTableUrlService>;
    store = TestBed.inject(MockStore);

    // Spy ONCE per test — callFake reads the mutable currentSnapshot so the
    // effect's switchMap + take(1) pipeline completes synchronously.
    spyOn(store, 'select').and.callFake(() => of(currentSnapshot));

    // Single subscription to the canonical effect for the whole test.
    effects.persistState$.subscribe();
  });

  // =========================================================================
  // 1. persistState$ — writes full state on user actions
  // =========================================================================
  describe('persistState$', () => {

    it('should call writeState with the full snapshot on setFilters', () => {
      const snapshot = makeSnapshot({ filters: filtersA, pageIndex: 0 });
      currentSnapshot = snapshot;

      actions$.next(tableStateActions.setFilters({
        tableName: TABLE_A,
        filters: filtersA,
      }));

      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot);
    });

    it('should call writeState with the full snapshot on setSort', () => {
      const snapshot = makeSnapshot({ sort: sortA, pageIndex: 0 });
      currentSnapshot = snapshot;

      actions$.next(tableStateActions.setSort({
        tableName: TABLE_A,
        sort: sortA,
      }));

      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot);
    });

    it('should call writeState with the full snapshot on setPaginator', () => {
      const snapshot = makeSnapshot({ pageIndex: 5, pageSize: 50 });
      currentSnapshot = snapshot;

      actions$.next(tableStateActions.setPaginator({
        tableName: TABLE_A,
        pageIndex: 5,
        pageSize: 50,
      }));

      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot);
    });

    it('should call writeState with the full snapshot on setAggregatedColumns', () => {
      const snapshot = makeSnapshot({ aggregatedColumns: aggregatedA });
      currentSnapshot = snapshot;

      actions$.next(tableStateActions.setAggregatedColumns({
        tableName: TABLE_A,
        aggregatedColumns: aggregatedA,
      }));

      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot);
    });

    it('should call writeState with the full snapshot on applyView', () => {
      const snapshot = makeSnapshot({
        selectedView: 'view-x',
        sort: sortA,
        filters: filtersA,
        pageIndex: 0,
      });
      currentSnapshot = snapshot;

      actions$.next(tableStateActions.applyView({
        tableName: TABLE_A,
        selectedView: 'view-x',
        snapshot: { sort: sortA, filters: filtersA },
      }));

      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot);
    });
  });

  // =========================================================================
  // 2. initialize and hydrateFromUrl do NOT trigger writes
  // =========================================================================
  describe('initialize and hydrate should NOT write', () => {

    it('should NOT call writeState on initialize', () => {
      currentSnapshot = makeSnapshot({ pageIndex: 3 });

      actions$.next(tableStateActions.initialize({
        tableName: TABLE_A,
        snapshot: makeSnapshot(),
      }));

      expect(tableUrlService.writeState).not.toHaveBeenCalled();
    });

    it('should NOT call writeState on hydrateFromUrl', () => {
      currentSnapshot = makeSnapshot({ pageIndex: 3 });

      actions$.next(tableStateActions.hydrateFromUrl({
        tableName: TABLE_A,
        snapshot: makeSnapshot({ pageIndex: 3 }),
      }));

      expect(tableUrlService.writeState).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. Rapid updates — no field loss
  // =========================================================================
  describe('rapid updates without field loss', () => {

    it('should write each full snapshot independently on consecutive actions', () => {
      // First: set sort
      const snapshot1 = makeSnapshot({ sort: sortA, pageIndex: 0 });
      currentSnapshot = snapshot1;

      actions$.next(tableStateActions.setSort({ tableName: TABLE_A, sort: sortA }));
      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot1);

      // Second: set filters
      tableUrlService.writeState.calls.reset();
      const snapshot2 = makeSnapshot({ filters: filtersA, sort: sortA, pageIndex: 0 });
      currentSnapshot = snapshot2;

      actions$.next(tableStateActions.setFilters({ tableName: TABLE_A, filters: filtersA }));
      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot2);

      // Third: set paginator
      tableUrlService.writeState.calls.reset();
      const snapshot3 = makeSnapshot({
        filters: filtersA,
        sort: sortA,
        pageIndex: 7,
        pageSize: 100,
      });
      currentSnapshot = snapshot3;

      actions$.next(tableStateActions.setPaginator({
        tableName: TABLE_A,
        pageIndex: 7,
        pageSize: 100,
      }));
      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshot3);
    });

    it('should write the correct snapshot for each table independently', () => {
      const snapshotA = makeSnapshot({ sort: sortA, pageIndex: 0 });
      const snapshotB = makeSnapshot({ sort: sortB, pageIndex: 0 });

      // Action on TABLE_A — the post-reducer state for TABLE_A is snapshotA
      currentSnapshot = snapshotA;
      actions$.next(tableStateActions.setSort({ tableName: TABLE_A, sort: sortA }));
      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_A, snapshotA);

      // Action on TABLE_B — the post-reducer state for TABLE_B is snapshotB
      tableUrlService.writeState.calls.reset();
      currentSnapshot = snapshotB;
      actions$.next(tableStateActions.setSort({ tableName: TABLE_B, sort: sortB }));
      expect(tableUrlService.writeState).toHaveBeenCalledWith(TABLE_B, snapshotB);
    });
  });

  // =========================================================================
  // 4. Filter out null snapshot (uninitialized table)
  // =========================================================================
  describe('undefined snapshot (table not yet initialized)', () => {

    it('should NOT call writeState when selector returns undefined', () => {
      currentSnapshot = undefined;

      actions$.next(tableStateActions.setFilters({
        tableName: TABLE_A,
        filters: filtersA,
      }));

      expect(tableUrlService.writeState).not.toHaveBeenCalled();
    });

    it('should NOT call writeState when table has never been initialized', () => {
      // currentSnapshot is undefined by default in beforeEach
      actions$.next(tableStateActions.setSort({
        tableName: TABLE_A,
        sort: sortA,
      }));

      expect(tableUrlService.writeState).not.toHaveBeenCalled();
    });
  });

});

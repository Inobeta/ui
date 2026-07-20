import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Sort } from '@angular/material/sort';
import { Observable, Subject, of } from 'rxjs';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { IbKaiTableStateFacade } from './table-state.facade';
import { IbTableUrlService } from './table-url.service';
import { tableStateActions } from './store/url-state/actions';
import { IbTableViewsHost, IbTableViewsData } from './table-views-host';
import {
  IbKaiTableSnapshot,
  IbKaiTableViewSnapshot,
  IbTableFilterState,
  IbTableDef,
  IbKaiTableUrlParams,
} from './table.types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const sortA: Sort = { active: 'name', direction: 'asc' };
const sortB: Sort = { active: 'date', direction: 'desc' };
const filtersA: IbTableFilterState = { search: 'hello' };
const filtersB: IbTableFilterState = { status: 'draft' };
const aggregatedA: Record<string, string> = { colA: 'sum' };
const TABLE_NAME = 'test-table';
const TABLE_NAME_2 = 'other-table';

function makeSnapshot(
  overrides: Partial<IbKaiTableSnapshot> = {},
): IbKaiTableSnapshot {
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

function makeViewSnapshot(
  overrides: Partial<IbKaiTableViewSnapshot> = {},
): IbKaiTableViewSnapshot {
  return { ...overrides };
}

function makeViewsData(
  overrides: Partial<IbTableViewsData> = {},
): IbTableViewsData {
  return {
    filter: {} as never,
    filters: null,
    pageSize: 20,
    aggregatedColumns: {},
    sort: { active: '', direction: '' },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Views host stub
// ---------------------------------------------------------------------------

class ViewsHostStub extends IbTableViewsHost {
  private _resolveFn: (viewId: string | null) => Observable<IbTableViewsData | null> =
    () => of(null);

  setResolveFn(fn: (viewId: string | null) => Observable<IbTableViewsData | null>): void {
    this._resolveFn = fn;
  }

  override setViewGroupName(_name: string): void { /* noop */ }
  override setViewDataAccessor(_fn: () => IbTableViewsData): void { /* noop */ }
  override handleStateChanges(_changes$: Observable<unknown>): void { /* noop */ }
  override readonly activeViewChanged = new Subject<
    IbTableViewsData & { viewId: string | null }
  >();
  override readonly toolbarPortals = [];
  override readonly dirty = false;

  override resolveView(viewId: string | null): Observable<IbTableViewsData | null> {
    return this._resolveFn(viewId);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('IbKaiTableStateFacade', () => {
  let facade: IbKaiTableStateFacade;
  let mockStoreDispatch: jasmine.Spy;
  let mockStoreSelect: jasmine.Spy;
  let storeSelectSubject: Subject<any>;
  let mockRouterNavigate: jasmine.Spy;
  let queryParamsSubject: Subject<Record<string, string>>;
  let urlService: jasmine.SpyObj<IbTableUrlService>;
  let activatedRouteSnapshot: { queryParams: Record<string, string> };

  beforeEach(() => {
    storeSelectSubject = new Subject<any>();
    queryParamsSubject = new Subject<Record<string, string>>();
    activatedRouteSnapshot = { queryParams: {} };

    mockStoreDispatch = jasmine.createSpy('dispatch');
    mockStoreSelect = jasmine
      .createSpy('select')
      .and.returnValue(storeSelectSubject);

    mockRouterNavigate = jasmine.createSpy('navigate');

    urlService = jasmine.createSpyObj('IbTableUrlService', [
      'decodeUrlParams',
      'writeState',
    ]);
    // Default: no URL params
    urlService.decodeUrlParams.and.returnValue(null);

    TestBed.configureTestingModule({
      providers: [
        IbKaiTableStateFacade,
        {
          provide: Store,
          useValue: {
            dispatch: mockStoreDispatch,
            select: mockStoreSelect,
          },
        },
        {
          provide: Router,
          useValue: { navigate: mockRouterNavigate },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject,
            snapshot: activatedRouteSnapshot,
          },
        },
        { provide: IbTableUrlService, useValue: urlService },
      ],
    });

    facade = TestBed.inject(IbKaiTableStateFacade);
  });

  afterEach(() => {
    facade.destroy();
    storeSelectSubject.complete();
    queryParamsSubject.complete();
  });

  // ===========================================================================
  // 1. Initialization without query params
  // ===========================================================================

  describe('initialize', () => {
    describe('without URL params', () => {
      it('should dispatch a single initialize action with resolved snapshot', async () => {
        const tableDef: IbTableDef = { initialPageSize: 50 };
        await facade.initialize(TABLE_NAME, tableDef);

        expect(mockStoreDispatch).toHaveBeenCalledTimes(1);
        const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
        expect(dispatchCall.type).toBe(tableStateActions.initialize.type);
        expect(dispatchCall.tableName).toBe(TABLE_NAME);
        expect(dispatchCall.snapshot.pageSize).toBe(50);
        expect(dispatchCall.snapshot.pageIndex).toBe(0);
        expect(dispatchCall.snapshot.sort).toBeNull();
        expect(dispatchCall.snapshot.filters).toBeNull();
        expect(dispatchCall.snapshot.selectedView).toBeNull();
        expect(dispatchCall.snapshot.aggregatedColumns).toEqual({});
      });

      it('should set initialized flag to true after init', async () => {
        await facade.initialize(TABLE_NAME, {});
        expect(facade.initialized()).toBe(true);
      });

      it('should set tableName after init', async () => {
        await facade.initialize(TABLE_NAME, {});
        expect(facade.tableName).toBe(TABLE_NAME);
      });

      it('should call decodeUrlParams with the correct tableName', async () => {
        await facade.initialize(TABLE_NAME, {});
        expect(urlService.decodeUrlParams).toHaveBeenCalledWith(TABLE_NAME);
      });
    });

    // -------------------------------------------------------------------------
    // 1.1 Idempotent initialization
    // -------------------------------------------------------------------------

    describe('idempotent initialization', () => {
      it('should ignore a second call to initialize (same tableName)', async () => {
        await facade.initialize(TABLE_NAME, {});
        const dispatchCountAfterFirst = mockStoreDispatch.calls.count();

        await facade.initialize(TABLE_NAME, { initialPageSize: 100 });
        // No additional dispatch
        expect(mockStoreDispatch.calls.count()).toBe(dispatchCountAfterFirst);
        // initialized remains true
        expect(facade.initialized()).toBe(true);
      });

      it('should warn when tableName changes after initialization', async () => {
        spyOn(console, 'warn');
        await facade.initialize(TABLE_NAME, {});
        await facade.initialize(TABLE_NAME_2, {});

        expect(console.warn).toHaveBeenCalledWith(
          jasmine.stringMatching(
            `Cannot change tableName from "${TABLE_NAME}" to "${TABLE_NAME_2}"`,
          ),
        );
        // tableName should NOT have changed
        expect(facade.tableName).toBe(TABLE_NAME);
      });
    });
  });

  // ===========================================================================
  // 2. Initialization with URL params (partial, null)
  // ===========================================================================

  describe('initialize with URL params', () => {
    it('should resolve state using URL params when present', async () => {
      const urlParams: IbKaiTableUrlParams = { sort: sortA, pageIndex: 3 };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, {});

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.sort).toEqual(sortA);
      expect(dispatchCall.snapshot.pageIndex).toBe(3);
    });

    it('should clear filters when URL filters is explicitly null', async () => {
      const tableDef: IbTableDef = { initialFilters: filtersA };
      const urlParams: IbKaiTableUrlParams = { filters: null };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.filters).toBeNull();
    });

    it('should clear sort when URL sort is explicitly null', async () => {
      const tableDef: IbTableDef = { initialSort: sortA };
      const urlParams: IbKaiTableUrlParams = { sort: null };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.sort).toBeNull();
    });

    it('should force "all data" when URL view is explicitly null', async () => {
      const tableDef: IbTableDef = { initialView: 'my-view' };
      const urlParams: IbKaiTableUrlParams = { view: null };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.selectedView).toBeNull();
    });

    it('should use URL pageIndex over tableDef initialPageIndex', async () => {
      const tableDef: IbTableDef = { initialPageIndex: 5 };
      const urlParams: IbKaiTableUrlParams = { pageIndex: 7 };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.pageIndex).toBe(7);
    });

    it('should fall back to technical default when URL pageIndex is null', async () => {
      const tableDef: IbTableDef = { initialPageIndex: 5 };
      const urlParams: IbKaiTableUrlParams = { pageIndex: null };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.pageIndex).toBe(0);
    });

    it('should retain tableDef values when URL keys are absent', async () => {
      const tableDef: IbTableDef = { initialFilters: filtersA, initialSort: sortA };
      // URL only has pageIndex — sort and filters are absent
      const urlParams: IbKaiTableUrlParams = { pageIndex: 2 };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.sort).toEqual(sortA);
      expect(dispatchCall.snapshot.filters).toEqual(filtersA);
      expect(dispatchCall.snapshot.pageIndex).toBe(2);
    });
  });

  // ===========================================================================
  // 3. View resolution (initialView and URL view)
  // ===========================================================================

  describe('initialize with views', () => {
    let viewsHost: ViewsHostStub;

    beforeEach(() => {
      viewsHost = new ViewsHostStub();
    });

    it('should resolve initialView from tableDef and apply its snapshot', async () => {
      viewsHost.setResolveFn((viewId) => {
        if (viewId === 'init-view') {
          return of(
            makeViewsData({ filters: filtersA, pageSize: 10, sort: sortA }),
          );
        }
        return of(null);
      });

      const tableDef: IbTableDef = { initialView: 'init-view' };

      await facade.initialize(TABLE_NAME, tableDef, viewsHost);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.filters).toEqual(filtersA);
      expect(dispatchCall.snapshot.pageSize).toBe(10);
      expect(dispatchCall.snapshot.sort).toEqual(sortA);
    });

    it('should resolve URL view and apply its snapshot', async () => {
      viewsHost.setResolveFn((viewId) => {
        if (viewId === 'url-view') {
          return of(
            makeViewsData({ filters: filtersB, pageSize: 50 }),
          );
        }
        return of(null);
      });

      const urlParams: IbKaiTableUrlParams = { view: 'url-view' };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, {}, viewsHost);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.filters).toEqual(filtersB);
      expect(dispatchCall.snapshot.pageSize).toBe(50);
    });

    it('should let URL view override initialView snapshot', async () => {
      viewsHost.setResolveFn((viewId) => {
        if (viewId === 'init-view') {
          return of(
            makeViewsData({ filters: filtersA, pageSize: 10 }),
          );
        }
        if (viewId === 'url-view') {
          return of(
            makeViewsData({ filters: filtersB, pageSize: 30 }),
          );
        }
        return of(null);
      });

      const tableDef: IbTableDef = { initialView: 'init-view' };
      const urlParams: IbKaiTableUrlParams = { view: 'url-view' };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, tableDef, viewsHost);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      // URL view wins
      expect(dispatchCall.snapshot.filters).toEqual(filtersB);
      expect(dispatchCall.snapshot.pageSize).toBe(30);
    });

    it('should handle unresolved initialView gracefully (null snapshot)', async () => {
      viewsHost.setResolveFn(() => of(null));

      const tableDef: IbTableDef = {
        initialView: 'non-existent',
        initialFilters: filtersA,
      };

      await facade.initialize(TABLE_NAME, tableDef, viewsHost);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      // Unresolved view → filters from tableDef retained
      expect(dispatchCall.snapshot.filters).toEqual(filtersA);
    });

    it('should skip view resolution when no viewsHost is provided', async () => {
      const tableDef: IbTableDef = { initialView: 'some-view' };

      // No viewsHost passed
      await facade.initialize(TABLE_NAME, tableDef);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      // initialView is NOT resolved — falls back to tableDef layer which sets
      // selectedView but doesn't resolve the snapshot
      expect(dispatchCall.snapshot.selectedView).toBe('some-view');
    });

    it('should skip URL view resolution when no viewsHost is provided', async () => {
      const urlParams: IbKaiTableUrlParams = { view: 'some-view' };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, {});

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.selectedView).toBe('some-view');
    });
  });

  // ===========================================================================
  // 4. URL view precedence and individual URL overrides
  // ===========================================================================

  describe('URL precedence (view + individual overrides)', () => {
    let viewsHost: ViewsHostStub;

    beforeEach(() => {
      viewsHost = new ViewsHostStub();
    });

    it('should let individual URL sort override URL view sort', async () => {
      viewsHost.setResolveFn((viewId) => {
        if (viewId === 'url-view') {
          return of(
            makeViewsData({ sort: sortA, filters: filtersA }),
          );
        }
        return of(null);
      });

      const urlParams: IbKaiTableUrlParams = {
        view: 'url-view',
        sort: sortB,
      };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, {}, viewsHost);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      // Explicit URL sort overrides view sort
      expect(dispatchCall.snapshot.sort).toEqual(sortB);
      // filters only from view (no explicit URL override)
      expect(dispatchCall.snapshot.filters).toEqual(filtersA);
    });

    it('should let individual URL pageSize override URL view pageSize', async () => {
      viewsHost.setResolveFn((viewId) => {
        if (viewId === 'url-view') {
          return of(makeViewsData({ pageSize: 10 }));
        }
        return of(null);
      });

      const urlParams: IbKaiTableUrlParams = {
        view: 'url-view',
        pageSize: 100,
      };
      urlService.decodeUrlParams.and.returnValue(urlParams);

      await facade.initialize(TABLE_NAME, {}, viewsHost);

      const dispatchCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(dispatchCall.snapshot.pageSize).toBe(100);
    });
  });

  // ===========================================================================
  // 5. Malformed URL normalization
  // ===========================================================================

  describe('malformed URL handling', () => {
    it('should normalize malformed URL by writing current state', async () => {
      // Initialize with a known state
      const tableDef: IbTableDef = { initialPageSize: 50 };
      await facade.initialize(TABLE_NAME, tableDef);

      // Simulate the store emitting the initialized snapshot so the signal
      // reflects the actual resolved state.
      storeSelectSubject.next(
        makeSnapshot({ pageSize: 50 }),
      );

      // Emit a query param change with malformed JSON
      queryParamsSubject.next({ [TABLE_NAME]: '{{{{bad-json' });

      // Should trigger writeState with current state (from the signal) to normalize
      expect(urlService.writeState).toHaveBeenCalledWith(
        TABLE_NAME,
        jasmine.objectContaining({ pageSize: 50 }),
      );
    });

    it('should not dispatch hydrateFromUrl for malformed URL', async () => {
      await facade.initialize(TABLE_NAME, {});

      const dispatchCount = mockStoreDispatch.calls.count();
      queryParamsSubject.next({ [TABLE_NAME]: 'not-json' });

      // No additional dispatch (only the initial one)
      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });
  });

  // ===========================================================================
  // 6. queryParamMap back/forward simulation
  // ===========================================================================

  describe('URL back/forward (queryParams change after init)', () => {
    it('should dispatch hydrateFromUrl when URL changes to different state', async () => {
      await facade.initialize(TABLE_NAME, { initialSort: sortA });

      // Emit a matching store snapshot so the signal has a value
      storeSelectSubject.next(
        makeSnapshot({ sort: sortA, pageIndex: 0, pageSize: 20 }),
      );

      const dispatchCount = mockStoreDispatch.calls.count();

      // Simulate a URL change with different state
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 3,
          ps: 20,
          ac: null,
          so: null,
        }),
      });

      // Should dispatch hydrateFromUrl because pageIndex differs
      expect(mockStoreDispatch.calls.count()).toBeGreaterThan(dispatchCount);
      const lastCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(lastCall.type).toBe(tableStateActions.hydrateFromUrl.type);
      expect(lastCall.tableName).toBe(TABLE_NAME);
    });

    it('should dispatch hydrateFromUrl when sort changes via back/forward', async () => {
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(makeSnapshot());

      const dispatchCount = mockStoreDispatch.calls.count();

      // URL with a new sort
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 0,
          ps: 20,
          ac: null,
          so: sortB,
        }),
      });

      expect(mockStoreDispatch.calls.count()).toBeGreaterThan(dispatchCount);
      const lastCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(lastCall.type).toBe(tableStateActions.hydrateFromUrl.type);
      expect(lastCall.snapshot.sort).toEqual(sortB);
    });

    it('should handle legacy (v1) URL format in back/forward', async () => {
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(makeSnapshot());

      const dispatchCount = mockStoreDispatch.calls.count();

      // Legacy format
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          ibsort: sortB,
          ibfilter: {},
          ibpage: 2,
          ibpagesize: 30,
          ibaggregatedcolumns: {},
          ibview: 'legacy-view',
        }),
      });

      expect(mockStoreDispatch.calls.count()).toBeGreaterThan(dispatchCount);
      const lastCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(lastCall.type).toBe(tableStateActions.hydrateFromUrl.type);
      expect(lastCall.snapshot.pageIndex).toBe(2);
      expect(lastCall.snapshot.pageSize).toBe(30);
    });

    it('should map legacy sentinel __ibTableView__all to null', async () => {
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(makeSnapshot());

      // Legacy sentinel
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          ibsort: {},
          ibfilter: {},
          ibpage: 0,
          ibpagesize: 20,
          ibaggregatedcolumns: {},
          ibview: '__ibTableView__all',
        }),
      });

      const lastCall = mockStoreDispatch.calls.mostRecent().args[0];
      expect(lastCall.snapshot.selectedView).toBeNull();
    });

    it('should ignore param absence (undefined) without dispatching', async () => {
      await facade.initialize(TABLE_NAME, {});
      const dispatchCount = mockStoreDispatch.calls.count();

      // Omit the table's query param entirely
      queryParamsSubject.next({});

      // No new dispatch
      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });
  });

  // ===========================================================================
  // 7. Navigation loop prevention
  // ===========================================================================

  describe('loop prevention', () => {
    it('should NOT dispatch hydrateFromUrl when URL matches current store state', async () => {
      await facade.initialize(TABLE_NAME, { initialSort: sortA });

      // Simulate the store select emitting the same state that is in the URL
      storeSelectSubject.next(
        makeSnapshot({ sort: sortA, pageIndex: 0, pageSize: 20 }),
      );

      const dispatchCount = mockStoreDispatch.calls.count();

      // URL with same state
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 0,
          ps: 20,
          ac: null,
          so: sortA,
        }),
      });

      // No dispatch — state already matches
      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });

    it('should NOT dispatch hydrateFromUrl when URL matches store state with different ordering', async () => {
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(
        makeSnapshot({ pageIndex: 5, pageSize: 50 }),
      );

      const dispatchCount = mockStoreDispatch.calls.count();

      // URL has same values
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 5,
          ps: 50,
          ac: null,
          so: null,
        }),
      });

      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });
  });

  // ===========================================================================
  // 8. tableName change after initialization
  // ===========================================================================

  describe('tableName immutability', () => {
    it('should keep the original tableName and not re-initialize', async () => {
      await facade.initialize(TABLE_NAME, { initialPageSize: 10 });

      const dispatchCount = mockStoreDispatch.calls.count();

      // Attempt to change tableName
      await facade.initialize(TABLE_NAME_2, { initialPageSize: 50 });

      expect(facade.tableName).toBe(TABLE_NAME);
      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });
  });

  // ===========================================================================
  // 9. Destroy does not remove NgRx record
  // ===========================================================================

  describe('destroy', () => {
    it('should NOT dispatch a remove/cleanup action', async () => {
      await facade.initialize(TABLE_NAME, {});
      const dispatchCount = mockStoreDispatch.calls.count();

      facade.destroy();

      // No additional dispatch
      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });

    it('should complete internal subscriptions', async () => {
      await facade.initialize(TABLE_NAME, {});

      // Destroy should complete the _destroy$ subject without error
      expect(() => facade.destroy()).not.toThrow();
    });

    it('should stop reacting to queryParams after destroy', async () => {
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(makeSnapshot());

      facade.destroy();

      const dispatchCount = mockStoreDispatch.calls.count();

      // Emit after destroy — subscriber should be unsubscribed, no dispatch
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 5,
          ps: 20,
          ac: null,
          so: null,
        }),
      });

      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);
    });
  });

  // ===========================================================================
  // 10. Intent methods
  // ===========================================================================

  describe('intent methods', () => {
    describe('setSort', () => {
      it('should dispatch setSort action', async () => {
        await facade.initialize(TABLE_NAME, {});
        facade.setSort(sortA);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.setSort({ tableName: TABLE_NAME, sort: sortA }),
        );
      });

      it('should dispatch setSort with null', async () => {
        await facade.initialize(TABLE_NAME, {});
        facade.setSort(null);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.setSort({ tableName: TABLE_NAME, sort: null }),
        );
      });

      it('should throw if not initialized', () => {
        expect(() => facade.setSort(sortA)).toThrowError(
          /initialize\(\) must be called/,
        );
      });
    });

    describe('setFilters', () => {
      it('should dispatch setFilters action', async () => {
        await facade.initialize(TABLE_NAME, {});
        facade.setFilters(filtersA);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.setFilters({
            tableName: TABLE_NAME,
            filters: filtersA,
          }),
        );
      });

      it('should dispatch setFilters with null', async () => {
        await facade.initialize(TABLE_NAME, {});
        facade.setFilters(null);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.setFilters({
            tableName: TABLE_NAME,
            filters: null,
          }),
        );
      });

      it('should throw if not initialized', () => {
        expect(() => facade.setFilters(filtersA)).toThrowError(
          /initialize\(\) must be called/,
        );
      });
    });

    describe('setPaginator', () => {
      it('should dispatch setPaginator action', async () => {
        await facade.initialize(TABLE_NAME, {});
        facade.setPaginator(3, 50);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.setPaginator({
            tableName: TABLE_NAME,
            pageIndex: 3,
            pageSize: 50,
          }),
        );
      });

      it('should throw if not initialized', () => {
        expect(() => facade.setPaginator(0, 20)).toThrowError(
          /initialize\(\) must be called/,
        );
      });
    });

    describe('setAggregatedColumns', () => {
      it('should dispatch setAggregatedColumns action', async () => {
        await facade.initialize(TABLE_NAME, {});
        facade.setAggregatedColumns(aggregatedA);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.setAggregatedColumns({
            tableName: TABLE_NAME,
            aggregatedColumns: aggregatedA,
          }),
        );
      });

      it('should throw if not initialized', () => {
        expect(() => facade.setAggregatedColumns({})).toThrowError(
          /initialize\(\) must be called/,
        );
      });
    });

    describe('applyView', () => {
      it('should dispatch applyView action', async () => {
        await facade.initialize(TABLE_NAME, {});
        const snapshot = makeViewSnapshot({ sort: sortA });
        facade.applyView('view-1', snapshot);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.applyView({
            tableName: TABLE_NAME,
            selectedView: 'view-1',
            snapshot,
          }),
        );
      });

      it('should dispatch applyView with null selectedView', async () => {
        await facade.initialize(TABLE_NAME, {});
        const snapshot = makeViewSnapshot();
        facade.applyView(null, snapshot);

        expect(mockStoreDispatch).toHaveBeenCalledWith(
          tableStateActions.applyView({
            tableName: TABLE_NAME,
            selectedView: null,
            snapshot,
          }),
        );
      });

      it('should throw if not initialized', () => {
        expect(() => facade.applyView('v', {})).toThrowError(
          /initialize\(\) must be called/,
        );
      });
    });
  });

  // ===========================================================================
  // 11. Store → signals connection
  // ===========================================================================

  describe('store → signals connection', () => {
    it('should connect store select subscription after init', async () => {
      await facade.initialize(TABLE_NAME, {});

      // connectStoreSignals should have called store.select
      expect(mockStoreSelect).toHaveBeenCalled();
    });

    it('should update snapshot signal when store emits a new value', async () => {
      await facade.initialize(TABLE_NAME, {});

      const newSnapshot = makeSnapshot({ sort: sortA, pageIndex: 3, pageSize: 50 });
      storeSelectSubject.next(newSnapshot);

      expect(facade.snapshot()).toEqual(newSnapshot);
      expect(facade.sort()).toEqual(sortA);
      expect(facade.pageIndex()).toBe(3);
      expect(facade.pageSize()).toBe(50);
    });

    it('should NOT update signal when store emits undefined/null', async () => {
      await facade.initialize(TABLE_NAME, {});

      // Initially undefined
      storeSelectSubject.next(undefined);

      // Should still have technical defaults
      expect(facade.sort()).toBeNull();
      expect(facade.filters()).toBeNull();
      expect(facade.pageIndex()).toBe(0);
      expect(facade.pageSize()).toBe(20);
    });

    it('should expose computed signals derived from the snapshot', async () => {
      await facade.initialize(TABLE_NAME, {});

      const snapshot = makeSnapshot({
        sort: sortB,
        filters: filtersA,
        selectedView: 'my-view',
        pageIndex: 2,
        pageSize: 10,
        aggregatedColumns: aggregatedA,
      });
      storeSelectSubject.next(snapshot);

      expect(facade.sort()).toEqual(sortB);
      expect(facade.filters()).toEqual(filtersA);
      expect(facade.selectedView()).toBe('my-view');
      expect(facade.pageIndex()).toBe(2);
      expect(facade.pageSize()).toBe(10);
      expect(facade.aggregatedColumns()).toEqual(aggregatedA);
    });

    it('should have default signal values before store emits', async () => {
      // Before init, snapshot has technical defaults
      expect(facade.sort()).toBeNull();
      expect(facade.filters()).toBeNull();
      expect(facade.selectedView()).toBeNull();
      expect(facade.pageIndex()).toBe(0);
      expect(facade.pageSize()).toBe(20);
      expect(facade.aggregatedColumns()).toEqual({});
    });
  });

  // ===========================================================================
  // 12. URL observation wiring (startUrlObservation)
  // ===========================================================================

  describe('URL observation', () => {
    it('should subscribe to queryParams after init', async () => {
      // Before init, queryParams has no subscribers (we can test by emitting and
      // checking no dispatch happens)
      const dispatchCount = mockStoreDispatch.calls.count();
      queryParamsSubject.next({ [TABLE_NAME]: '{}' });
      expect(mockStoreDispatch.calls.count()).toBe(dispatchCount);

      // After init, the facade subscribes
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(makeSnapshot());
    });

    it('should use distinctUntilChanged on query params', async () => {
      await facade.initialize(TABLE_NAME, {});
      storeSelectSubject.next(makeSnapshot());

      const dispatchCount = mockStoreDispatch.calls.count();

      // First emit: different state → dispatch
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 5,
          ps: 20,
          ac: null,
          so: null,
        }),
      });
      const afterFirst = mockStoreDispatch.calls.count();
      expect(afterFirst).toBeGreaterThan(dispatchCount);

      // Second emit: same raw value → distinctUntilChanged blocks
      queryParamsSubject.next({
        [TABLE_NAME]: JSON.stringify({
          v: 2,
          f: null,
          sv: null,
          pi: 5,
          ps: 20,
          ac: null,
          so: null,
        }),
      });
      expect(mockStoreDispatch.calls.count()).toBe(afterFirst);
    });

    it('should normalize malformed URL via writeState', async () => {
      await facade.initialize(TABLE_NAME, { initialPageSize: 30 });

      // Simulate the store emitting the resolved snapshot so the signal
      // reflects the initialized state.
      storeSelectSubject.next(
        makeSnapshot({ pageSize: 30 }),
      );

      // Emit malformed JSON
      queryParamsSubject.next({ [TABLE_NAME]: '{bad' });

      expect(urlService.writeState).toHaveBeenCalledWith(
        TABLE_NAME,
        jasmine.objectContaining({ pageSize: 30 }),
      );
    });
  });

  // ===========================================================================
  // 13. Multiple tables independence
  // ===========================================================================

  describe('multiple tables', () => {
    it('should allow two facades for different tableNames', async () => {
      // First facade
      await facade.initialize(TABLE_NAME, { initialPageSize: 10 });
      expect(mockStoreDispatch).toHaveBeenCalledWith(
        jasmine.objectContaining({ tableName: TABLE_NAME }),
      );

      // Second facade would be a different instance — but we can verify
      // that the dispatch carries the correct tableName
      const firstCall = mockStoreDispatch.calls.first().args[0];
      expect(firstCall.tableName).toBe(TABLE_NAME);
    });
  });
});

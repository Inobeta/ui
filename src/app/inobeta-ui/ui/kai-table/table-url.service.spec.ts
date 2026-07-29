import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Sort } from '@angular/material/sort';
import { IbTableUrlService } from './table-url.service';
import { IbKaiTableSnapshot } from './table.types';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('IbTableUrlService', () => {

  // -----------------------------------------------------------------------
  // Fixtures
  // -----------------------------------------------------------------------
  const sortA: Sort = { active: 'name', direction: 'asc' };
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

  // -----------------------------------------------------------------------
  // Service tests (TestBed)
  // -----------------------------------------------------------------------
  describe('with Angular Router', () => {
    let service: IbTableUrlService;
    let router: Router;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([])],
        providers: [IbTableUrlService],
      });

      service = TestBed.inject(IbTableUrlService);
      router = TestBed.inject(Router);
    });

    // =======================================================================
    // writeState
    // =======================================================================
    describe('writeState', () => {

      it('should navigate with the full v2 payload in queryParams', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const snapshot = makeSnapshot({
          sort: sortA,
          pageIndex: 3,
          pageSize: 50,
        });

        service.writeState(TABLE_A, snapshot);

        expect(navigateSpy).toHaveBeenCalled();

        const callArgs = navigateSpy.calls.mostRecent().args[0] as any[];
        expect(callArgs).toEqual([]); // navigate to the same route

        const navigationExtras = navigateSpy.calls.mostRecent().args[1] as any;
        expect(navigationExtras.queryParamsHandling).toBe('merge');
        expect(navigationExtras.replaceUrl).toBe(true);

        const payload = navigationExtras.queryParams[TABLE_A];
        expect(payload).toBeDefined();

        // Parse and verify v2 structure
        const parsed = JSON.parse(payload);
        expect(parsed.v).toBe(2);
        expect(parsed.so).toEqual(sortA);
        expect(parsed.pi).toBe(3);
        expect(parsed.ps).toBe(50);
        // The encoded v2 uses compact field names
        expect('f' in parsed).toBeTrue();
        expect('sv' in parsed).toBeTrue();
        expect('pi' in parsed).toBeTrue();
        expect('ps' in parsed).toBeTrue();
        expect('ac' in parsed).toBeTrue();
        expect('so' in parsed).toBeTrue();
      });

      it('should write null for empty aggregatedColumns', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const snapshot = makeSnapshot({ aggregatedColumns: {} });

        service.writeState(TABLE_A, snapshot);

        const navigationExtras = navigateSpy.calls.mostRecent().args[1] as any;
        const parsed = JSON.parse(navigationExtras.queryParams[TABLE_A]);
        expect(parsed.ac).toBeNull();
      });

      it('should never write __ibTableView__all', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const snapshot = makeSnapshot({ selectedView: null });

        service.writeState(TABLE_A, snapshot);

        const navigationExtras = navigateSpy.calls.mostRecent().args[1] as any;
        const payload = navigationExtras.queryParams[TABLE_A];
        expect(payload).not.toContain('__ibTableView__all');
      });

      it('should write selectedView=null as sv:null in v2', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const snapshot = makeSnapshot({ selectedView: null });

        service.writeState(TABLE_A, snapshot);

        const navigationExtras = navigateSpy.calls.mostRecent().args[1] as any;
        const parsed = JSON.parse(navigationExtras.queryParams[TABLE_A]);
        expect(parsed.sv).toBeNull();
      });

      it('should isolate queryParams per tableName (merge preserves other params)', () => {
        const navigateSpy = spyOn(router, 'navigate');
        const snapshotA = makeSnapshot({ pageIndex: 1 });
        const snapshotB = makeSnapshot({ pageIndex: 2 });

        service.writeState(TABLE_A, snapshotA);

        // The navigation extras should only set the TABLE_A key
        const extrasA = navigateSpy.calls.mostRecent().args[1] as any;
        expect(Object.keys(extrasA.queryParams)).toEqual([TABLE_A]);
      });
    });

    // =======================================================================
    // decodeUrlParams
    // =======================================================================
    describe('decodeUrlParams', () => {

      it('should decode a v2 payload from the URL snapshot', () => {
        const v2Payload = JSON.stringify({
          v: 2,
          f: filtersA,
          sv: 'view-1',
          pi: 3,
          ps: 50,
          ac: aggregatedA,
          so: sortA,
        });

        // Set up the query params in the route snapshot
        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = { [TABLE_A]: v2Payload };

        const params = service.decodeUrlParams(TABLE_A)!;

        expect(params.filters).toEqual(filtersA);
        expect(params.view).toBe('view-1');
        expect(params.pageIndex).toBe(3);
        expect(params.pageSize).toBe(50);
        expect(params.aggregatedColumns).toEqual(aggregatedA);
        expect(params.sort).toEqual(sortA);
      });

      it('should decode a legacy payload from the URL snapshot', () => {
        const legacyPayload = JSON.stringify({
          ibview: 'legacy-view',
          ibpage: 7,
          ibpagesize: 100,
          ibfilter: filtersA,
          ibsort: sortA,
        });

        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = { [TABLE_A]: legacyPayload };

        const params = service.decodeUrlParams(TABLE_A)!;

        expect(params.view).toBe('legacy-view');
        expect(params.pageIndex).toBe(7);
        expect(params.pageSize).toBe(100);
        expect(params.filters).toEqual(filtersA);
        expect(params.sort).toEqual(sortA);
      });

      it('should map legacy sentinel to null', () => {
        const legacyPayload = JSON.stringify({
          ibview: '__ibTableView__all',
        });

        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = { [TABLE_A]: legacyPayload };

        const params = service.decodeUrlParams(TABLE_A)!;

        expect(params.view).toBeNull();
      });

      it('should return null when no query param exists for the table', () => {
        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = {};

        const params = service.decodeUrlParams(TABLE_A);

        expect(params).toBeNull();
      });

      it('should return null for malformed JSON in query param', () => {
        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = { [TABLE_A]: 'not-json' };

        const params = service.decodeUrlParams(TABLE_A);

        expect(params).toBeNull();
      });

      it('should distinguish absent keys from null in v2 payload', () => {
        // Only sort is present in this partial v2 payload
        const partialV2 = JSON.stringify({
          v: 2,
          so: sortA,
        });

        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = { [TABLE_A]: partialV2 };

        const params = service.decodeUrlParams(TABLE_A)!;

        expect(params.sort).toEqual(sortA);
        // Other keys should be absent
        expect('filters' in params).toBeFalse();
        expect('pageIndex' in params).toBeFalse();
      });

      it('should isolate query params per tableName', () => {
        const v2PayloadA = JSON.stringify({
          v: 2,
          pi: 3,
        });
        const v2PayloadB = JSON.stringify({
          v: 2,
          pi: 7,
        });

        const route = TestBed.inject(ActivatedRoute);
        (route.snapshot as any).queryParams = {
          [TABLE_A]: v2PayloadA,
          [TABLE_B]: v2PayloadB,
        };

        const paramsA = service.decodeUrlParams(TABLE_A)!;
        const paramsB = service.decodeUrlParams(TABLE_B)!;

        expect(paramsA.pageIndex).toBe(3);
        expect(paramsB.pageIndex).toBe(7);
      });
    });
  });
});

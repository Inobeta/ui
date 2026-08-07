import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Sort } from '@angular/material/sort';
import { IbTableUrlService } from './table-url.service';
import { IbKaiTableSnapshot } from './table.types';

describe('IbTableUrlService', () => {
  const TABLE_A = 'table-a';
  const TABLE_B = 'table-b';
  const sortA: Sort = { active: 'name', direction: 'asc' };
  const filtersA = { search: 'hello' };
  const aggregatedA = { colA: 'sum' };

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

  let service: IbTableUrlService;
  let router: Router;

  function latestNavigationExtras(navigateSpy: jasmine.Spy): NavigationExtras {
    return navigateSpy.calls.mostRecent().args[1] as NavigationExtras;
  }

  function setRouteQueryParams(route: ActivatedRoute, queryParams: Params): void {
    Object.assign(route.snapshot, { queryParams });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [IbTableUrlService],
    });
    service = TestBed.inject(IbTableUrlService);
    router = TestBed.inject(Router);
  });

  it('writes complete canonical v2 state', () => {
    const navigateSpy = spyOn(router, 'navigate');
    service.writeState(TABLE_A, makeSnapshot({
      sort: sortA,
      filters: filtersA,
      selectedView: 'view-1',
      pageIndex: 3,
      pageSize: 50,
      aggregatedColumns: aggregatedA,
    }));

    const extras = latestNavigationExtras(navigateSpy);
    expect(extras.queryParamsHandling).toBe('merge');
    expect(extras.replaceUrl).toBeTrue();
    expect(JSON.parse(extras.queryParams[TABLE_A])).toEqual({
      v: 2,
      f: filtersA,
      sv: 'view-1',
      pi: 3,
      ps: 50,
      ac: aggregatedA,
      so: sortA,
    });
  });

  it('encodes canonical empty values as null and never writes removed sentinels', () => {
    const navigateSpy = spyOn(router, 'navigate');
    service.writeState(TABLE_A, makeSnapshot());
    const payload = JSON.parse(latestNavigationExtras(navigateSpy).queryParams![TABLE_A]);
    expect(payload.sv).toBeNull();
    expect(payload.ac).toBeNull();
    expect(JSON.stringify(payload)).not.toContain('__ibTableView__all');
  });

  it('decodes canonical v2 payload from route snapshot', () => {
    const route = TestBed.inject(ActivatedRoute);
    setRouteQueryParams(route, {
      [TABLE_A]: JSON.stringify({ v: 2, f: filtersA, sv: 'view-1', pi: 3, ps: 50, ac: aggregatedA, so: sortA }),
    });
    expect(service.decodeUrlParams(TABLE_A)).toEqual({
      filters: filtersA,
      view: 'view-1',
      pageIndex: 3,
      pageSize: 50,
      aggregatedColumns: aggregatedA,
      sort: sortA,
    });
  });

  it('preserves absent keys and isolates table names when decoding', () => {
    const route = TestBed.inject(ActivatedRoute);
    setRouteQueryParams(route, {
      [TABLE_A]: JSON.stringify({ v: 2, so: sortA, pi: 3 }),
      [TABLE_B]: JSON.stringify({ v: 2, pi: 7 }),
    });
    const params = service.decodeUrlParams(TABLE_A)!;
    expect(params.sort).toEqual(sortA);
    expect(params.pageIndex).toBe(3);
    expect('filters' in params).toBeFalse();
    expect(service.decodeUrlParams(TABLE_B)!.pageIndex).toBe(7);
  });

  it('returns null for missing or malformed URL state', () => {
    const route = TestBed.inject(ActivatedRoute);
    setRouteQueryParams(route, {});
    expect(service.decodeUrlParams(TABLE_A)).toBeNull();
    setRouteQueryParams(route, { [TABLE_A]: 'not-json' });
    expect(service.decodeUrlParams(TABLE_A)).toBeNull();
  });
});

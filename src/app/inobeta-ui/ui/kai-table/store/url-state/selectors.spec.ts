import { Sort } from '@angular/material/sort';
import {
  selectTables,
  selectIbKaiTableRecord,
  selectIbKaiTableSnapshot,
  selectTableSort,
  selectTableFilters,
  selectTablePageIndex,
  selectTablePageSize,
  selectTableSelectedView,
  selectTableAggregatedColumns,
  selectTableInitialized,
  ibTableSelectUrlState,
  ibTableSelectLastQueryStringRaw,
  ibTableSelectLastQueryString,
} from '../../store';
import { IbKaiTableRecord, IUrlStateState } from './interfaces';
import { IbKaiTableSnapshot } from '../../table.types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const sortA: Sort = { active: 'name', direction: 'asc' };
const filtersA = { search: 'hello' };
const aggregatedA: Record<string, string> = { colA: 'sum', colB: 'avg' };
const TABLE_A = 'table-a';
const TABLE_B = 'table-b';

function makeRecord(overrides: Partial<IbKaiTableRecord> & { tableName: string }): IbKaiTableRecord {
  return {
    initialized: true,
    sort: null,
    filters: null,
    selectedView: null,
    pageIndex: 0,
    pageSize: 20,
    aggregatedColumns: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ibKaiTable selectors', () => {

  // ===========================================================================
  // 1. selectTables (auto-generated)
  // ===========================================================================

  describe('selectTables', () => {

    it('should return empty object for empty state', () => {
      const state: IUrlStateState = { tables: {} };
      const result = selectTables.projector(state);
      expect(result).toEqual({});
    });

    it('should return the tables dictionary', () => {
      const record = makeRecord({ tableName: TABLE_A });
      const state: IUrlStateState = { tables: { [TABLE_A]: record } };
      const result = selectTables.projector(state);
      expect(result).toEqual({ [TABLE_A]: record });
    });
  });

  // ===========================================================================
  // 2. selectIbKaiTableRecord
  // ===========================================================================

  describe('selectIbKaiTableRecord', () => {

    it('should return the record for a given tableName', () => {
      const record = makeRecord({
        tableName: TABLE_A,
        sort: sortA,
        pageIndex: 3,
      });
      const tables = { [TABLE_A]: record };
      const result = selectIbKaiTableRecord(TABLE_A).projector(tables);
      expect(result).toEqual(record);
    });

    it('should return undefined for an unknown tableName', () => {
      const tables: Record<string, IbKaiTableRecord> = {};
      const result = selectIbKaiTableRecord('unknown').projector(tables);
      expect(result).toBeUndefined();
    });

    it('should return the correct record when multiple tables exist', () => {
      const recordA = makeRecord({ tableName: TABLE_A, sort: sortA });
      const recordB = makeRecord({ tableName: TABLE_B, pageIndex: 7 });
      const tables = { [TABLE_A]: recordA, [TABLE_B]: recordB };

      expect(selectIbKaiTableRecord(TABLE_A).projector(tables)).toEqual(recordA);
      expect(selectIbKaiTableRecord(TABLE_B).projector(tables)).toEqual(recordB);
    });
  });

  // ===========================================================================
  // 3. selectIbKaiTableSnapshot
  // ===========================================================================

  describe('selectIbKaiTableSnapshot', () => {

    it('should return the full snapshot for a record', () => {
      const record = makeRecord({
        tableName: TABLE_A,
        sort: sortA,
        filters: filtersA,
        selectedView: 'view-1',
        pageIndex: 3,
        pageSize: 50,
        aggregatedColumns: aggregatedA,
      });

      const result = selectIbKaiTableSnapshot(TABLE_A).projector(record);
      expect(result).toEqual({
        sort: sortA,
        filters: filtersA,
        selectedView: 'view-1',
        pageIndex: 3,
        pageSize: 50,
        aggregatedColumns: aggregatedA,
      });
    });

    it('should return undefined when record is undefined', () => {
      const result = selectIbKaiTableSnapshot(TABLE_A).projector(undefined);
      expect(result).toBeUndefined();
    });

    it('should return a snapshot with nulls for null record fields', () => {
      const record = makeRecord({ tableName: TABLE_A });
      const result = selectIbKaiTableSnapshot(TABLE_A).projector(record);
      expect(result).toBeDefined();
      expect(result!.sort).toBeNull();
      expect(result!.filters).toBeNull();
      expect(result!.selectedView).toBeNull();
    });
  });

  // ===========================================================================
  // 4. Granular selectors
  // ===========================================================================

  describe('selectTableSort', () => {

    it('should return sort from the record', () => {
      const record = makeRecord({ tableName: TABLE_A, sort: sortA });
      const result = selectTableSort(TABLE_A).projector(record);
      expect(result).toEqual(sortA);
    });

    it('should return null when sort is null', () => {
      const record = makeRecord({ tableName: TABLE_A, sort: null });
      const result = selectTableSort(TABLE_A).projector(record);
      expect(result).toBeNull();
    });

    it('should return null when record is undefined', () => {
      const result = selectTableSort(TABLE_A).projector(undefined);
      expect(result).toBeNull();
    });
  });

  describe('selectTableFilters', () => {

    it('should return filters from the record', () => {
      const record = makeRecord({ tableName: TABLE_A, filters: filtersA });
      const result = selectTableFilters(TABLE_A).projector(record);
      expect(result).toEqual(filtersA);
    });

    it('should return null when filters is null', () => {
      const record = makeRecord({ tableName: TABLE_A, filters: null });
      const result = selectTableFilters(TABLE_A).projector(record);
      expect(result).toBeNull();
    });

    it('should return null when record is undefined', () => {
      const result = selectTableFilters(TABLE_A).projector(undefined);
      expect(result).toBeNull();
    });
  });

  describe('selectTablePageIndex', () => {

    it('should return pageIndex from the record', () => {
      const record = makeRecord({ tableName: TABLE_A, pageIndex: 5 });
      const result = selectTablePageIndex(TABLE_A).projector(record);
      expect(result).toBe(5);
    });

    it('should return 0 when record is undefined', () => {
      const result = selectTablePageIndex(TABLE_A).projector(undefined);
      expect(result).toBe(0);
    });
  });

  describe('selectTablePageSize', () => {

    it('should return pageSize from the record', () => {
      const record = makeRecord({ tableName: TABLE_A, pageSize: 50 });
      const result = selectTablePageSize(TABLE_A).projector(record);
      expect(result).toBe(50);
    });

    it('should return 20 when record is undefined', () => {
      const result = selectTablePageSize(TABLE_A).projector(undefined);
      expect(result).toBe(20);
    });
  });

  describe('selectTableSelectedView', () => {

    it('should return selectedView from the record', () => {
      const record = makeRecord({ tableName: TABLE_A, selectedView: 'my-view' });
      const result = selectTableSelectedView(TABLE_A).projector(record);
      expect(result).toBe('my-view');
    });

    it('should return null when selectedView is null', () => {
      const record = makeRecord({ tableName: TABLE_A, selectedView: null });
      const result = selectTableSelectedView(TABLE_A).projector(record);
      expect(result).toBeNull();
    });

    it('should return null when record is undefined', () => {
      const result = selectTableSelectedView(TABLE_A).projector(undefined);
      expect(result).toBeNull();
    });
  });

  describe('selectTableAggregatedColumns', () => {

    it('should return aggregatedColumns from the record', () => {
      const record = makeRecord({ tableName: TABLE_A, aggregatedColumns: aggregatedA });
      const result = selectTableAggregatedColumns(TABLE_A).projector(record);
      expect(result).toEqual(aggregatedA);
    });

    it('should return empty object when record is undefined', () => {
      const result = selectTableAggregatedColumns(TABLE_A).projector(undefined);
      expect(result).toEqual({});
    });
  });

  describe('selectTableInitialized', () => {

    it('should return true when initialized=true', () => {
      const record = makeRecord({ tableName: TABLE_A, initialized: true });
      const result = selectTableInitialized(TABLE_A).projector(record);
      expect(result).toBe(true);
    });

    it('should return false when initialized=false', () => {
      const record = makeRecord({ tableName: TABLE_A, initialized: false });
      const result = selectTableInitialized(TABLE_A).projector(record);
      expect(result).toBe(false);
    });

    it('should return false when record is undefined', () => {
      const result = selectTableInitialized(TABLE_A).projector(undefined);
      expect(result).toBe(false);
    });
  });

  // ===========================================================================
  // 5. Legacy ibTableSelectUrlState
  // ===========================================================================

  describe('ibTableSelectUrlState (legacy)', () => {

    it('should map a record to the legacy named params shape', () => {
      const record = makeRecord({
        tableName: TABLE_A,
        sort: sortA,
        filters: filtersA,
        selectedView: 'my-view',
        pageIndex: 3,
        pageSize: 50,
        aggregatedColumns: aggregatedA,
      });

      const result = ibTableSelectUrlState(TABLE_A).projector({ [TABLE_A]: record });
      expect(result).toBeDefined();
      expect(result!.tableName).toBe(TABLE_A);
      expect(result!.view).toBe('my-view');
      expect(result!.page).toBe(3);
      expect(result!.pageSize).toBe(50);
      expect(result!.aggregatedColumns).toEqual(aggregatedA);
      expect((result!.sort as Sort).active).toBe(sortA.active);
      expect((result!.sort as Sort).direction).toBe(sortA.direction);
    });

    it('should return undefined for a missing table', () => {
      const result = ibTableSelectUrlState(TABLE_A).projector({});
      expect(result).toBeUndefined();
    });

    it('should map selectedView=null to view=undefined', () => {
      const record = makeRecord({ tableName: TABLE_A, selectedView: null });
      const result = ibTableSelectUrlState(TABLE_A).projector({ [TABLE_A]: record });
      expect(result!.view).toBeUndefined();
    });

    it('should map sort=null to empty sort object', () => {
      const record = makeRecord({ tableName: TABLE_A, sort: null });
      const result = ibTableSelectUrlState(TABLE_A).projector({ [TABLE_A]: record });
      expect(result!.sort).toEqual({ active: '', direction: '' });
    });
  });

  // ===========================================================================
  // 6. Legacy ibTableSelectLastQueryStringRaw
  // ===========================================================================

  describe('ibTableSelectLastQueryStringRaw (legacy)', () => {

    it('should map legacy params to the IbTableQsParams shape', () => {
      const legacyParams = {
        tableName: TABLE_A,
        view: 'my-view',
        page: 3,
        pageSize: 50,
        filters: filtersA as never,
        aggregatedColumns: aggregatedA,
        sort: sortA,
      };

      const result = ibTableSelectLastQueryStringRaw(TABLE_A).projector(legacyParams);
      expect(result.ibview).toBe('my-view');
      expect(result.ibpage).toBe(3);
      expect(result.ibpagesize).toBe(50);
      // ibfilter is cast as never to match the legacy IbTableQsParams type
      expect(result.ibfilter).toBe(filtersA as never);
      expect(result.ibaggregatedcolumns).toEqual(aggregatedA);
      expect(result.ibsort).toEqual(sortA as never);
    });

    it('should return undefined values when input is undefined', () => {
      const result = ibTableSelectLastQueryStringRaw(TABLE_A).projector(undefined);
      expect(result.ibview).toBeUndefined();
      expect(result.ibpage).toBeUndefined();
      expect(result.ibpagesize).toBeUndefined();
    });
  });

  // ===========================================================================
  // 7. Legacy ibTableSelectLastQueryString
  // ===========================================================================

  describe('ibTableSelectLastQueryString (legacy)', () => {

    it('should return a JSON string', () => {
      const qsParams = {
        ibfilter: filtersA,
        ibpage: 3,
        ibpagesize: 50,
        ibaggregatedcolumns: aggregatedA,
        ibsort: sortA,
        ibview: 'my-view',
      } as never;

      const result = ibTableSelectLastQueryString(TABLE_A).projector(qsParams);
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.ibview).toBe('my-view');
      expect(parsed.ibpage).toBe(3);
      expect(parsed.ibpagesize).toBe(50);
      expect(parsed.ibsort).toEqual(sortA);
    });

    it('should produce valid JSON', () => {
      const qsParams = {
        ibfilter: {},
        ibpage: 0,
        ibpagesize: 20,
        ibaggregatedcolumns: {},
        ibsort: { active: '', direction: '' },
        ibview: '__ibTableView__all',
      } as never;

      const result = ibTableSelectLastQueryString(TABLE_A).projector(qsParams);
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});

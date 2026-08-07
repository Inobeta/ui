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
} from '../../store';
import { IbKaiTableRecord, IUrlStateState } from './interfaces';

describe('ibKaiTable canonical selectors', () => {
  const TABLE_A = 'table-a';
  const TABLE_B = 'table-b';
  const sortA: Sort = { active: 'name', direction: 'asc' };
  const filtersA = { search: 'hello' };
  const aggregatedA = { colA: 'sum', colB: 'avg' };

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

  it('selects table records and handles missing tables', () => {
    const record = makeRecord({ tableName: TABLE_A, sort: sortA });
    const tables = { [TABLE_A]: record, [TABLE_B]: makeRecord({ tableName: TABLE_B }) };
    expect(selectTables.projector({ tables } as IUrlStateState)).toEqual(tables);
    expect(selectIbKaiTableRecord(TABLE_A).projector(tables)).toEqual(record);
    expect(selectIbKaiTableRecord('missing').projector(tables)).toBeUndefined();
  });

  it('selects complete canonical snapshot', () => {
    const record = makeRecord({
      tableName: TABLE_A,
      sort: sortA,
      filters: filtersA,
      selectedView: 'view-1',
      pageIndex: 3,
      pageSize: 50,
      aggregatedColumns: aggregatedA,
    });
    expect(selectIbKaiTableSnapshot(TABLE_A).projector(record)).toEqual({
      sort: sortA,
      filters: filtersA,
      selectedView: 'view-1',
      pageIndex: 3,
      pageSize: 50,
      aggregatedColumns: aggregatedA,
    });
    expect(selectIbKaiTableSnapshot(TABLE_A).projector(undefined)).toBeUndefined();
  });

  it('selects canonical sort and filter values', () => {
    const record = makeRecord({ tableName: TABLE_A, sort: sortA, filters: filtersA });
    expect(selectTableSort(TABLE_A).projector(record)).toEqual(sortA);
    expect(selectTableFilters(TABLE_A).projector(record)).toEqual(filtersA);
    expect(selectTableSort(TABLE_A).projector(undefined)).toBeNull();
    expect(selectTableFilters(TABLE_A).projector(undefined)).toBeNull();
  });

  it('selects canonical pagination, view, aggregation, and initialization', () => {
    const record = makeRecord({
      tableName: TABLE_A,
      pageIndex: 5,
      pageSize: 50,
      selectedView: 'my-view',
      aggregatedColumns: aggregatedA,
      initialized: true,
    });
    expect(selectTablePageIndex(TABLE_A).projector(record)).toBe(5);
    expect(selectTablePageSize(TABLE_A).projector(record)).toBe(50);
    expect(selectTableSelectedView(TABLE_A).projector(record)).toBe('my-view');
    expect(selectTableAggregatedColumns(TABLE_A).projector(record)).toEqual(aggregatedA);
    expect(selectTableInitialized(TABLE_A).projector(record)).toBeTrue();
    expect(selectTablePageIndex(TABLE_A).projector(undefined)).toBe(0);
    expect(selectTablePageSize(TABLE_A).projector(undefined)).toBe(20);
    expect(selectTableSelectedView(TABLE_A).projector(undefined)).toBeNull();
    expect(selectTableAggregatedColumns(TABLE_A).projector(undefined)).toEqual({});
    expect(selectTableInitialized(TABLE_A).projector(undefined)).toBeFalse();
  });
});

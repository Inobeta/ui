import { IbFilterSyntaxExtended } from '../kai-filter';
import { applyFilter, contains } from '../kai-filter/filters';
import { IbAggregateResult } from './cells';
import { IbColumn } from './columns/column';

type TablePipelineSort = { active?: string; direction?: string };

export function filterRows(
  data: unknown[],
  filters: IbFilterSyntaxExtended | null | undefined,
  columnsMap: Record<string, IbColumn<unknown>>
): unknown[] {
  if (!filters) return data;
  return data.filter((r) => filterRow(r, filters, columnsMap));
}

function filterRow(
  row: unknown,
  filters: IbFilterSyntaxExtended | undefined,
  columnsMap: Record<string, IbColumn<unknown>>
): boolean {
  const { ibSearchBar, ...rest } = (filters || {});
  const matchesSearchBar = applySearchBarFilterLocal(row, ibSearchBar, columnsMap);
  const matches = Object.entries(rest || {}).every(([columnName, condition]) => {
    const column = columnsMap[columnName];
    if (!column) {
      throw Error(`ib-filter: column ${columnName} not found`);
    }

    const filterValue = column.filterDataAccessor(row, columnName);
    return applyFilter(condition as any, filterValue);
  });
  return matches && matchesSearchBar;
}

function applySearchBarFilterLocal(
  data: unknown,
  filter: string | undefined,
  columnsMap: Record<string, IbColumn<unknown>>
): boolean {
  if (!filter) return true;
  const dataStr = Object.keys(data as Record<string, any>)
    .reduce((currentTerm: string, key: string) => {
      const column = columnsMap[key];
      const value = column ? column.filterDataAccessor(data, key) : (data as any)[key];
      return currentTerm + value + '◬';
    }, '')
    .toLowerCase();
  return applyFilter(contains(filter), dataStr);
}

export function sortRows(
  data: unknown[],
  sort: TablePipelineSort | undefined | null,
  columnsMap: Record<string, IbColumn<unknown>>
): unknown[] {
  if (!sort || !sort.active || !sort.direction) return data;
  const column = columnsMap[sort.active];
  if (!column) return data;
  return (data as unknown[]).slice().sort((a: unknown, b: unknown) => sortRow(a, b, sort, column));
}

function sortRow(a: unknown, b: unknown, sort: TablePipelineSort, column: IbColumn<unknown>): number {
  let valueA = column.sortingDataAccessor(a as any, sort.active as string);
  let valueB = column.sortingDataAccessor(b as any, sort.active as string);
  const valueAType = typeof valueA;
  const valueBType = typeof valueB;
  if (valueAType !== valueBType) {
    if (valueAType === 'number') valueA = valueA + '';
    if (valueBType === 'number') valueB = valueB + '';
  }
  let comparatorResult = 0;
  if (valueA != null && valueB != null) {
    if (valueA > valueB) comparatorResult = 1;
    else if (valueA < valueB) comparatorResult = -1;
  } else if (valueA != null) comparatorResult = 1;
  else if (valueB != null) comparatorResult = -1;
  return comparatorResult * (sort.direction === 'asc' ? 1 : -1);
}

export function pageRows(data: unknown[], pageIndex: number, pageSize: number): unknown[] {
  return data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
}

export function computeAggregations(
  data: unknown[],
  pageIndex: number,
  pageSize: number,
  aggregatedColumns: Record<string, string> | undefined | null,
  aggregationFunctions: Array<{ id: string; aggregateData(vals: unknown[]): unknown }> | undefined | null,
  existing: Record<string, IbAggregateResult> | undefined | null,
): Record<string, IbAggregateResult> {
  const result: Record<string, IbAggregateResult> = {};
  if (!aggregatedColumns || !aggregationFunctions) return { ...(existing || {}), ...result };
  const start = (pageIndex ?? 0) * (pageSize ?? 0);
  for (const [columnName, fun] of Object.entries(aggregatedColumns)) {
    const f = (aggregationFunctions || []).find((x: any) => x.id === fun);
    if (!f) continue;
    const allVals = (data || []).map((i: any) => (i as any)[columnName]);
    const pageVals = (data || []).slice(start, start + (pageSize ?? 0)).map((i: any) => (i as any)[columnName]);
    result[columnName] = {
      ...(existing && existing[columnName] ? existing[columnName] : {}),
      total: f.aggregateData(allVals),
      currentPage: f.aggregateData(pageVals),
    } as IbAggregateResult;
  }
  return { ...(existing || {}), ...result };
}

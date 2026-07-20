import { DataSource } from "@angular/cdk/collections";
import { Sort } from "@angular/material/sort";
import { BehaviorSubject, Observable } from "rxjs";
import { applyFilter } from "../kai-filter/filters";
import { IbFilterDef } from "../kai-filter/filter.types";
import { IbAggregate, IbAggregateResult } from "./cells";
import { IbColumn } from "./columns";
import {
  IB_LOCAL_DS_DEFAULT_INPUT,
  IbDataSourceCapability,
  IbLocalDataSourceInput,
} from "./data-source.types";

/**
 * Client-side table data source.
 *
 * This class deliberately knows nothing about NgRx, the router, Material
 * controls, views, or row selection. State is supplied as value objects via
 * `setInput`, making the source usable by both table renderers.
 */
export class IbTableLocalDataSource<T> extends DataSource<T> {
  private readonly _data = new BehaviorSubject<T[]>([]);
  private readonly _renderData = new BehaviorSubject<T[]>([]);
  private readonly _totalCount = new BehaviorSubject<number>(0);
  private _input: IbLocalDataSourceInput = { ...IB_LOCAL_DS_DEFAULT_INPUT };
  private _columns: Record<string, IbColumn<unknown>> = {};
  private _aggregationFunctions: IbAggregate[] = [];

  /** Rows remaining after filtering, before sorting and pagination. */
  filteredData: T[] = [];
  /** Rows after filtering and sorting, before pagination. */
  orderedData: T[] = [];
  /** Rows on the current page. */
  currentPageData: T[] = [];
  /** Current aggregation values for the filtered set and current page. */
  aggregatedData: Record<string, IbAggregateResult> = {};

  readonly totalCount$: Observable<number> = this._totalCount.asObservable();
  readonly capabilities: ReadonlySet<IbDataSourceCapability> = new Set([
    IbDataSourceCapability.FullExport,
    IbDataSourceCapability.GlobalAggregation,
  ]);

  /** Typed local sorting extension point. */
  sortData: (data: T[], sort: Sort, columns: Record<string, IbColumn<unknown>>) => T[] =
    (data, sort, columns) => this.defaultSortData(data, sort, columns);

  /** Typed local filtering extension point. */
  filterPredicate: (
    data: T,
    filter: Record<string, unknown>,
    columns: Record<string, IbColumn<unknown>>,
  ) => boolean = (data, filter, columns) => this.defaultFilterPredicate(data, filter, columns);

  constructor(initialData: T[] = [], aggregationFunctions: IbAggregate[] = []) {
    super();
    this._aggregationFunctions = aggregationFunctions;
    this.data = initialData;
  }

  get data(): T[] {
    return this._data.value;
  }

  set data(value: T[]) {
    this._data.next(Array.isArray(value) ? value : []);
    this.recompute();
  }

  get input(): IbLocalDataSourceInput {
    return { ...this._input, aggregatedColumns: { ...this._input.aggregatedColumns } };
  }

  setInput(value: Partial<IbLocalDataSourceInput>): void {
    this._input = {
      ...this._input,
      ...value,
      aggregatedColumns: value.aggregatedColumns
        ? { ...value.aggregatedColumns }
        : { ...this._input.aggregatedColumns },
    };
    this.recompute();
  }

  setColumns(columns: IbColumn<unknown>[]): void {
    this._columns = columns.reduce<Record<string, IbColumn<unknown>>>((result, column) => {
      result[column.name()] = column;
      return result;
    }, {});
    this.recompute();
  }

  setAggregationFunctions(functions: IbAggregate[]): void {
    this._aggregationFunctions = functions;
    this.recompute();
  }

  getFilteredData(): T[] {
    return [...this.filteredData];
  }

  getOrderedData(): T[] {
    return [...this.orderedData];
  }

  getCurrentPageData(): T[] {
    return [...this.currentPageData];
  }

  connect(): BehaviorSubject<T[]> {
    return this._renderData;
  }

  /**
   * A consumer disconnect must not tear down processing for other consumers.
   * The pipeline is synchronous and state-driven, so there is no subscription
   * to dispose here.
   */
  disconnect(): void {}

  private recompute(): void {
    const { sort, rawFilter, pageIndex, pageSize, aggregatedColumns } = this._input;
    this.filteredData = !rawFilter || Object.keys(rawFilter).length === 0
      ? [...this.data]
      : this.data.filter((row) => this.filterPredicate(row, rawFilter, this._columns));
    this.orderedData = sort?.active && sort.direction
      ? this.sortData([...this.filteredData], sort, this._columns)
      : [...this.filteredData];
    const size = pageSize > 0 ? pageSize : this.orderedData.length;
    const start = Math.max(pageIndex, 0) * size;
    this.currentPageData = size > 0 ? this.orderedData.slice(start, start + size) : [];
    this._totalCount.next(this.filteredData.length);
    this.aggregate(aggregatedColumns);
    this._renderData.next([...this.currentPageData]);
  }

  private aggregate(aggregatedColumns: Record<string, string>): void {
    this.aggregatedData = {};
    for (const [columnName, functionId] of Object.entries(aggregatedColumns)) {
      const aggregate = this._aggregationFunctions.find((item) => item.id === functionId);
      if (!aggregate) continue;
      const values = this.orderedData.map((row) => this.columnValue(row, columnName));
      const pageValues = this.currentPageData.map((row) => this.columnValue(row, columnName));
      this.aggregatedData[columnName] = {
        total: aggregate.aggregateData(values),
        currentPage: aggregate.aggregateData(pageValues),
      };
    }
  }

  private defaultSortData(
    data: T[],
    sort: Sort,
    columns: Record<string, IbColumn<unknown>>,
  ): T[] {
    const column = columns[sort.active];
    if (!column) return data;
    const direction = sort.direction === "desc" ? -1 : 1;
    return data.sort((left, right) => {
      const a = column.sortingDataAccessor()(left, sort.active);
      const b = column.sortingDataAccessor()(right, sort.active);
      if (a == null && b == null) return 0;
      if (a == null) return 1 * direction;
      if (b == null) return -1 * direction;
      return (a > b ? 1 : a < b ? -1 : 0) * direction;
    });
  }

  private defaultFilterPredicate(
    row: T,
    filter: Record<string, unknown>,
    columns: Record<string, IbColumn<unknown>>,
  ): boolean {
    return Object.entries(filter).every(([name, criterion]) => {
      if (criterion == null || criterion === "") return true;
      const column = columns[name];
      const value = this.columnValue(row, name);
      if (column && this.isFilterDef(criterion)) {
        return applyFilter(criterion, column.filterDataAccessor()(row, name));
      }
      if (Array.isArray(criterion)) return criterion.includes(value as never);
      if (typeof criterion === "object") return JSON.stringify(value) === JSON.stringify(criterion);
      return String(value ?? "").toLowerCase().includes(String(criterion).toLowerCase());
    });
  }

  private columnValue(row: T, name: string): unknown {
    const column = this._columns[name];
    return column ? column.filterDataAccessor()(row, name) : (row as Record<string, unknown>)[name];
  }

  private isFilterDef(value: unknown): value is IbFilterDef {
    return typeof value === "object" && value !== null && "operator" in value && "value" in value;
  }
}

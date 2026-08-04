import { DataSource } from "@angular/cdk/collections";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { BehaviorSubject, Observable, Subject, Subscription, merge, of } from "rxjs";
import { IbFilter } from "../kai-filter/filter.component";
import { IbFilterSyntax } from "../kai-filter/filter.types";
import { applyFilter } from "../kai-filter/filters";
import { IbAggregate, IbAggregateResult } from "./cells";
import { IbColumn } from "./columns";
import { IbTableLocalDataSource } from "./local-data-source";

/**
 * @deprecated Use {@link IbTableLocalDataSource}. This class only bridges the
 * legacy Material-control API to the value-object local data source.
 */
export class IbTableDataSource<T, P extends MatPaginator = MatPaginator> extends DataSource<T> {
  private readonly local = new IbTableLocalDataSource<T>();
  private _sort: MatSort | null = null;
  private _paginator: P | null = null;
  private _filter: IbFilter | null = null;
  private _columns: Record<string, IbColumn<unknown>> = {};
  private _sortedColumns: IbColumn<unknown>[] = [];
  private _subscriptions: Subscription[] = [];
  private _data = new BehaviorSubject<T[]>([]);

  /** Compatibility fields retained for existing table integrations. */
  tableName = "";
  /** @deprecated Selection state is owned by the component; retained for export compatibility. */
  selectionColumn: { selection: SelectionModel<T> } | null = null;
  view: unknown = null;
  protected readonly store = { dispatch: (_action: unknown): void => undefined };
  readonly _renderData = new BehaviorSubject<T[]>([]);
  _renderChangesSubscription: Subscription | null = null;
  private _renderConsumers = 0;
  sortState: Sort = { active: "", direction: "" };
  aggregatedColumns: Record<string, string> = {};
  aggregatedData: Record<string, IbAggregateResult> = {};
  aggregationFunctions: IbAggregate[] = [];
  readonly aggregate = new Subject<{ columnName: string; function: string }>();

  /** Legacy local sorting extension point. */
  sortData: (data: T[], sort: MatSort) => T[] = (data, sort) => {
    const state: Sort = { active: sort.active, direction: sort.direction };
    return this.localSortData(data, state);
  };

  /** Legacy local filtering extension point. */
  filterPredicate: (data: T, filter: IbFilterSyntax) => boolean = (data, filter) =>
    Object.entries(filter).every(([name, criterion]) => {
      const column = this._columns[name];
      if (!column) throw Error(`ib-filter: column ${name} not found`);
      return applyFilter(criterion, column.filterDataAccessor()(data, name));
    });

  constructor(initialData: T[] = []) {
    super();
    this.data = initialData;
    this.aggregate.subscribe(({ columnName, function: functionId }) => {
      this.aggregatedColumns = { ...this.aggregatedColumns, [columnName]: functionId };
      this.local.setInput({ aggregatedColumns: this.aggregatedColumns });
      this.syncDerivedState();
    });
  }

  get data(): T[] {
    return this._data.value;
  }

  set data(value: T[]) {
    const normalized = Array.isArray(value) ? value : [];
    this._data.next(normalized);
    this.local.data = normalized;
    this.syncDerivedState();
  }

  get filteredData(): T[] {
    return this.local.filteredData;
  }

  set filteredData(value: T[]) {
    this.local.filteredData = value;
  }

  get sort(): MatSort | null {
    return this._sort;
  }

  set sort(value: MatSort | null) {
    this._sort = value;
    this.replaceSubscription("sort", value ? merge(value.sortChange, value.initialized).subscribe(() => this.updateSort()) : null);
    this.updateSort();
  }

  get paginator(): P | null {
    return this._paginator;
  }

  set paginator(value: P | null) {
    this._paginator = value;
    this.replaceSubscription("page", value ? merge(value.page, value.initialized).subscribe(() => this.updatePage()) : null);
    this.updatePage();
  }

  get filter(): IbFilter | null {
    return this._filter;
  }

  set filter(value: IbFilter | null) {
    this._filter = value;
    this.replaceSubscription("filter", value ? merge(value.ibFilterUpdated, value.initialized).subscribe(() => this.updateFilter()) : null);
    this.updateFilter();
  }

  get columns(): Record<string, IbColumn<unknown>> {
    return this._columns;
  }

  set columns(value: IbColumn<unknown>[]) {
    this._columns = value.reduce<Record<string, IbColumn<unknown>>>((result, column) => {
      result[column.name()] = column;
      return result;
    }, {});
    this._sortedColumns = [...value];
    this.local.setColumns(value);
    this.syncDerivedState();
  }

  get sortedColumns(): IbColumn<unknown>[] {
    return this._sortedColumns;
  }

  applySortOnColumn(sorted: string[]): void {
    this._sortedColumns = [...this._sortedColumns].sort((a, b) => sorted.indexOf(a.name()) - sorted.indexOf(b.name()));
  }

  initializeSortState(sort: Sort): void {
    this.sortState = { active: sort?.active ?? "", direction: sort?.direction ?? "" };
    this._sort?.sort({ id: this.sortState.active, start: this.sortState.direction, disableClear: true });
    this.updateSort();
  }

  _filterData(data: T[]): T[] {
    this.data = data;
    return this.local.filteredData;
  }

  _orderData(data: T[]): T[] {
    return this.localSortData(data, this.sortState);
  }

  _pageData(data: T[]): T[] {
    const pageIndex = this._paginator?.pageIndex ?? 0;
    const pageSize = this._paginator?.pageSize ?? data.length;
    return data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
  }

  _aggregatePaginatedData(data: T[]): T[] {
    return data;
  }

  connect(): BehaviorSubject<T[]> {
    this._renderConsumers++;
    if (!this._renderChangesSubscription) {
      this._renderChangesSubscription = this.local.connect().subscribe((rows) => this._renderData.next(rows));
    }
    return this._renderData;
  }

  disconnect(): void {
    this._renderConsumers = Math.max(0, this._renderConsumers - 1);
    if (this._renderConsumers === 0) {
      this._renderChangesSubscription?.unsubscribe();
      this._renderChangesSubscription = null;
    }
  }

  private updateSort(): void {
    if (!this._sort) return;
    this.sortState = { active: this._sort.active, direction: this._sort.direction };
    this.local.setInput({ sort: this.sortState });
    this.syncDerivedState();
  }

  private updatePage(): void {
    if (!this._paginator) return;
    this.local.setInput({ pageIndex: this._paginator.pageIndex, pageSize: this._paginator.pageSize });
    this.syncDerivedState();
  }

  private updateFilter(): void {
    if (!this._filter) return;
    this.local.setInput({ rawFilter: this._filter.value });
    this.syncDerivedState();
  }

  private syncDerivedState(): void {
    this.aggregatedData = this.local.aggregatedData;
    if (this._paginator) this._paginator.length = this.local.filteredData.length;
  }

  private localSortData(data: T[], sort: Sort): T[] {
    const column = this._columns[sort.active];
    if (!column || !sort.direction) return data;
    return data.sort((a, b) => {
      const left = column.sortingDataAccessor()(a, sort.active);
      const right = column.sortingDataAccessor()(b, sort.active);
      const result = left > right ? 1 : left < right ? -1 : 0;
      return sort.direction === "desc" ? -result : result;
    });
  }

  private replaceSubscription(kind: string, subscription: Subscription | null): void {
    const index = ["sort", "page", "filter"].indexOf(kind);
    this._subscriptions[index]?.unsubscribe();
    this._subscriptions[index] = subscription;
  }
}

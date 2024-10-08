import { DataSource } from "@angular/cdk/collections";
import { inject } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  merge,
  of as observableOf,
} from "rxjs";
import { filter, map } from "rxjs/operators";
import { IbFilter } from "../kai-filter/filter.component";
import { IbFilterDef, IbFilterSyntax } from "../kai-filter/filter.types";
import { applyFilter } from "../kai-filter/filters";
import { IbTableViewGroup } from "../views/components/table-view-group/table-view-group.component";
import { IView } from "../views/store/views/table-view";
import { IbAggregateResult } from "./cells";
import { IbColumn, IbSelectionColumn } from "./columns";
import { IB_AGGREGATE } from "./tokens";
import { Store } from "@ngrx/store";
import { urlStateActions } from "./store/url-state/actions";

/**
 * Data source that accepts a client-side data array and includes native support of filtering,
 * sorting (using MatSort), and pagination (using MatPaginator).
 *
 * Allows for sort customization by overriding sortingDataAccessor, which defines how data
 * properties are accessed. Also allows for filter customization by overriding filterPredicate,
 * which defines how row data is converted to a string for filter matching.
 */
export class IbTableDataSource<
  T,
  P extends MatPaginator = MatPaginator
> extends DataSource<T> {
  /** Stream that emits when a new data array is set on the data source. */
  protected readonly _data: BehaviorSubject<T[]>;

  /** Stream emitting render data to the table (depends on ordered data changes). */
  protected readonly _renderData = new BehaviorSubject<T[]>([]);

  /** Used to react to internal changes of the paginator that are made by the data source itself. */
  private readonly _internalPageChanges = new Subject<void>();

  /**
   * Subscription to the changes that should trigger an update to the table's rendered rows, such
   * as filtering, sorting, pagination, or base data changes.
   */
  _renderChangesSubscription: Subscription | null = null;

  _viewChangesSubscription: Subscription | null = null;

  tableName: string;
  /**
   * The filtered set of data that has been matched by the filter string, or all the data if there
   * is no filter. Useful for knowing the set of data the table represents.
   * For example, a 'selectAll()' function would likely want to select the set of filtered data
   * shown to the user rather than all the data.
   */
  filteredData: T[];

  /** Array of data that should be rendered by the table, where each object represents one row. */
  get data() {
    return this._data.value;
  }

  set data(data: T[]) {
    data = Array.isArray(data) ? data : [];
    this._data.next(data);
    this._initializeFilters(data);
    // Normally the `filteredData` is updated by the re-render
    // subscription, but that won't happen if it's inactive.
    if (!this._renderChangesSubscription) {
      this._filterData(data);
    }
  }

  /**
   * Instance of the IbFilter component used by the table to filter its data. Filter changes
   * emitted by the IbFilter will trigger an update to the table's rendered data.
   */
  get filter(): IbFilter | null {
    return this._filter;
  }

  set filter(f: IbFilter | null) {
    this._filter = f;
    this._initializeFilters(this.data);
    this._updateChangeSubscription();
  }

  private _filter: IbFilter | null;

  /**
   * Instance of the MatSort directive used by the table to control its sorting. Sort changes
   * emitted by the MatSort will trigger an update to the table's rendered data.
   */
  get sort(): MatSort | null {
    return this._sort;
  }

  set sort(sort: MatSort | null) {
    this._sort = sort;
    this._updateChangeSubscription();
  }

  private _sort: MatSort | null;

  _sortState: Sort = {
    active: "",
    direction: "",
  }
  get sortState(){
    return {
      active: this._sortState.direction !== '' ? this._sortState.active : '',
      direction: this._sortState.direction
    }
  }
  set sortState(sort: Sort){
    this._sortState = {
      active: sort?.active ?? '',
      direction: sort?.direction ?? ''
    };
  }

  /**
   * Instance of the paginator component used by the table to control what page of the data is
   * displayed. Page changes emitted by the paginator will trigger an update to the
   * table's rendered data.
   *
   * Note that the data source uses the paginator's properties to calculate which page of data
   * should be displayed. If the paginator receives its properties as template inputs,
   * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
   * initialized before assigning it to this data source.
   */
  get paginator(): P | null {
    return this._paginator;
  }

  set paginator(paginator: P | null) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }

  private _paginator: P | null;

  get columns(): Record<string, IbColumn<unknown>> {
    return this._columns;
  }

  set columns(columns: IbColumn<unknown>[]) {
    this._columns = columns.reduce((acc, c) => ({ [c.name]: c, ...acc }), {});
    this._sortedColumns = columns;
  }

  get sortedColumns() {
    return this._sortedColumns;
  }

  public applySortOnColumn(sorted: string[]){
    this._sortedColumns = this._sortedColumns.sort((a, b) => {
      return sorted.indexOf(a.name) - sorted.indexOf(b.name);
    })
  }

  private _columns: Record<string, IbColumn<unknown>> = {};
  private _sortedColumns: IbColumn<unknown>[] = [];

  set view(view: IbTableViewGroup | null) {
    this._view = view;
    this._updateViewChangeSubscription();
  }

  get view() {
    return this._view;
  }

  private _view: IbTableViewGroup | null;

  /**
   * Aggregated data by column name.
   */
  aggregatedData: Record<string, IbAggregateResult> = {};
  /**
   * Dictionary of columns to aggregate and the function (function id) to apply.
   * Note: this structure is serialized within a view
   */
  aggregatedColumns: Record<string, string> = {};
  aggregationFunctions = inject(IB_AGGREGATE);
  protected store = inject(Store);

  /**
   * Used to trigger the aggregation of a column by the user.
   *
   * IbTableViewGroup listens to this stream to detect state changes
   */
  aggregate = new Subject<{ columnName: string; function: string }>();
  /**
   * Whether the table should display the aggregation footer.
   * (this reeks...)
   */
  get shouldDisplayAggregationFooter() {
    return Object.values(this.columns).filter((c) => c.aggregate).length > 0;
  }

  selectionColumn: IbSelectionColumn | null;

  /**
   * Gets a sorted copy of the data array based on the state of the MatSort. Called
   * after changes are made to the filtered data or when sort changes are emitted from MatSort.
   * By default, the function retrieves the active sort and its direction and compares data
   * by retrieving data using the sortingDataAccessor.
   * @param data The array of data that should be sorted.
   * @param sort The connected MatSort that holds the current sort state.
   */
  sortData: (data: T[], sort: MatSort) => T[] = (
    data: T[],
    sort: MatSort
  ): T[] => {
    const active = sort.active;
    const direction = sort.direction;
    if (!active || direction == "") {
      return data;
    }

    const column = this._columns[active];
    return data.sort((a, b) => {
      let valueA = column.sortingDataAccessor(a, active);
      let valueB = column.sortingDataAccessor(b, active);

      // If there are data in the column that can be converted to a number,
      // it must be ensured that the rest of the data
      // is of the same type so as not to order incorrectly.
      const valueAType = typeof valueA;
      const valueBType = typeof valueB;

      if (valueAType !== valueBType) {
        if (valueAType === "number") {
          valueA += "";
        }
        if (valueBType === "number") {
          valueB += "";
        }
      }

      // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
      // one value exists while the other doesn't. In this case, existing value should come last.
      // This avoids inconsistent results when comparing values to undefined/null.
      // If neither value exists, return 0 (equal).
      let comparatorResult = 0;
      if (valueA != null && valueB != null) {
        // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
        if (valueA > valueB) {
          comparatorResult = 1;
        } else if (valueA < valueB) {
          comparatorResult = -1;
        }
      } else if (valueA != null) {
        comparatorResult = 1;
      } else if (valueB != null) {
        comparatorResult = -1;
      }

      return comparatorResult * (direction == "asc" ? 1 : -1);
    });
  };

  /**
   * Checks if a data object matches the data source's filter.
   * @param data Data object used to check against the filter.
   * @param filter Filter that has been set on the data source.
   * @returns Whether the filter matches against the data
   */
  filterPredicate: (data: T, filter: IbFilterSyntax) => boolean = (
    data: T,
    filter: IbFilterSyntax
  ): boolean => {
    const { ibSearchBar, ...filters } = filter;
    const matchesSearchBar = this.applySearchBarFilter(data, ibSearchBar);

    const matches = Object.entries(filters).every(([columnName, condition]) => {
      const column = this.columns[columnName];
      if (!column) {
        throw Error(`ib-filter: column ${columnName} not found`);
      }

      const filterValue = column.filterDataAccessor(data, columnName);
      return applyFilter(condition, filterValue);
    });

    return matches && matchesSearchBar;
  };

  private applySearchBarFilter = (data: any, filter: IbFilterDef) => {
    if (!filter) {
      return true;
    }

    const dataStr = Object.keys(data as unknown as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        const column = this.columns[key];
        const value = column ? column.filterDataAccessor(data, key) : data[key];
        return currentTerm + value + "◬";
      }, "")
      .toLowerCase();

    return applyFilter(filter, dataStr);
  };

  constructor(initialData: T[] = []) {
    super();
    this._data = new BehaviorSubject<T[]>(initialData);
    this._updateChangeSubscription();
    this.aggregate.subscribe((target) => {
      this.aggregatedColumns[target.columnName] = target.function;
      this.store.dispatch(urlStateActions.setAggregatedColumns({tableName: this.tableName, params: {...this.aggregatedColumns}}));
      this._aggregateData(this.filteredData);
      this._aggregatePaginatedData(
        this._pageData(this._orderData(this.filteredData))
      );
    });
  }

  private _initializeFilters(data: any[]) {
    this.filter?.filters.forEach((f) => f.initializeFromColumn(data));
  }

  /**
   * Subscribe to changes that should trigger an update to the table's rendered rows. When the
   * changes occur, process the current state of the filter, sort, and pagination along with
   * the provided base data and send it to the table for rendering.
   */
  _updateChangeSubscription() {
    // Sorting and/or pagination should be watched if sort and/or paginator are provided.
    // The events should emit whenever the component emits a change or initializes, or if no
    // component is provided, a stream with just a null event should be provided.
    // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
    // pipeline can progress to the next step. Note that the value from these streams are not used,
    // they purely act as a signal to progress in the pipeline.
    const sortChange: Observable<Sort | null | void> = this._sort
      ? (merge(
          this.sort.sortChange,
          this.sort.initialized
        ) as Observable<Sort | void>)
      : observableOf(null);
    const pageChange: Observable<PageEvent | null | void> = this._paginator
      ? (merge(
          this._paginator.page,
          this._internalPageChanges,
          this._paginator.initialized
        ) as Observable<PageEvent | void>)
      : observableOf(null);
    const filterChange: Observable<IbFilterSyntax | null | void> = this._filter
      ? merge(this._filter.ibFilterUpdated, this._filter.initialized)
      : observableOf(null);
    const dataStream = this._data;
    // Watch for base data or filter changes to provide a filtered set of data.
    const filteredData = combineLatest([dataStream, filterChange]).pipe(
      map(([data, filterChange]) => {
        if(this.filter?.initialized){
          this.store.dispatch(urlStateActions.setFilters({tableName: this.tableName, params: this.filter?.selectedCriteria ?? {}}));
        }
        return this._filterData(data)
      }),
      map((data) => this._aggregateData(data))
    );
    // Watch for filtered data or sort changes to provide an ordered set of data.
    const orderedData = combineLatest([filteredData, sortChange]).pipe(
      map(([data, sort]) => {
        if(sort){
          this.sortState = this.sort;
          this.store.dispatch(urlStateActions.setSort({tableName: this.tableName, params: this.sortState}));
        }
        return this._orderData(data);
      })
    );
    // Watch for ordered data or page changes to provide a paged set of data.
    const paginatedData = combineLatest([orderedData, pageChange]).pipe(
      map(([data]) => this._pageData(data)),
      map((data) => this._aggregatePaginatedData(data))
    );
    // Watched for paged data changes and send the result to the table to render.
    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = paginatedData.subscribe((data) => {
      this._renderData.next(data);
    });
  }

  private _updateViewChangeSubscription() {
    this.view.defaultView.data = {
      filter: this.filter.initialRawValue,
      pageSize: this.paginator.pageSize,
      aggregatedColumns: this.aggregatedColumns,
      sort: {
        ...this.sortState
      }
    };

    this.view.viewDataAccessor = () => {
      return {
        filter: this.filter.selectedCriteria,
        pageSize: this.paginator.pageSize,
        aggregatedColumns: this.aggregatedColumns,
        sort: {
          ...this.sortState
        },
      }
    };

    const changes$ = merge(
      this.filter.ibQueryUpdated,
      this.paginator.page,
      this.aggregate,
      this.sort.sortChange
    );
    this.view.handleStateChanges(changes$);

    this._viewChangesSubscription?.unsubscribe();
    this._viewChangesSubscription = this.view._activeView
     // Skip initial view, initialization come from querystring
      .pipe(filter((view) => !!view && !view.initial))
      .subscribe(this.handleViewChange);
  }

  private handleViewChange = (view: IView) => {
    this.paginator.firstPage();
    this.paginator.pageSize = view.data.pageSize;
    this.aggregatedColumns = { ...view.data.aggregatedColumns };
    this.filter.value = view.data.filter;
    this.sortState = view.data.sort;
    this.store.dispatch(urlStateActions.handleViewChange({
      tableName: this.tableName,
      params: {
        view: view.id,
        pageSize: view.data.pageSize,
        page: 0,
        filters: view.data.filter,
        aggregatedColumns: view.data.aggregatedColumns,
        sort: {
          active: view.data.sort.active,
          direction: view.data.sort.direction,
        },
      }
    }));
  };

  /**
   * Returns a filtered data array where each row satisfies the filter.
   * If no filter is set, returns the data array as provided.
   */
  _filterData(data: T[]) {
    this.selectionColumn?.selection.clear();
    this.filteredData = !this.filter?.value
      ? data
      : data.filter((obj) => this.filterPredicate(obj, this.filter.value));

    if (this.paginator) {
      this._updatePaginator(this.filteredData.length);
    }

    return this.filteredData;
  }

  /**
   * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
   * data array as provided. Uses the default data accessor for data lookup, unless a
   * sortDataAccessor function is defined.
   */
  _orderData(data: T[]): T[] {
    // If there is no active sort or direction, return the data without trying to sort.
    if (!this.sort) {
      return data;
    }

    return this.sortData(data.slice(), this.sort);
  }

  /**
   * Returns a paged slice of the provided data array according to the provided paginator's page
   * index and length. If there is no paginator provided, returns the data array as provided.
   */
  _pageData(data: T[]): T[] {
    if (!this.paginator) {
      return data;
    }

    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  /**
   * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
   * index does not exceed the paginator's last page. Values are changed in a resolved promise to
   * guard against making property changes within a round of change detection.
   */
  _updatePaginator(filteredDataLength: number) {
    Promise.resolve().then(() => {
      const paginator = this.paginator;

      if (!paginator) {
        return;
      }

      paginator.length = filteredDataLength;

      // If the page index is set beyond the page, reduce it to the last page.
      if (paginator.pageIndex > 0) {
        const lastPageIndex =
          Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
        const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);

        if (newPageIndex !== paginator.pageIndex) {
          paginator.pageIndex = newPageIndex;

          // Since the paginator only emits after user-generated changes,
          // we need our own stream so we know to should re-render the data.
          this._internalPageChanges.next();
        }
      }
    });
  }

  _aggregateData(data: T[]): T[] {
    for (const [columnName, fun] of Object.entries(this.aggregatedColumns)) {
      const f = this.aggregationFunctions.find((f) => f.id === fun);
      if (!f) {
        continue;
      }
      this.aggregatedData[columnName] = {
        ...(this.aggregatedData[columnName] ?? {}),
        total: f.aggregateData(data.map((i) => i[columnName])),
      };
    }
    return data;
  }

  _aggregatePaginatedData(data: T[]): T[] {
    for (const [columnName, fun] of Object.entries(this.aggregatedColumns)) {
      const f = this.aggregationFunctions.find((f) => f.id === fun);
      if (!f) {
        continue;
      }
      this.aggregatedData[columnName] = {
        ...(this.aggregatedData[columnName] ?? {}),
        currentPage: f.aggregateData(data.map((i) => i[columnName])),
      };
    }
    return data;
  }

  /**
   * Used by the MatTable. Called when it connects to the data source.
   */
  connect() {
    if (!this._renderChangesSubscription) {
      this._updateChangeSubscription();
    }

    return this._renderData;
  }

  /**
   * Used by the MatTable. Called when it disconnects from the data source.
   */
  disconnect() {
    this._viewChangesSubscription?.unsubscribe();
    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = null;
  }
}

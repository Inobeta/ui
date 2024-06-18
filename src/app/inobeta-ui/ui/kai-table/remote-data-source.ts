import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  merge,
  of,
} from "rxjs";
import { catchError, debounceTime, map, switchMap } from "rxjs/operators";
import { IbTableDataSource } from "./table-data-source";
import { IbKaiTableState } from "./table.types";
import { urlStateActions } from "./store/url-state/actions";

export type IbFetchDataResponse<T> = {
  /**
   * Subset of rows returned by the server.
   */
  data: T[];
  /**
   * Total row count of the query without pagination.
   */
  totalCount: number;
};

export abstract class IbTableRemoteDataSource<
  T,
  V = Record<string, any>
> extends IbTableDataSource<T> {
  private _refresh = new Subject<void>();

  _renderChangesSubscription: Subscription | null = null;
  get state() {
    return this._state.value;
  }

  set state(value) {
    this._state.next(value);
  }

  readonly _state = new BehaviorSubject<IbKaiTableState>("loading");

  _updateChangeSubscription() {
    if (!this._state) {
      return;
    }

    const sortChange: Observable<Sort | null | void> = this.sort
      ? (merge(
          this.sort.sortChange,
          this.sort.initialized
        ) as Observable<Sort | void>)
      : of(null);

    const pageChange: Observable<PageEvent | null | void> = this.paginator
      ? (merge(
          this.paginator.page,
          // this._internalPageChanges,
          this.paginator.initialized
        ) as Observable<PageEvent | void>)
      : of(null);

    const filterChange: Observable<Record<string, any> | null | void> = this
      .filter
      ? merge(this.filter.ibQueryUpdated, this.filter.initialized)
      : of(null);

    const refresh = this._refresh?.asObservable();
    const pipeline = combineLatest([filterChange, sortChange, pageChange]);

    const dataChange = merge(refresh, pipeline).pipe(
      map(() => this.state = "loading"),
      debounceTime(500),
      map((v) => {
        if(this.sort?.active !== this.sortState?.active || this.sort?.direction !== this.sortState?.direction){
          this.sortState = this.sort;
        }
        if(this.filter?.initialized){
          this.store.dispatch(urlStateActions.setRemoteDatasourceParams({
            tableName: this.tableName,
            filters: this.filter?.selectedCriteria ?? {},
            sort: this.sortState ?? {active: '', direction: ''}
          }));
        }
        else if(this.sort?.active !== this.sortState?.active || this.sort?.direction !== this.sortState?.direction){
          this.store.dispatch(urlStateActions.setSort({tableName: this.tableName, params: this.sortState}));
        }
        return v
      }),
      switchMap(() => {
        this.state = "loading";
        return this.fetchData(
          this.sort,
          this.paginator,
          this.filter.query as V
        ).pipe(
          catchError(() => {
            this.state = "http_error";
            return of(null);
          })
        );
      }),
      map((result) => {
        if (result === null || result === undefined) {
          return [];
        }

        this.state = "idle";
        this.paginator.length = result.totalCount;
        return result.data;
      }),
      map((data) => this._filterData(data)),
      map((data) => this._aggregatePaginatedData(data))
    );

    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = dataChange.subscribe((data) =>
      this._renderData.next(data)
    );
  }

  refresh() {
    this._refresh.next();
  }

  /** Disable _filterData */
  _filterData(data: T[]): T[] {
    return (this.filteredData = data);
  }

  /**
   * Data fetching strategy
   *
   * ```typescript
   * class ProductDataSource extends IbTableRemoteDataSource<Product> {
   *   private http = inject(HttpClient)
   *
   *   fetchData(
   *     sort: MatSort,
   *     page: MatPaginator
   *   ): Observable<IbFetchDataResponse<Product>> {
   *       return this.http.get("/products", {
   *         params: {
   *           sort: sort.active,
   *           order: sort.direction,
   *           page: page.pageIndex + 1,
   *           per_page: page.pageSize
   *         }
   *       }).pipe(
   *         map((result) => ({
   *           data: result.items,
   *           totalCount: result.total_count
   *         }))
   *       );
   *   }
   * }
   * ```
   *
   * @param sort Sort state
   * @param page Paginator state
   * @param filter Filter applied
   * @returns Observable of data and total count
   */
  abstract fetchData(
    sort: MatSort,
    page: MatPaginator,
    filter?: V
  ): Observable<IbFetchDataResponse<T>>;
}
